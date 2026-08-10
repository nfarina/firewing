import { Meta, StoryFn } from "@storybook/react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { TipView } from "./TipView.js";
import { Check, Info, AlertTriangle } from "lucide-react";

export default {
  component: TipView,
  decorators: [CrosswingAppDecorator()],
  parameters: { layout: "centered" },
} satisfies Meta<typeof TipView>;

type Story = StoryFn<typeof TipView>;

export const AllVariations = () => (
  <StyledGrid>
    <div>
      <h3>Default</h3>
      <TipView>This is a basic tip without an icon or title.</TipView>
      <TipView title="Pro tip">This tip has a title but no icon for better organization.</TipView>
      <TipView icon={<Info />}>This tip has an icon but no title for visual emphasis.</TipView>
      <TipView icon={<Info />} title="Information">
        This tip has both an icon and a title for maximum clarity and visual impact.
      </TipView>
    </div>

    <div>
      <h3>Blue tinted</h3>
      <TipView tint={colors.blue}>This is a blue-tinted tip for informational content.</TipView>
      <TipView tint={colors.blue} title="Information" icon={<Info />}>
        Blue tinted tips work well for general information and helpful hints.
      </TipView>
    </div>

    <div>
      <h3>Green tinted</h3>
      <TipView tint={colors.green}>
        This is a green-tinted tip for success or positive feedback.
      </TipView>
      <TipView tint={colors.green} title="Success" icon={<Check />}>
        Green tinted tips are perfect for success messages and positive feedback.
      </TipView>
    </div>

    <div>
      <h3>Yellow tinted</h3>
      <TipView tint={colors.yellow}>
        This is a yellow-tinted tip for warnings or important notices.
      </TipView>
      <TipView tint={colors.yellow} title="Warning" icon={<AlertTriangle />}>
        Yellow tinted tips draw attention to important warnings or cautions.
      </TipView>
    </div>

    <div>
      <h3>Red tinted</h3>
      <TipView tint={colors.red}>
        This is a red-tinted tip for errors or critical information.
      </TipView>
      <TipView tint={colors.red} title="Error" icon={<AlertTriangle />}>
        Red tinted tips are ideal for error messages and critical alerts.
      </TipView>
    </div>

    <div>
      <h3>Purple tinted</h3>
      <TipView tint={colors.purple}>
        This is a purple-tinted tip for special features or premium content.
      </TipView>
      <TipView tint={colors.purple} title="Premium feature" icon={<Info />}>
        Purple tinted tips can highlight premium features or special content.
      </TipView>
    </div>
  </StyledGrid>
);

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  padding: 20px;
  max-width: 1200px;

  > div {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;

    > h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color);
    }
  }
`;
