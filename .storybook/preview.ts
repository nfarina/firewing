import { Preview } from "@storybook/react";
import timemachine from "timemachine";

timemachine.config({
  // The date of the first Crosswing commit.
  dateString: "April 16, 2023 21:59:00",
});

export default {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
} satisfies Preview;
