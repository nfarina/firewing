import { Meta, StoryFn } from "@storybook/react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { Badge } from "./Badge.js";
import { Sidebar } from "lucide-react";

export default {
  component: Badge,
  decorators: [CrosswingAppDecorator()],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Badge>;

type Story = StoryFn<typeof Badge>;

export const AllVariations = () => (
  <StyledGrid>
    <div>
      <h3>Default</h3>
      <Badge>Default</Badge>
      <Badge icon={<Sidebar />}>With icon</Badge>
      <Badge small>Small</Badge>
      <Badge small icon={<Sidebar />}>
        Small icon
      </Badge>
      <Badge large>Large</Badge>
      <Badge large icon={<Sidebar />}>
        Large icon
      </Badge>
    </div>

    <div>
      <h3>Bordered</h3>
      <Badge bordered>Bordered</Badge>
      <Badge bordered icon={<Sidebar />}>
        With icon
      </Badge>
      <Badge bordered small>
        Small
      </Badge>
      <Badge bordered small icon={<Sidebar />}>
        Small icon
      </Badge>
      <Badge bordered large>
        Large
      </Badge>
      <Badge bordered large icon={<Sidebar />}>
        Large icon
      </Badge>
    </div>

    <div>
      <h3>Pill</h3>
      <Badge pill>Pill</Badge>
      <Badge pill icon={<Sidebar />}>
        With icon
      </Badge>
      <Badge pill small>
        Small
      </Badge>
      <Badge pill small icon={<Sidebar />}>
        Small icon
      </Badge>
      <Badge pill large>
        Large
      </Badge>
      <Badge pill large icon={<Sidebar />}>
        Large icon
      </Badge>
    </div>

    <div>
      <h3>Yellow tinted</h3>
      <Badge tint={colors.yellow}>Default</Badge>
      <Badge tint={colors.yellow} bordered>
        Bordered
      </Badge>
      <Badge tint={colors.yellow} pill>
        Pill
      </Badge>
      <Badge tint={colors.yellow} small>
        Small
      </Badge>
      <Badge tint={colors.yellow} large>
        Large
      </Badge>
    </div>

    <div>
      <h3>Red tinted</h3>
      <Badge tint={colors.red}>Default</Badge>
      <Badge tint={colors.red} bordered>
        Bordered
      </Badge>
      <Badge tint={colors.red} pill>
        Pill
      </Badge>
      <Badge tint={colors.red} small>
        Small
      </Badge>
      <Badge tint={colors.red} large>
        Large
      </Badge>
    </div>

    <div>
      <h3>Green tinted</h3>
      <Badge tint={colors.green}>Default</Badge>
      <Badge tint={colors.green} bordered>
        Bordered
      </Badge>
      <Badge tint={colors.green} pill>
        Pill
      </Badge>
      <Badge tint={colors.green} small>
        Small
      </Badge>
      <Badge tint={colors.green} large>
        Large
      </Badge>
    </div>
  </StyledGrid>
);

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  padding: 20px;

  > div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    > h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color);
    }
  }
`;
