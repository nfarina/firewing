import { Meta } from "@storybook/react";
import { action } from "storybook/actions";
import { RouterDecorator } from "../../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { ToastView } from "./ToastView.js";
import { AlertTriangle, Check } from "lucide-react";

export default {
  component: ToastView,
  decorators: [CrosswingAppDecorator({ layout: "centered" }), RouterDecorator],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ToastView>;

export const TitleAndText = () => (
  <ToastView
    style={{ width: "350px" }}
    title="New comment on Whole Foods"
    message="Bob: How's the Quinoa here? I heard it's tasty."
    onClick={action("click")}
    onClose={action("close")}
  />
);

export const Text = () => (
  <ToastView
    style={{ width: "350px" }}
    message="Thread marked as resolved."
    onClose={action("close")}
  />
);

export const TextClickable = () => (
  <ToastView
    style={{ width: "350px" }}
    message="Thread marked as resolved."
    onClick={action("click")}
    onClose={action("close")}
  />
);

export const TextAndIcon = () => (
  <ToastView
    style={{ width: "350px" }}
    message="Thread marked as resolved."
    icon={<Check />}
    onClick={action("click")}
    onClose={action("close")}
  />
);

export const TextClickableAndAction = () => (
  <ToastView
    style={{ width: "350px" }}
    message="Thread marked as resolved."
    onClick={action("click")}
    onActionClick={action("action")}
    onClose={action("close")}
    action="Manage"
  />
);

export const TextAndAction = () => (
  <ToastView
    style={{ width: "350px" }}
    message="Thread marked as resolved."
    action="Manage"
    onActionClick={action("action")}
    onClose={action("close")}
  />
);

export const Link = () => (
  <ToastView
    style={{ width: "350px" }}
    title="New comment on Whole Foods"
    message="Bob: How's the Quinoa here? I heard it's tasty."
    to="/somewhere"
    onClick={action("click")}
    onClose={action("close")}
  />
);

export const TitleAndLongText = () => (
  <ToastView
    style={{ width: "350px" }}
    title="New comment on Whole Foods"
    message="Bob: How's the Quinoa here? I heard it's tasty. Also I heard that it's healthy."
    onClose={action("close")}
  />
);

export const TitleAndTruncatedText = () => (
  <ToastView
    ellipsize
    style={{ width: "350px" }}
    title="New comment on Whole Foods"
    message="Bob: How's the Quinoa here? I heard it's tasty. Also I heard that it's healthy."
    onClose={action("close")}
  />
);

export const Destructive = () => (
  <ToastView
    destructive
    style={{ width: "350px" }}
    icon={<AlertTriangle />}
    title="Task error"
    message="The task failed to complete."
    onClick={action("click")}
    onClose={action("close")}
    action="Retry"
    onActionClick={action("retry")}
  />
);
