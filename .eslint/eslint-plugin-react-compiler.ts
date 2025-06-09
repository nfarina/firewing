import * as BabelParser from "@babel/parser";
import BabelTraverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import {
  compileProgram,
  parseConfigPragmaForTests,
  parsePluginOptions,
} from "babel-plugin-react-compiler";
import { Rule } from "eslint";
import type { Program } from "estree";

// @chatwing

const log = (...args: any[]) => {}; // console.log;

// Weird import issue with BabelTraverse.
const traverse = BabelTraverse["default"] as typeof BabelTraverse;

const parse = BabelParser.parse;

const USE_BABEL_PLUGIN = true;

// This plugin takes about 20ms per file, but in VSCode it runs on every
// keystroke. So we want to limit file checks to one every 5 seconds.
// Our `test` script shouldn't be affected, so errors will always be reported
// (eventually).
const checkTimes = new Map<string, number>();

// Add this near the top with other state variables
const errorCache = new Map<string, Array<Rule.ReportDescriptor>>();

/**
 * An ESLint plugin that attempts to actually run the React Compiler the way it
 * does in the Playground. This will tell us if the component or hook has any
 * issues that prevent it from being compiled. The eslint-plugin-react-compiler
 * plugin doesn't do this, and instead just checks for a small variety of
 * "Rules of React" problems.
 *
 * I wrote this before I knew about the `__unstable_donotuse_reportAllBailouts`
 * option in the official plugin. But it turns out to be useful because we
 * report the "compiler bailouts" with the correct location information,
 * compared to the official plugin. Also the speed is identical.
 */
export default {
  rules: {
    "react-compiler": {
      meta: {
        type: "problem",
        docs: {
          description: "Detect React Compiler issues",
          category: "Possible Errors",
          recommended: true,
        },
      },
      create(context) {
        return {
          Program(node) {
            const start = Date.now();
            const filename = context.filename;

            const lastCheckTime = checkTimes.get(filename);
            if (lastCheckTime && start - lastCheckTime < 5000) {
              const cachedErrors = errorCache.get(filename);
              if (cachedErrors) {
                for (const error of cachedErrors) {
                  context.report(error);
                }
              }
              return;
            }
            checkTimes.set(filename, start);

            // Create array to collect errors
            const errors: Array<Rule.ReportDescriptor> = [];

            const report = (descriptor: Rule.ReportDescriptor) => {
              errors.push(descriptor);
              context.report(descriptor);
            };

            if (USE_BABEL_PLUGIN) {
              tryBabelPluginCheckFile(context, node, report);
            } else {
              tryPlaygroundCheckFile(context, node, report);
            }

            // Cache the errors
            errorCache.set(filename, errors);

            log("Compiled in", Date.now() - start, "ms");
          },
        };
      },
    } satisfies Rule.RuleModule,
  },
};

//
// Uses the React Compiler Babel Plugin to check the file.
//

