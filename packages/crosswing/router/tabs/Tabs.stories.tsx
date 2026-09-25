import { StoryObj } from "@storybook/react";
import { BookOpen, Ellipsis, ListChecks, MessageCircle, Pencil, Search, User } from "lucide-react";
import { action } from "storybook/actions";
import { useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { Scrollable } from "../../components/Scrollable.js";
import { fonts } from "../../fonts/fonts.js";
import { DeviceSimulator } from "../../host/mocks/DeviceSimulator.js";
import { safeArea } from "../../safearea/safeArea.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Router } from "../Router.js";
import { MemoryHistory } from "../history/MemoryHistory.js";
import { Link } from "../Link.js";
import { NavLayout } from "../navs/NavLayout.js";
import { NavRoute, Navs } from "../navs/Navs.js";
import { Tab, Tabs } from "./Tabs.js";

export default {
  component: Tabs,
};

export const Normal: StoryObj = {
  render: () => <NormalTabs />,
  decorators: [CrosswingAppDecorator({ layout: "mobile" })],
  parameters: { layout: "centered" },
};

function NormalTabs() {
  const [history] = useState(() => new MemoryHistory());

  return (
    <Router
      history={history}
      render={() => (
        <Tabs>
          <Tab path="home" title="Home" render={() => <SamplePage>Favorite Cupcakes</SamplePage>} />
          <Tab
            path="activity"
            title="Activity"
            render={() => <SamplePage>List of Cupcake Tastings</SamplePage>}
          />
          <Tab
            path="account"
            title="Account"
            render={() => <SamplePage>Cupcake Account</SamplePage>}
          />
        </Tabs>
      )}
    />
  );
}

const SamplePage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font: ${fonts.display({ size: 14 })};
  color: ${colors.text()};
`;

/** Pick a device and pose from the toolbar to see each tab bar presentation. */
export const Simulator: StoryObj = {
  render: () => <SimulatedTabs />,
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" })],
  parameters: { layout: "fullscreen" },
};

function SimulatedTabs() {
  const [history] = useState(() => new MemoryHistory());

  return (
    <DeviceSimulator>
      <Router
        history={history}
        render={() => (
          <Tabs>
            <Tab
              path="recipes"
              title="Recipes"
              icon={<BookOpen size={22} />}
              render={() => <ListNavs title="Recipes" />}
            />
            <Tab
              path="chats"
              title="Chats"
              icon={<MessageCircle size={22} />}
              badge={3}
              render={() => <ListNavs title="Chats" />}
            />
            <Tab
              path="search"
              title="Search"
              icon={<Search size={22} />}
              render={() => <ListNavs title="Search" />}
            />
            <Tab
              path="lists"
              title="List"
              icon={<ListChecks size={22} />}
              render={() => <ListNavs title="List" />}
            />
            <Tab
              path="account"
              title="Account"
              icon={<User size={22} />}
              render={() => <ListNavs title="Account" />}
            />
          </Tabs>
        )}
      />
    </DeviceSimulator>
  );
}

function ListNavs({ title }: { title: string }) {
  return (
    <Navs>
      <NavRoute render={() => <ListPage title={title} />} />
      <NavRoute path=":row" render={({ row }) => <DetailPage title={`${title} row ${row}`} />} />
    </Navs>
  );
}

/** A page whose rows respect the side safe areas (iPhone landscape, the iPhone Duo strip). */
function ListPage({ title }: { title: string }) {
  return (
    <NavLayout
      isApplicationRoot
      title={title}
      right={{ icon: <Pencil />, onClick: action("edit") }}
    >
      <Scrollable>
        <StyledRows>
          {Array.from({ length: 30 }, (_, i) => (
            <Link key={i} to={String(i + 1)}>
              {title} row {i + 1}
            </Link>
          ))}
        </StyledRows>
      </Scrollable>
    </NavLayout>
  );
}

/**
 * Back and icon buttons move to the strip where bars run vertically; the text
 * button ("Save") stays in the header, as Apple's guidance describes.
 */
function DetailPage({ title }: { title: string }) {
  return (
    <NavLayout
      title={title}
      right={[
        { title: "Save", onClick: action("save") },
        { icon: <Pencil />, onClick: action("edit") },
        { icon: <Ellipsis />, onClick: action("more") },
      ]}
    >
      <StyledDetail>{title}</StyledDetail>
    </NavLayout>
  );
}

const StyledDetail = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font: ${fonts.display({ size: 15 })};
  color: ${colors.textSecondary()};
`;

const StyledRows = styled.div`
  padding-left: ${safeArea.left()};
  padding-right: ${safeArea.right()};
  padding-bottom: ${safeArea.bottom()};

  > a {
    display: block;
    text-decoration: none;
    padding: 14px 16px;
    border-bottom: 1px solid ${colors.separator()};
    font: ${fonts.display({ size: 15 })};
    color: ${colors.text()};
  }
`;
