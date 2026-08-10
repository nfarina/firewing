import { useAsyncTask } from "../hooks/useAsyncTask.js";
import { wait } from "../shared/wait.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { BannerLayout } from "./BannerLayout.js";
import { NoContent } from "./NoContent.js";

export default {
  component: BannerLayout,
  decorators: [CrosswingAppDecorator({ layout: "mobile" })],
  parameters: { layout: "centered" },
};

export const Visible = () => <BannerLayout title="Reticulating Splines" visible />;

export const WithHandler = () => {
  const task = useAsyncTask({
    func: () => wait(3000),
    onError: null,
  });

  return (
    <BannerLayout visible={task.isRunning}>
      <NoContent action="Show Banner" onActionClick={task.run} />
    </BannerLayout>
  );
};
