import { useState } from "react";
import { colors } from "../colors/colors.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { RouterDecorator } from "../router/storybook/RouterDecorator.js";
import { NewTabButtons, TabButton } from "./NewTabButtons.js";
import { Sidebar, Trash } from "lucide-react";

export default {
  component: NewTabButtons,
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" }), RouterDecorator],
  parameters: {
    layout: "fullscreen",
  },
};

export const TrackStyle = () => {
  const [activeTab, setActiveTab] = useState("first");

  return (
    <div style={{ width: 300, padding: 20 }}>
      <NewTabButtons mode="track" pill={true}>
        <TabButton selected={activeTab === "first"} onClick={() => setActiveTab("first")}>
          First Tab
        </TabButton>
        <TabButton selected={activeTab === "second"} onClick={() => setActiveTab("second")}>
          Second Tab
        </TabButton>
        <TabButton selected={activeTab === "third"} onClick={() => setActiveTab("third")}>
          Third Tab
        </TabButton>
      </NewTabButtons>

      <div
        style={{
          marginTop: 20,
          padding: 10,
          borderRadius: 8,
          border: `1px solid ${colors.controlBorder()}`,
        }}
      >
        Active tab: <strong>{activeTab}</strong>
      </div>
    </div>
  );
};

export const TrackStyleSquare = () => {
  const [activeTab, setActiveTab] = useState("first");

  return (
    <div style={{ width: 300, padding: 20 }}>
      <NewTabButtons mode="track" pill={false}>
        <TabButton selected={activeTab === "first"} onClick={() => setActiveTab("first")}>
          First Tab
        </TabButton>
        <TabButton selected={activeTab === "second"} onClick={() => setActiveTab("second")}>
          Second Tab
        </TabButton>
        <TabButton selected={activeTab === "third"} onClick={() => setActiveTab("third")}>
          Third Tab
        </TabButton>
      </NewTabButtons>

      <div
        style={{
          marginTop: 20,
          padding: 10,
          borderRadius: 8,
          border: `1px solid ${colors.controlBorder()}`,
        }}
      >
        Active tab: <strong>{activeTab}</strong>
      </div>
    </div>
  );
};

export const ButtonStyle = () => {
  const [activeTab, setActiveTab] = useState("first");

  return (
    <div style={{ width: 300, padding: 20 }}>
      <NewTabButtons mode="buttons">
        <TabButton selected={activeTab === "first"} onClick={() => setActiveTab("first")}>
          First Tab
        </TabButton>
        <TabButton selected={activeTab === "second"} onClick={() => setActiveTab("second")}>
          Second Tab
        </TabButton>
        <TabButton selected={activeTab === "third"} onClick={() => setActiveTab("third")}>
          Third Tab
        </TabButton>
      </NewTabButtons>

      <div
        style={{
          marginTop: 20,
          padding: 10,
          borderRadius: 8,
          border: `1px solid ${colors.controlBorder()}`,
        }}
      >
        Active tab: <strong>{activeTab}</strong>
      </div>
    </div>
  );
};

export const WithIcons = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div style={{ width: 450, padding: 20 }}>
      <NewTabButtons mode="track" pill={true}>
        <TabButton
          selected={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
          icon={<Sidebar />}
          hotkey="1"
        >
          Dashboard
        </TabButton>
        <TabButton
          selected={activeTab === "messages"}
          onClick={() => setActiveTab("messages")}
          icon={<Trash />}
          badge={3}
          badgeColor={colors.white}
          badgeBackgroundColor={colors.red}
          hotkey="2"
        >
          Messages
        </TabButton>
        <TabButton
          selected={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          icon={<span>⚙️</span>}
          hotkey="3"
        >
          Settings
        </TabButton>
      </NewTabButtons>

      <div
        style={{
          marginTop: 20,
          padding: 10,
          borderRadius: 8,
          border: `1px solid ${colors.controlBorder()}`,
        }}
      >
        <p>
          Active tab: <strong>{activeTab}</strong>
        </p>
        <p>
          <small>Try hotkeys: 1, 2, 3</small>
        </p>
      </div>
    </div>
  );
};

export const ButtonStyleWithFit = () => {
  const [activeTab, setActiveTab] = useState("short");

  return (
    <div style={{ width: 500, padding: 20 }}>
      <NewTabButtons mode="buttons" pill={false}>
        <TabButton
          selected={activeTab === "short"}
          onClick={() => setActiveTab("short")}
          fit={true}
        >
          Fit
        </TabButton>
        <TabButton
          selected={activeTab === "medium-length"}
          onClick={() => setActiveTab("medium-length")}
        >
          Stretchy
        </TabButton>
        <TabButton
          selected={activeTab === "very-long-tab-name"}
          onClick={() => setActiveTab("very-long-tab-name")}
        >
          More stretchy
        </TabButton>
      </NewTabButtons>

      <div
        style={{
          marginTop: 20,
          padding: 10,
          borderRadius: 8,
          border: `1px solid ${colors.controlBorder()}`,
        }}
      >
        Active tab: <strong>{activeTab}</strong>
      </div>
    </div>
  );
};

export const SingleTab = () => {
  const [activeTab, setActiveTab] = useState("only");

  return (
    <div style={{ width: 200, padding: 20 }}>
      <NewTabButtons mode="track">
        <TabButton selected={activeTab === "only"} onClick={() => setActiveTab("only")}>
          Only Tab
        </TabButton>
      </NewTabButtons>
    </div>
  );
};
