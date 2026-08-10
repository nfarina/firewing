import { Link } from "../router/Link.js";
import { RouterDecorator } from "../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { NoContent } from "./NoContent.js";

export default {
  component: NoContent,
  decorators: [CrosswingAppDecorator({ layout: "mobile" }), RouterDecorator],
  parameters: { layout: "centered" },
};

export const WithTitle = () => <NoContent title="Nothing Here" />;

export const WithSubtitle = () => (
  <NoContent title="Nothing Here" subtitle="We couldn't find any content here." />
);

export const WithAction = () => (
  <NoContent
    title="Nothing Here"
    subtitle="We couldn't find any content here."
    action="Look Again"
  />
);

export const WithPrimaryAction = () => (
  <NoContent
    title="Upload Photo"
    subtitle="To help the staff identify you when paying."
    action="Upload…"
    primaryAction
  />
);

export const WithPrimaryActionAndOrAction = () => (
  <NoContent
    title="Upload Photo"
    subtitle="To help the staff identify you when paying."
    primaryText
    action="Upload…"
    primaryAction
    orAction="Skip for now"
  />
);

export const WithLink = () => (
  <NoContent
    title="Not Found"
    subtitle={
      <>
        Try <Link to="/there">going there</Link> instead.
      </>
    }
  />
);