function tryBabelPluginCheckFile(
  context: Rule.RuleContext,
  prog: Program,
  report: (descriptor: Rule.ReportDescriptor) => void,
) {
  const sourceCode = context.sourceCode.text;
  const filename = context.filename;

  log("Checking", filename);

  // Parse the source code to get a Babel AST
  const ast = parse(sourceCode, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  // Create a NodePath for the Program
  let programPath;
  traverse(ast, {
    Program(path) {
      programPath = path;
    },
  });

  if (!programPath) {
    report({
      node: prog,
      message: "Failed to create Babel NodePath for Program",
    });
    return;
  }

  try {
    compileProgram(programPath, {
      // Use default plugin options, but override panicThreshold to
      // "all_errors" so all errors are thrown.
      opts: {
        ...parsePluginOptions({}),
        panicThreshold: "all_errors",
      },
      filename: filename ?? null,
      comments: ast.comments ?? [],
      code: sourceCode,
    });
    // log("Compiled program");
    // log(generate(programPath.node).code);
  } catch (error: any) {
    for (const detail of error.details ?? []) {
      report({
        node: detail.node,
        message: error.message,
        loc: detail.options.loc,
      });
    }
  }
}

//
// Uses "Playground" code to check the file. I didn't realize it at the time,
// but it doesn't match React Compiler really - it looks for all functions at
// ALL depths and tries to compile them.
//

// React-Compiler has since removed the runPlayground function, but I'm leaving
// this code here for reference.
const runPlayground = (...args: any[]): any => {
  throw new Error("Not implemented");
};

function tryPlaygroundCheckFile(
  context: Rule.RuleContext,
  node: Program,
  report: (descriptor: Rule.ReportDescriptor) => void,
) {
  try {
    playgroundCheckFile(context, node, report);
  } catch (error: any) {
    report({
      node,
      message: error.message,
      loc: error.loc,
    });
  }
}

function playgroundCheckFile(
  context: Rule.RuleContext,
  node: Program,
  report: (descriptor: Rule.ReportDescriptor) => void,
) {
  const { filename } = context;

  log("Checking", filename);

  // Only run on .ts and .tsx files
  if (!filename.endsWith(".ts") && !filename.endsWith(".tsx")) {
    log("Skipping (Not a TS or TSX file)", filename);
    return;
  }

  const sourceCode = context.sourceCode.text;

  // Use default config.
  const config = parseConfigPragmaForTests("", {
    compilationMode: "all",
  });

  const functions = parseFunctions(sourceCode, filename);

  let count = 0;
  const withIdentifier = (id) => {
    if (id != null && id.name != null) {
      return id;
    } else {
      return t.identifier(`anonymous_${count++}`);
    }
  };

  for (const fn of functions) {
    const id = withIdentifier(getFunctionIdentifier(fn));
    const type = getReactFunctionType(id);

    log("Checking", id?.name, type);

    if (type === "Other") {
      log("Skipping (Not a hook or component)", id?.name);
      return;
    }

    if (type === "Component" && !filename.endsWith(".tsx")) {
      log("Skipping (Component not in a TSX file)", id?.name);
      return;
    }

    // Pull any "/** */" comments from the function. We may need to look at
    // the parent path if the function is exported (as the "export" keyword
    // is on the parent path).
    const leadingComments =
      fn.node.leadingComments ?? fn.parentPath.node.leadingComments;

    if (
      leadingComments?.some((comment) =>
        comment.value.includes("@react-playground:skip"),
      )
    ) {
      // We ourselves are skipping this function.
      log("Skipping (@react-playground:skip)", id?.name);
      return;
    }

    try {
      const playgroundResults = runPlayground(fn, config, type);
      for (const result of playgroundResults) {
        // Just iterating is enough to throw any errors.
      }
    } catch (error: any) {
      for (const detail of error.details ?? []) {
        report({
          node: detail.node,
          message: error.message,
          loc: detail.options.loc,
        });
      }
    }
  }
}

//
// Copied and modified slightly from React Compiler playground source.
//

function parseFunctions(
  source: string,
  file: string,
): Array<
  | NodePath<t.FunctionDeclaration>
  | NodePath<t.ArrowFunctionExpression>
  | NodePath<t.FunctionExpression>
> {
  const items: Array<
    | NodePath<t.FunctionDeclaration>
    | NodePath<t.ArrowFunctionExpression>
    | NodePath<t.FunctionExpression>
  > = [];
  try {
    const ast = parse(source, {
      sourceFilename: file,
      plugins: ["typescript", "jsx"],
      sourceType: "module",
    });
    traverse(ast, {
      FunctionDeclaration(nodePath) {
        log("FunctionDeclaration", nodePath.node.id?.name);
        items.push(nodePath);
        nodePath.skip();
      },
      ArrowFunctionExpression(nodePath) {
        log("ArrowFunctionExpression");
        items.push(nodePath);
        nodePath.skip();
      },
      FunctionExpression(nodePath) {
        log("FunctionExpression", nodePath.node.id?.name);
        items.push(nodePath);
        nodePath.skip();
      },
    });
  } catch (e) {
    // Use context.report instead of console.error
    throw new Error(String(e));
  }
  log("Found", items.length, "functions");
  return items;
}

function getReactFunctionType(id: t.Identifier) {
  if (id != null) {
    if (isHookName(id.name)) {
      return "Hook";
    }

    const isPascalCaseNameSpace = /^[A-Z].*/;
    if (isPascalCaseNameSpace.test(id.name)) {
      return "Component";
    }
  }
  return "Other";
}

function isHookName(s: string): boolean {
  return /^use[A-Z0-9]/.test(s);
}

function getFunctionIdentifier(
  fn:
    | NodePath<t.FunctionDeclaration>
    | NodePath<t.ArrowFunctionExpression>
    | NodePath<t.FunctionExpression>,
) {
  if (fn.isArrowFunctionExpression()) {
    return null;
  }
  const id = fn.get("id");
  return Array.isArray(id) === false && id.isIdentifier() ? id.node : null;
}
