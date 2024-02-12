import { StorybookConfig } from "@storybook/react-vite";

// Actually import these so `check-imports` script knows they're used.
import "@storybook/addon-actions";
import "@storybook/addon-essentials";

export default {
  stories: ["../packages/*/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: { strictMode: true },
  },
  docs: {
    autodocs: "tag",
  },
} satisfies StorybookConfig;
