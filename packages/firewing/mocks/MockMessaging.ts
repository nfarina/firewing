import { MockMessagesData } from "./types";

/**
 * Bare minimum stub to get consuming code to work.
 */
export class MockMessaging {
  public messages: MockMessagesData = [];

  public send(...params: any) {
    this.messages.push(params);

    return {
      results: [{}],
    };
  }

  public sendEach(...messages: any[]) {
    this.messages.push(...messages);

    return {
      responses: messages.map(() => ({})),
    };
  }
}
