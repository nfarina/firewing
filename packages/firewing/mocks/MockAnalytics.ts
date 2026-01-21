import { action } from "storybook/actions";

/**
 * Mock Analytics for Storybook that logs events via Storybook actions.
 */
export class MockAnalytics {
  public events: Array<{ name: string; params?: Record<string, any> }> = [];

  public logEvent(eventName: string, eventParams?: Record<string, any>): void {
    this.events.push({ name: eventName, params: eventParams });
    action("analytics:logEvent")(eventName, eventParams);
  }

  public setUserId(id: string | null): void {
    action("analytics:setUserId")(id);
  }

  public setUserProperties(properties: Record<string, any>): void {
    action("analytics:setUserProperties")(properties);
  }
}
