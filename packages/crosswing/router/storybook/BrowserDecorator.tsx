import { BrowserSimulator } from "./BrowserSimulator.js";

// Useful for hosting Storybook components designed to be presented
// in a mobile-app setting, with a working Router parent and address bar.
export const BrowserDecorator = (Story: () => any) => <BrowserSimulator children={<Story />} />;
