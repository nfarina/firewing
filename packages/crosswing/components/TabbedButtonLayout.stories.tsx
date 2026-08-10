import { Suspense, lazy, use, useState } from "react";
import { action } from "storybook/actions";
import { RouterContext } from "../router/context/RouterContext.js";
import { BrowserSimulator, RouterDecorator } from "../router/storybook/RouterDecorator.js";
import { wait } from "../shared/wait.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { LoadingCurtain } from "./LoadingCurtain.js";
import { NoContent } from "./NoContent.js";
import { TabbedButton, TabbedButtonLayout } from "./TabbedButtonLayout.js";

export default {
  component: TabbedButtonLayout,
  decorators: [CrosswingAppDecorator({ layout: "mobile" }), RouterDecorator],
  parameters: { layout: "centered" },
};

export const TwoTabs = () => (
  <TabbedButtonLayout onValueChange={action("onValueChange")}>
    <TabbedButton title="Red Fish" value="red">
      <NoContent title="Red Fish" />
    </TabbedButton>
    <TabbedButton title="Blue Fish" value="blue">
      <NoContent style={{ background: "blue" }} title="Blue Fish" />
    </TabbedButton>
  </TabbedButtonLayout>
);

export const OneTab = () => (
  <TabbedButtonLayout onValueChange={action("onValueChange")}>
    <TabbedButton title="Red Fish" value="red">
      <NoContent title="Red Fish" />
    </TabbedButton>
  </TabbedButtonLayout>
);

export const ButtonStyle = () => (
  <TabbedButtonLayout buttonStyle onValueChange={action("onValueChange")}>
    <TabbedButton title="Red Fish" value="red">
      <NoContent title="Red Fish" />
    </TabbedButton>
    <TabbedButton title="Blue Fish" value="blue" badge={2}>
      <NoContent style={{ background: "blue" }} title="Blue Fish" />
    </TabbedButton>
  </TabbedButtonLayout>
);

export const DefaultSelected = () => (
  <TabbedButtonLayout defaultValue="blue" onValueChange={action("onValueChange")}>
    <TabbedButton title="Red Fish" value="red">
      <NoContent title="Red Fish" />
    </TabbedButton>
    <TabbedButton title="Blue Fish" value="blue">
      <NoContent title="Blue Fish" />
    </TabbedButton>
  </TabbedButtonLayout>
);

export const NoValues = () => (
  <TabbedButtonLayout onValueChange={action("onValueChange")}>
    <TabbedButton title="Red Fish">
      <NoContent title="Red Fish" />
    </TabbedButton>
    <TabbedButton title="Blue Fish">
      <NoContent title="Blue Fish" />
    </TabbedButton>
  </TabbedButtonLayout>
);

export const SomeValues = () => (
  <TabbedButtonLayout onValueChange={action("onValueChange")}>
    <TabbedButton title="Red Fish" value="red">
      <NoContent title="Red Fish" />
    </TabbedButton>
    <TabbedButton title="Blue Fish">
      <NoContent title="Blue Fish" />
    </TabbedButton>
  </TabbedButtonLayout>
);

export const LazyChild = () => {
  const DynamicContent = lazy(async () => {
    await wait(2000);
    return { default: () => <NoContent title="Loaded" /> };
  });

  return (
    <TabbedButtonLayout onValueChange={action("onValueChange")}>
      <TabbedButton title="Home" value="home">
        <NoContent title="Home" />
      </TabbedButton>
      <TabbedButton lazy title="Discover" value="discover">
        <Suspense fallback={<LoadingCurtain lazy />}>
          {/* oxlint-disable-next-line react-hooks-js/static-components */}
          <DynamicContent />
        </Suspense>
      </TabbedButton>
    </TabbedButtonLayout>
  );
};

export const Controlled = () => {
  const [value, setValue] = useState<"red" | "blue" | "green">("red");

  return (
    <TabbedButtonLayout value={value} onValueChange={setValue}>
      <TabbedButton title="Red Fish" value="red">
        <NoContent title="Red" />
      </TabbedButton>
      <TabbedButton title="Blue Fish" value="blue">
        <NoContent title="Blue" />
      </TabbedButton>
      <TabbedButton title="Green Fish" value="green">
        <NoContent title="Green" />
      </TabbedButton>
    </TabbedButtonLayout>
  );
};

export const WithRouter = () => (
  <BrowserSimulator initialPath="?color=blue">
    <TabbedButtonLayout searchParam="color">
      <TabbedButton title="Red Fish" value="red">
        <RoutedRedFish />
      </TabbedButton>
      <TabbedButton title="Blue Fish" value="blue">
        <RoutedBlueFish />
      </TabbedButton>
      <TabbedButton title="Green Fish" value="green">
        <NoContent title="Green Fish" />
      </TabbedButton>
    </TabbedButtonLayout>
  </BrowserSimulator>
);

// This has to be a separate component to get the Router context from
// BrowserSimulator.
function RoutedRedFish() {
  const { history } = use(RouterContext);

  return <NoContent title="Red" action="Go to Root" onActionClick={() => history.navigate("/")} />;
}

function RoutedBlueFish() {
  const { history, location } = use(RouterContext);

  function onGoGreenClick() {
    const newLocation = location.withParam("color", "green");
    history.navigate(newLocation.href(), { replace: true });
  }

  return <NoContent title="Blue Fish" action="Go Green" onActionClick={onGoGreenClick} />;
}
