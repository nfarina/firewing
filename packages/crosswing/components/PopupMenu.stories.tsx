import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { action } from "storybook/actions";
import { styled } from "styled-components";
import { usePopup } from "../modals/popup/usePopup.js";
import { ModalDecorator } from "../modals/storybook/decorators.js";
import { RouterDecorator } from "../router/storybook/RouterDecorator.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { Button } from "./Button.js";
import {
  PopupMenu,
  PopupMenuHeader,
  PopupMenuSelect,
  PopupMenuSeparator,
  PopupMenuText,
  PopupMenuToggle,
} from "./PopupMenu.js";
import { SelectOption } from "./forms/Select.js";

export default {
  component: PopupMenu,
  decorators: [
    (Story) => <Container children={<Story />} />,
    ModalDecorator,
    CrosswingAppDecorator({ layout: "fullscreen" }),
    RouterDecorator,
  ],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PopupMenu>;

type Story = StoryFn<typeof PopupMenu>;

export const Mixed = () => (
  <PopupMenu>
    <PopupMenuHeader children="Account" />
    <PopupMenuText children="Sync with Stripe…" onClick={action("onStripeClick")} />
    <PopupMenuText
      disabled
      children="Sync with QuickBooks…"
      onClick={action("onQuickBooksClick")}
    />
    <PopupMenuText
      destructive
      children="Delete Account…"
      onClick={action("onDeleteAccountClick")}
    />
    <PopupMenuSeparator />
    <PopupMenuToggle children="Sort by Recently Seen" on={true} onClick={action("sortByRecent")} />
    <PopupMenuSeparator />
    <PopupMenuText children="Go to User" to="/users/bob" />
  </PopupMenu>
);

export const Select = () => (
  <PopupMenu>
    <PopupMenuText children="Adjust Widgets…" onClick={action("onStripeClick")} />
    <PopupMenuSelect>
      <SelectOption title="Red" value="red" />
      <SelectOption title="Blue" value="blue" />
    </PopupMenuSelect>
  </PopupMenu>
);

export const KeyboardNavigation: Story = () => {
  const [toggle, setToggle] = useState(false);
  const popup = usePopup(() => (
    <PopupMenu>
      <PopupMenuHeader children="Keyboard Navigation Test" />
      <PopupMenuText children="First Item" onClick={action("first-item")} />
      <PopupMenuText children="Second Item" onClick={action("second-item")} />
      <PopupMenuText children="Disabled Item" disabled onClick={action("disabled-item")} />
      <PopupMenuText children="Third Item" onClick={action("third-item")} />
      <PopupMenuSeparator />
      <PopupMenuText children="Link Item" to="/test-link" />
      <PopupMenuToggle children="Toggle Item" on={toggle} onClick={() => setToggle(!toggle)} />
      <PopupMenuText
        children="Destructive Action"
        destructive
        onClick={action("destructive-action")}
      />
    </PopupMenu>
  ));

  return (
    <div>
      <p style={{ marginBottom: "20px", maxWidth: "300px", textAlign: "center" }}>
        <strong>Keyboard Navigation Test:</strong>
        <br />• Use <kbd>Tab</kbd> or arrow keys to navigate
        <br />• <kbd>Enter</kbd>/<kbd>Space</kbd> to activate
        <br />• <kbd>Escape</kbd> to close menu
      </p>
      <Button primary onClick={popup.onClick}>
        Open Menu (Test Keyboard Navigation)
      </Button>
    </div>
  );
};

export const NestedMenus: Story = () => {
  const [selectedColor, setSelectedColor] = useState("blue");
  const [selectedSize, setSelectedSize] = useState("medium");

  const colorSubmenu = usePopup(() => (
    <PopupMenu>
      <PopupMenuHeader children="Colors" />
      <PopupMenuText
        children="Red"
        selected={selectedColor === "red"}
        onClick={() => setSelectedColor("red")}
      />
      <PopupMenuText
        children="Green"
        selected={selectedColor === "green"}
        onClick={() => setSelectedColor("green")}
      />
      <PopupMenuText
        children="Blue"
        selected={selectedColor === "blue"}
        onClick={() => setSelectedColor("blue")}
      />
      <PopupMenuText
        children="Purple"
        selected={selectedColor === "purple"}
        onClick={() => setSelectedColor("purple")}
      />
    </PopupMenu>
  ));

  const sizeSubmenu = usePopup(() => (
    <PopupMenu>
      <PopupMenuHeader children="Sizes" />
      <PopupMenuText
        children="Small"
        detail="8px padding"
        selected={selectedSize === "small"}
        onClick={() => setSelectedSize("small")}
      />
      <PopupMenuText
        children="Medium"
        detail="12px padding"
        selected={selectedSize === "medium"}
        onClick={() => setSelectedSize("medium")}
      />
      <PopupMenuText
        children="Large"
        detail="16px padding"
        selected={selectedSize === "large"}
        onClick={() => setSelectedSize("large")}
      />
      <PopupMenuText
        children="Extra Large"
        detail="20px padding"
        selected={selectedSize === "xl"}
        onClick={() => setSelectedSize("xl")}
      />
    </PopupMenu>
  ));

  const mainMenu = usePopup(() => (
    <PopupMenu>
      <PopupMenuHeader children="Settings Menu" />
      <PopupMenuText children="Save Document" onClick={action("save")} />
      <PopupMenuText children="Export..." onClick={action("export")} />
      <PopupMenuSeparator />
      <PopupMenuText
        children="Choose color"
        detail={`Currently: ${selectedColor}`}
        showDisclosure
        leaveOpen
        onClick={colorSubmenu.onClick}
      />
      <PopupMenuText
        children="Choose size"
        detail={`Currently: ${selectedSize}`}
        showDisclosure
        leaveOpen
        onClick={sizeSubmenu.onClick}
      />
      <PopupMenuSeparator />
      <PopupMenuText children="Preferences..." onClick={action("preferences")} />
    </PopupMenu>
  ));

  return (
    <div>
      <p style={{ marginBottom: "20px", maxWidth: "400px", textAlign: "center" }}>
        <strong>Nested Menus Test:</strong>
        <br />• Open main menu, then navigate to "Choose Color" or "Choose Size"
        <br />• Use keyboard navigation within each menu level
        <br />• Submenus use <code>leaveOpen</code> so main menu stays visible
      </p>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <Button primary onClick={mainMenu.onClick}>
          Open Settings Menu
        </Button>
        <div style={{ fontSize: "14px", color: "#666" }}>
          Selected: {selectedColor}, {selectedSize}
        </div>
      </div>
    </div>
  );
};

export const TypeAhead: Story = () => {
  const [lastSelected, setLastSelected] = useState<string | null>(null);

  const popup = usePopup(() => (
    <PopupMenu>
      <PopupMenuHeader children="Type-Ahead Test" />
      <PopupMenuText
        children="Apple"
        detail="Fruit starting with 'A'"
        onClick={() => setLastSelected("Apple")}
      />
      <PopupMenuText
        children="Banana"
        detail="Yellow fruit"
        onClick={() => setLastSelected("Banana")}
      />
      <PopupMenuText
        children="Cherry"
        detail="Red fruit"
        onClick={() => setLastSelected("Cherry")}
      />
      <PopupMenuText
        children="Date"
        detail="Sweet dried fruit"
        onClick={() => setLastSelected("Date")}
      />
      <PopupMenuSeparator />
      <PopupMenuText
        children="Elderberry"
        detail="Dark purple berry"
        onClick={() => setLastSelected("Elderberry")}
      />
      <PopupMenuText
        children="Fig"
        detail="Mediterranean fruit"
        onClick={() => setLastSelected("Fig")}
      />
      <PopupMenuText
        children="Grape"
        detail="Wine ingredient"
        onClick={() => setLastSelected("Grape")}
      />
      <PopupMenuText
        children="Honeydew"
        detail="Green melon"
        onClick={() => setLastSelected("Honeydew")}
      />
      <PopupMenuSeparator />
      <PopupMenuText
        children="Kiwi"
        detail="Fuzzy brown fruit"
        onClick={() => setLastSelected("Kiwi")}
      />
      <PopupMenuText
        children="Lemon"
        detail="Sour citrus"
        onClick={() => setLastSelected("Lemon")}
      />
      <PopupMenuText
        children="Mango"
        detail="Tropical fruit"
        onClick={() => setLastSelected("Mango")}
      />
      <PopupMenuText
        children="Orange"
        detail="Common citrus"
        onClick={() => setLastSelected("Orange")}
      />
    </PopupMenu>
  ));

  return (
    <div>
      <p style={{ marginBottom: "20px", maxWidth: "400px", textAlign: "center" }}>
        <strong>Type-Ahead Navigation Test:</strong>
        <br />• Open menu, then <strong>start typing</strong> to jump to items
        <br />• Try: "a" → "ap" → "apple" or "c" → "ch" → "cherry"
        <br />• Works with partial matches (case-insensitive)
        <br />• Typing resets after 1 second of inactivity
      </p>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <Button primary onClick={popup.onClick}>
          Open Fruit Menu (Type to Search)
        </Button>
        {lastSelected && (
          <div style={{ fontSize: "14px", color: "#666" }}>
            Last selected: <strong>{lastSelected}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export const Dynamic: Story = () => {
  const smallMenu = (
    <PopupMenu>
      <PopupMenuText>Thing 1</PopupMenuText>
      <PopupMenuText>Thing 2</PopupMenuText>
    </PopupMenu>
  );

  const largeMenu = (
    <PopupMenu>
      {[...Array(100)].map((_, i) => (
        <PopupMenuText key={i}>Item {i + 1}</PopupMenuText>
      ))}
    </PopupMenu>
  );

  const wideMenu = (
    <PopupMenu>
      <PopupMenuText>Thing 1</PopupMenuText>
      <PopupMenuText>
        Pariatur aute incididunt amet sunt id cupidatat. Ullamco incididunt aliquip sunt ullamco et
        proident sint nulla cillum adipisicing eu.
      </PopupMenuText>
    </PopupMenu>
  );

  const popup1 = usePopup(() => smallMenu);
  const popup2 = usePopup(() => largeMenu);
  const popup3 = usePopup(() => wideMenu, { placement: "above" });
  const popup4 = usePopup(() => largeMenu, { placement: "above" });
  const popup5 = usePopup(() => smallMenu);

  return (
    <FourCorners>
      <Button primary onClick={popup1.onClick}>
        Show Menu
      </Button>
      <Button primary onClick={popup2.onClick}>
        Show Large Menu
      </Button>
      <Button primary onClick={popup3.onClick}>
        Show Wide Menu
      </Button>
      <Button primary onClick={popup4.onClick}>
        Show Large Menu
      </Button>
      <Button primary onClick={popup5.onClick}>
        Show Menu
      </Button>
    </FourCorners>
  );
};

const FourCorners = styled.div`
  align-self: stretch;
  justify-self: stretch;
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 20px;
  padding: 20px;

  > * {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  > *:last-child {
    grid-column: 1 / -1;
    grid-row: 3;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
