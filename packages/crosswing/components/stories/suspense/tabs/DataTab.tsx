import { wait } from "../../../../shared/wait.js";
import { NoContent } from "../../../NoContent.js";

export default function DataTab() {
  const result = use(fetchData());

  return <NoContent title="Suspense Data" subtitle={<>Data fetched: {result}</>} />;
}

let cached: Promise<number> | undefined;

function fetchData() {
  if (!cached) {
    cached = getData();
    throw cached;
  }

  return cached;
}

async function getData() {
  await wait(1000);
  return 42;
}

// From https://codesandbox.io/s/005whu?file=/Albums.js&utm_medium=sandpack
function use(promise) {
  if (promise.status === "fulfilled") {
    return promise.value;
  } else if (promise.status === "rejected") {
    throw promise.reason;
  } else if (promise.status === "pending") {
    throw promise;
  } else {
    promise.status = "pending";
    promise.then(
      (result) => {
        promise.status = "fulfilled";
        promise.value = result;
      },
      (reason) => {
        promise.status = "rejected";
        promise.reason = reason;
      },
    );
    throw promise;
  }
}
