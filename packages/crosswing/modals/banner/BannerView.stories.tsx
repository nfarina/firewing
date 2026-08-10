import { Meta } from "@storybook/react";
import { action } from "storybook/actions";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { BannerView } from "../banner/BannerView.js";

export default {
  component: BannerView,
  decorators: [CrosswingAppDecorator({ layout: "centered" }), RouterDecorator],
  parameters: { layout: "centered" },
} satisfies Meta<typeof BannerView>;

export const TitleAndText = () => (
  <BannerView
    style={{ width: "400px" }}
    title="New comment on Whole Foods"
    message="Bob: How's the Quinoa here? I heard it's tasty."
    onClick={action("click")}
    onClose={action("close")}
  />
);

export const Link = () => (
  <BannerView
    style={{ width: "400px" }}
    title="New comment on Whole Foods"
    message="Bob: How's the Quinoa here? I heard it's tasty."
    to="/somewhere"
    onClick={action("click")}
    onClose={action("close")}
  />
);

export const TitleAndLongText = () => (
  <BannerView
    style={{ width: "400px" }}
    title="New comment on Whole Foods"
    message="Bob: How's the Quinoa here? I heard it's tasty. Also I heard that it's healthy."
    onClick={action("click")}
    onClose={action("close")}
  />
);

export const TitleAndWrappedText = () => (
  <BannerView
    wrap
    style={{ width: "400px" }}
    title="New comment on Whole Foods"
    message="Bob: How's the Quinoa here? I heard it's tasty. Also I heard that it's healthy."
    onClick={action("click")}
    onClose={action("close")}
  />
);
