import { action } from "storybook/actions";
import { useAsyncTask } from "../hooks/useAsyncTask.js";
import { useErrorAlert } from "../modals/alert/useErrorAlert.js";
import { ModalDecorator } from "../modals/storybook/decorators.js";
import { Seconds } from "../shared/timespan.js";
import { wait } from "../shared/wait.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { useProgressDialog } from "./useProgressDialog.js";

export default {
  component: useProgressDialog,
  decorators: [CrosswingAppDecorator({ layout: "mobile" }), ModalDecorator],
  parameters: { layout: "centered", chromatic: { disableSnapshot: true } }, // Animations make it hard to snapshot.
};

export const Indeterminate = () => {
  const errorAlert = useErrorAlert();
  const progressAlert = useProgressDialog();

  useAsyncTask({
    async func() {
      progressAlert.show("Processing Payment…");

      await wait(2000);

      progressAlert.hide();
    },
    runOnMount: true,
    onError: errorAlert.show,
    onFinally: progressAlert.hide,
  });

  return null;
};

export const IndeterminateWithoutMessage = () => {
  const errorAlert = useErrorAlert();
  const progressAlert = useProgressDialog();

  useAsyncTask({
    async func() {
      progressAlert.show();

      await wait(2000);

      progressAlert.hide();
    },
    runOnMount: true,
    onError: errorAlert.show,
    onFinally: progressAlert.hide,
  });

  return null;
};

export const IndeterminateWithError = () => {
  const errorAlert = useErrorAlert();
  const progressAlert = useProgressDialog();

  useAsyncTask({
    async func() {
      action("Running func!")();
      progressAlert.show("Processing Payment…");

      await wait(2000);

      if (window) throw new Error("Test error!");
    },
    onError: errorAlert.show,
    onFinally: progressAlert.hide,
    runOnMount: true,
    silentErrors: true,
  });

  return null;
};

export const Progress = () => {
  const errorAlert = useErrorAlert();
  const progressAlert = useProgressDialog({ onCancel: () => task.cancel() });

  const task = useAsyncTask({
    func: async (task) => {
      progressAlert.setProgress(0);
      progressAlert.show("Issuing Cards…");

      for (let i = 1; i <= 10; i++) {
        if (task.isCanceled()) {
          action("task")("Task was canceled!");
          break;
        }

        await wait(250);
        progressAlert.setProgress(i / 10);

        if (i > 5) {
          progressAlert.show("Almost Done…");
        }
      }

      await wait(1000);
    },
    runOnMount: true,
    onError: errorAlert.show,
    onFinally: progressAlert.hide,
  });

  return null;
};

export const Cancelable = () => {
  const errorAlert = useErrorAlert();
  const progressAlert = useProgressDialog({ onCancel: () => task.cancel() });

  const task = useAsyncTask({
    func: async (task) => {
      progressAlert.show("Processing Payment…");

      await wait(Seconds(5));

      if (task.isCanceled()) return;

      throw new Error("Test error!");
    },
    onError: errorAlert.show,
    onFinally: progressAlert.hide,
    runOnMount: true,
  });
};
