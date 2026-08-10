import { Meta } from "@storybook/react";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { useAsyncTask } from "../../hooks/useAsyncTask.js";
import { useDebounced } from "../../hooks/useDebounced.js";
import { wait } from "../../shared/wait.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SearchInput, StyledSearchInput } from "./SearchInput.js";

export default {
  component: SearchInput,
  decorators: [
    (Story: () => any) => <Container children={<Story />} />,
    CrosswingAppDecorator({ layout: "component" }),
  ],
  parameters: { layout: "centered" },
} satisfies Meta<typeof SearchInput>;

export const Empty = () => <SearchInput placeholder="Search templates..." />;

export const WithValue = () => <SearchInput defaultValue="kitchen design" />;

export const Disabled = () => <SearchInput defaultValue="kitchen design" disabled />;

export const Working = () => {
  const [value, setValue] = useState("");

  // Simulate a typical value for searching with Algolia.
  const debouncedValue = useDebounced(value, { delay: 100 });

  const searchTask = useAsyncTask({
    func: () => wait(1000),
    onError: null,
  });

  useEffect(() => {
    if (debouncedValue.length > 0) {
      searchTask.run();
    }
  }, [debouncedValue]);

  const debouncedIsRunning = useDebounced(searchTask.isRunning, { delay: 500 });

  return (
    <SearchInput
      value={value}
      onValueChange={setValue}
      working={value.length > 0 && debouncedIsRunning}
      placeholder="Start typing to search..."
    />
  );
};

export const WithClearButton = () => {
  const [value, setValue] = useState("removable search term");

  return (
    <SearchInput value={value} onValueChange={setValue} placeholder="Search with clear button..." />
  );
};

export const NewStyleEmpty = () => <SearchInput newStyle pill placeholder="Search templates..." />;

export const NewStyleWithValue = () => <SearchInput newStyle pill defaultValue="kitchen design" />;

export const NewStyleDisabled = () => (
  <SearchInput newStyle pill defaultValue="kitchen design" disabled />
);

export const NewStyleWorking = () => {
  const [value, setValue] = useState("");

  // Simulate a typical value for searching with Algolia.
  const debouncedValue = useDebounced(value, { delay: 100 });

  const searchTask = useAsyncTask({
    func: () => wait(1000),
    onError: null,
  });

  useEffect(() => {
    if (debouncedValue.length > 0) {
      searchTask.run();
    }
  }, [debouncedValue]);

  const debouncedIsRunning = useDebounced(searchTask.isRunning, { delay: 500 });

  return (
    <SearchInput
      newStyle
      value={value}
      onValueChange={setValue}
      working={value.length > 0 && debouncedIsRunning}
      placeholder="Start typing to search..."
      pill
    />
  );
};

export const NewStyleWithClearButton = () => {
  const [value, setValue] = useState("removable search term");

  return (
    <SearchInput
      newStyle
      value={value}
      onValueChange={setValue}
      placeholder="Search with clear button..."
      pill
    />
  );
};

const Container = styled.div`
  display: flex;
  flex-flow: column;

  > ${StyledSearchInput}[data-new-style="false"] {
    /* Make it stand out in Storybook against the background. */
    border: 1px solid ${colors.separator()};
    border-radius: 6px;
    padding: 5px;

    > input {
      border: none;
      background: transparent;
    }
  }

  > pre {
    color: ${colors.textSecondary()};
    font: ${fonts.displayMono({ size: 14 })};
  }

  > * + * {
    margin-top: 20px;
  }
`;
