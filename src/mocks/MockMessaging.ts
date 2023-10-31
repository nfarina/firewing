import { MockMessagesData } from "./types";

/**
 * Bare minimum stub to get consuming code to work.
 */
export class MockMessaging {
  public messages: MockMessagesData = [];

  public sendToDevice(...params: any) {
    this.messages.push(params);

    return {
      results: [{}],
    };
  }
}
