import { ErrorObj } from "../../shared/errors.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { ModalStoryButton, ModalStoryButtons } from "../storybook/ModalStoryButtons.js";
import { ModalDecorator } from "../storybook/decorators.js";
import { useErrorAlert } from "./useErrorAlert.js";

export default {
  component: useErrorAlert,
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" }), ModalDecorator],
  parameters: { layout: "fullscreen" },
};

export function ErrorString() {
  const errorAlert = useErrorAlert();

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={() => errorAlert.show("Something bad happened!")}>
        Error String
      </ModalStoryButton>
    </ModalStoryButtons>
  );
}

export function ErrorObject() {
  const errorAlert = useErrorAlert();

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={() => errorAlert.show(new Error("Something bad happened!"))}>
        Error Object
      </ModalStoryButton>
    </ModalStoryButtons>
  );
}

export function ErrorObjectNonUserFacing() {
  const errorAlert = useErrorAlert();

  const error: ErrorObj = {
    message: "PC LOAD LETTER",
    stack: new Error("PC LOAD LETTER").stack,
    userFacing: false,
  };

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={() => errorAlert.show(error)}>
        Error Object (non-user-facing)
      </ModalStoryButton>
    </ModalStoryButtons>
  );
}

export function ErrorObjectLongMessage() {
  const errorAlert = useErrorAlert();

  const bigError = {
    code: 9,
    message:
      "9 FAILED_PRECONDITION: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/hawthorne-web/firestore/indexes?create_composite=Clpwcm9qZWN0cy9idXJuc2lkZS13ZWIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2Fzc2lzdGFudENoYXRNZXNzYWdlcy9pbmRleGVzL18QARoKCgZjaGF0SWQQARoKCgZ1c2VySWQQARoLCgdjcmVhdGVkEAEaDAoIX19uYW1lX18QAQ",
    stack:
      "Error: 9 FAILED_PRECONDITION: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/hawthorne-web/firestore/indexes?create_composite=Clpwcm9qZWN0cy9idXJuc2lkZS13ZWIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2Fzc2lzdGFudENoYXRNZXNzYWdlcy9pbmRleGVzL18QARoKCgZjaGF0SWQQARoKCgZ1c2VySWQQARoLCgdjcmVhdGVkEAEaDAoIX19uYW1lX18QAQ\n    at callErrorFromStatus (/Users/nick/Code/hawthorne-web/node_modules/google-gax/node_modules/@grpc/grpc-js/build/src/call.js:31:19)\n    at Object.onReceiveStatus (/Users/nick/Code/hawthorne-web/node_modules/google-gax/node_modules/@grpc/grpc-js/build/src/client.js:357:73)\n    at Object.onReceiveStatus (/Users/nick/Code/hawthorne-web/node_modules/google-gax/node_modules/@grpc/grpc-js/build/src/client-interceptors.js:323:181)\n    at /Users/nick/Code/hawthorne-web/node_modules/google-gax/node_modules/@grpc/grpc-js/build/src/resolving-call.js:99:78\n    at process.processTicksAndRejections (node:internal/process/task_queues:77:11)\nfor call at\n    at ServiceClientImpl.makeServerStreamRequest (/Users/nick/Code/hawthorne-web/node_modules/google-gax/node_modules/@grpc/grpc-js/build/src/client.js:340:32)\n    at ServiceClientImpl.<anonymous> (/Users/nick/Code/hawthorne-web/node_modules/google-gax/node_modules/@grpc/grpc-js/build/src/make-client.js:105:19)\n    at /Users/nick/Code/hawthorne-web/node_modules/@google-cloud/firestore/build/src/v1/firestore_client.js:239:29\n    at /Users/nick/Code/hawthorne-web/node_modules/google-gax/build/src/streamingCalls/streamingApiCaller.js:38:28\n    at /Users/nick/Code/hawthorne-web/node_modules/google-gax/build/src/normalCalls/timeout.js:44:16\n    at Object.request (/Users/nick/Code/hawthorne-web/node_modules/google-gax/build/src/streamingCalls/streaming.js:393:40)\n    at makeRequest (/Users/nick/Code/hawthorne-web/node_modules/retry-request/index.js:159:28)\n    at retryRequest (/Users/nick/Code/hawthorne-web/node_modules/retry-request/index.js:119:5)\n    at StreamProxy.setStream (/Users/nick/Code/hawthorne-web/node_modules/google-gax/build/src/streamingCalls/streaming.js:384:37)\n    at StreamingApiCaller.call (/Users/nick/Code/hawthorne-web/node_modules/google-gax/build/src/streamingCalls/streamingApiCaller.js:54:16)\nCaused by: Error\n    at Query._get (/Users/nick/Code/hawthorne-web/node_modules/@google-cloud/firestore/build/src/reference.js:1792:23)\n    at Query.get (/Users/nick/Code/hawthorne-web/node_modules/@google-cloud/firestore/build/src/reference.js:1779:21)\n    at FirestoreHelper.getAll (file:///Users/nick/Code/hawthorne-web/node_modules/firewing/admin/FirestoreHelper.js:94:42)\n    at AssistantChats.getInitialMessagesByChat (file:///Users/nick/Code/hawthorne-web/packages/cloud/lib/server.js:6312:28)\n    at renameChat (file:///Users/nick/Code/hawthorne-web/packages/cloud/lib/server.js:9036:48)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async file:///Users/nick/Code/hawthorne-web/packages/cloud/lib/server.js:10419:7\n    at async file:///Users/nick/Code/hawthorne-web/packages/cloud/lib/server.js:10418:5\n    at async runFunction (/Users/nick/.nvm/versions/node/v20.11.1/lib/node_modules/firebase-tools/lib/emulator/functionsEmulatorRuntime.js:506:9)\n    at async runHTTPS (/Users/nick/.nvm/versions/node/v20.11.1/lib/node_modules/firebase-tools/lib/emulator/functionsEmulatorRuntime.js:531:5)",
  };

  return (
    <ModalStoryButtons>
      <ModalStoryButton onClick={() => errorAlert.show(bigError)}>
        Error Object (long message)
      </ModalStoryButton>
    </ModalStoryButtons>
  );
}
