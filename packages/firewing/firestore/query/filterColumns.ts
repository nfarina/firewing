// @chatwing

/**
 * Filters a result object down to the SELECT columns from a parsed query.
 *
 * - "*" copies all remaining keys.
 * - Dotted paths like "profile.name.first" pluck nested values.
 * - "<col> AS <alias>" renames the output key.
 * - Backtick expressions like `` `data.foo + 1` AS foo `` are evaluated with
 *   the row's own keys (plus `data` and any caller-supplied `evalScope`) in
 *   scope.
 */
export function filterColumns(
  obj: any,
  columns: string[],
  { ret = {}, evalScope }: { ret?: any; evalScope?: Record<string, any> } = {},
): any {
  let nextAutoColumn = 1;

  for (const column of columns) {
    if (column === "*") {
      for (const key in obj) {
        if (ret[key] === undefined) {
          ret[key] = obj[key];
        }
      }
      continue;
    }

    const match = column.match(/^`(.+)`(?: AS (.+))?$/i);

    if (match) {
      const [, code, alias] = match;

      const scope: Record<string, any> = {
        data: obj,
        ...evalScope,
        ...obj,
      };

      const argNames = Object.keys(scope);
      const argValues = argNames.map((k) => scope[k]);
      const fn = new Function(...argNames, `return (${code})`);
      const result = fn(...argValues);
      ret[alias ?? `column${nextAutoColumn++}`] = result;
      continue;
    }

    const [columnName, alias] = column.includes(" AS ")
      ? column.split(" AS ")
      : column.split(" as ");
    const [key, ...rest] = columnName.split(".");

    if (obj[key] !== undefined) {
      if (rest.length > 0) {
        ret[alias ?? key] = ret[key] ?? {};
        filterColumns(obj[key], [rest.join(".")], {
          ret: ret[alias ?? key],
          evalScope,
        });
      } else {
        ret[alias ?? key] = obj[key];
      }
    }
  }

  return ret;
}
