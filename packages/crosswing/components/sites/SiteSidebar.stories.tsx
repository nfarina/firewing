import { Meta } from "@storybook/react";
import { SVGProps, useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { Router } from "../../router/Router.js";
import { MemoryHistory } from "../../router/history/MemoryHistory.js";
import { CrosswingAppDecorator } from "../../storybook.js";
import { SiteSidebar, SiteSidebarArea, SiteSidebarLink } from "./SiteSidebar.js";

export default {
  component: SiteSidebar,
  decorators: [CrosswingAppDecorator()],
  parameters: { layout: "centered" },
} satisfies Meta<typeof SiteSidebar>;

export const Default = () => (
  <Router
    render={() => (
      <SiteSidebar logo={<Logo />}>
        <SiteSidebarArea path="users" title="Users" />
        <SiteSidebarArea path="activity" title="Activity" />
      </SiteSidebar>
    )}
  />
);

export const Expandable = () => {
  // Default to /users/active so it's selected.
  const [history] = useState(() => new MemoryHistory("/users/active"));

  return (
    <Router
      history={history}
      render={() => (
        <SiteSidebar logo={<Logo />}>
          <SiteSidebarArea path="users" title="Users">
            <SiteSidebarLink path="active" title="Active" />
            <SiteSidebarLink path="deleted" title="Deleted" />
          </SiteSidebarArea>
          <SiteSidebarArea path="activity" title="Activity">
            <SiteSidebarLink path="payments" title="Payments" />
          </SiteSidebarArea>
        </SiteSidebar>
      )}
    />
  );
};

const GlobeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.0002 20.9996C12.0033 20.9996 12.0059 20.9996 12.0086 20.9996C12.0124 20.9996 12.0163 21.0011 12.0197 21.0011C12.0201 21.0011 12.0201 21.0011 12.0205 21.0011C12.0208 21.0011 12.0208 21.0011 12.0208 21.0011C12.0266 21.0011 12.0323 20.9988 12.038 20.9988C16.9832 20.9778 21 16.9496 21 11.999C21 7.06074 17.002 3.04014 12.0728 3.00075C12.0709 3.00075 12.0686 3.00075 12.0671 3.00075C12.0449 3.00037 12.0231 2.99884 12.0002 2.99884C7.03743 2.99884 3 7.03665 3 11.999C3 16.9622 7.03743 20.9996 12.0002 20.9996ZM19.7906 11.999C19.7906 13.0219 19.5906 13.9981 19.23 14.8936C18.806 14.7441 18.1449 14.5349 17.2849 14.3349C17.4635 13.5778 17.5621 12.7959 17.5621 11.999C17.5621 11.1922 17.4608 10.3996 17.2776 9.63294C17.9143 9.48266 18.5624 9.29989 19.222 9.08271C19.5871 9.98395 19.7906 10.9682 19.7906 11.999ZM16.3519 11.999C16.3519 12.7137 16.2621 13.4149 16.0996 14.0929C15.0958 13.9158 13.9174 13.7801 12.6055 13.7503V10.2443C13.6987 10.2145 14.868 10.1025 16.0934 9.88071C16.2602 10.5663 16.3519 11.276 16.3519 11.999ZM11.3953 19.2744C9.99849 18.2565 8.9378 16.8658 8.31645 15.284C9.3932 15.1004 10.4241 15.0083 11.3953 14.9807V19.2744ZM12.6055 19.3027V14.9796C13.7683 15.0087 14.8202 15.1253 15.7279 15.2759C15.1012 16.8765 14.0248 18.2806 12.6055 19.3027ZM12.6055 9.01923V4.69579C14.0222 5.71672 15.0978 7.1181 15.7252 8.71487C14.6332 8.90146 13.5882 8.99323 12.6055 9.01923ZM11.3953 4.72409V9.01885C10.2482 8.9875 9.21043 8.87164 8.31301 8.7229C8.9336 7.1376 9.99582 5.74425 11.3953 4.72409ZM11.3953 10.2459V13.7545C10.3132 13.7858 9.15766 13.8956 7.94708 14.1151C7.78075 13.4302 7.68937 12.7213 7.68937 11.9987C7.68937 11.284 7.77884 10.5827 7.94173 9.90403C8.93589 10.0795 10.0987 10.2141 11.3953 10.2459ZM6.76327 14.3625C6.11516 14.5154 5.45404 14.7024 4.7826 14.9257C4.41438 14.0214 4.2102 13.0341 4.2102 11.999C4.2102 10.9712 4.4117 9.99083 4.77534 9.0915C5.19671 9.24177 5.87197 9.45666 6.75639 9.66276C6.57782 10.4198 6.47955 11.2018 6.47955 11.9987C6.47955 12.8054 6.58012 13.5966 6.76327 14.3625ZM5.32977 16.0181C5.93391 15.8231 6.52926 15.6617 7.11429 15.5275C7.6626 17.0123 8.55046 18.3555 9.71133 19.4453C7.86564 18.8771 6.31055 17.6405 5.32977 16.0181ZM14.3514 19.4262C15.5065 18.3356 16.389 16.9939 16.9331 15.5115C17.6879 15.6816 18.2829 15.8579 18.6859 15.9925C17.7174 17.6084 16.1799 18.8457 14.3514 19.4262ZM18.6779 7.99181C18.0856 8.18185 17.5017 8.33976 16.9274 8.47168C16.3825 6.99574 15.5023 5.65936 14.3518 4.57267C16.1741 5.15081 17.7086 6.3828 18.6779 7.99181ZM9.71172 4.55279C8.54587 5.64674 7.65534 6.99612 7.10779 8.48774C6.33158 8.313 5.72361 8.13023 5.3206 7.99563C6.30099 6.36598 7.8599 5.12328 9.71172 4.55279Z"
      fill="currentColor"
    />
  </svg>
);

const Logo = styled(GlobeIcon)`
  width: 50px;
  height: 50px;
  color: ${colors.turquoise()};
`;
