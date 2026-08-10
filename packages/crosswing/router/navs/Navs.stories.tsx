import { Meta, StoryObj } from "@storybook/react";
import { use } from "react";
import { expect, userEvent, within } from "storybook/test";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Link } from "../Link.js";
import { RouterContext } from "../context/RouterContext.js";
import { Redirect } from "../redirect/Redirect.js";
import { BrowserSimulator } from "../storybook/BrowserSimulator.js";
import { NavRoute, Navs } from "./Navs.js";

export default {
  component: Navs,
  decorators: [CrosswingAppDecorator({ layout: "mobile" })],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Navs>;

function BookPage({ bookId }: { bookId: string }) {
  return (
    <div className="page">
      <h1>BOOK {bookId}</h1>
      <Link to={`/books/${bookId}/imports/imp1`}>Start import</Link>
    </div>
  );
}

// Stands in for RecipeImportPage once an import has finished: it hops straight
// to the new recipe, replacing itself in history (replace: true).
function ImportPage({ bookId }: { bookId: string }) {
  return <Redirect to={`/books/${bookId}/recipes/rec1`} />;
}

function RecipePage({ bookId, recipeId }: { bookId: string; recipeId: string }) {
  const { back, history } = use(RouterContext);
  return (
    <div className="page">
      <h1>RECIPE {recipeId}</h1>
      {/* The Navs-computed back target — the heart of the regression. */}
      <div>back: {back ?? "(none)"}</div>
      <button onClick={() => back && history.navigate(back)}>Back</button>
    </div>
  );
}

function RecipeNavs() {
  return (
    <BrowserSimulator initialPath="/books/bookA">
      <Navs>
        <NavRoute render={() => <div className="page">HOME</div>} />
        <NavRoute path="books/:bookId" render={({ bookId }) => <BookPage bookId={bookId} />} />
        <NavRoute
          path="books/:bookId/imports/:importId"
          render={({ bookId }) => <ImportPage bookId={bookId} />}
        />
        <NavRoute
          path="books/:bookId/recipes/:recipeId"
          render={({ bookId, recipeId }) => <RecipePage bookId={bookId} recipeId={recipeId} />}
        />
      </Navs>
    </BrowserSimulator>
  );
}

/**
 * Reproduces the recipe-import bug: landing on the import page, which redirects
 * (replace) to the finished recipe. A replace must swap the import page out of
 * the back stack rather than push the recipe on top of it — otherwise the back
 * button bounces import→recipe forever and a stale top item eats taps.
 */
export const RedirectReplacesImportInStack: StoryObj<typeof Navs> = {
  render: () => <RecipeNavs />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("start on the book", async () => {
      await expect(await canvas.findByText("BOOK bookA")).toBeVisible();
    });

    await step("start an import; it completes and redirects to the recipe", async () => {
      await userEvent.click(await canvas.findByText("Start import"));
      await expect(await canvas.findByText("RECIPE rec1")).toBeVisible();
    });

    await step("back skips the replaced import page and points at the book", async () => {
      // The fix: /books/bookA. Pre-fix this read /books/bookA/imports/imp1.
      await expect(await canvas.findByText("back: /books/bookA")).toBeInTheDocument();
    });

    await step("pressing back lands on the book (no import→recipe bounce)", async () => {
      await userEvent.click(await canvas.findByRole("button", { name: "Back" }));
      // The recipe is popped off the stack rather than re-pushed by a bounce.
      await expect(canvas.queryByText("RECIPE rec1")).not.toBeInTheDocument();
      await expect(await canvas.findByText("BOOK bookA")).toBeVisible();
    });
  },
};
