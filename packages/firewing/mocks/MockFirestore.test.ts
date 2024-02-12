import { describe, expect, test } from "vitest";
import { MockFirestore } from "./MockFirestore.js";

describe("queries documents", () => {
  const message1 = {
    userId: "user1",
    created: 100,
    text: "What's your favorite color?",
  };

  const message2 = {
    userId: "user1",
    created: 200,
    text: "Red.",
  };

  const firestore = new MockFirestore({
    messages: {
      message1,
      message2,
    },
  });

  test("gets documents by id", async () => {
    const message = await firestore
      .collection("messages")
      .doc("message2")
      .get();

    expect(message.data()).toEqual(message2);
  });

  test("gets a null document when id is undefined", async () => {
    const message = await firestore.collection("messages").doc(undefined).get();

    expect(message.exists()).toBe(false);
    expect(message.data()).toBe(null);
  });

  test("compares using equality filters", async () => {
    const messages = await firestore
      .collection("messages")
      .where("text", "==", "Red.")
      .get();

    expect(messages.docs.map((doc) => doc.data())).toEqual([message2]);
  });

  test("compares using inequality filters", async () => {
    const messages = await firestore
      .collection("messages")
      .where("created", ">", 150)
      .get();

    expect(messages.docs.map((doc) => doc.data())).toEqual([message2]);
  });

  test("limits results", async () => {
    const messages = await firestore.collection("messages").limit(1).get();

    expect(messages.docs.map((doc) => doc.data())).toEqual([message1]);
  });

  test("sorts results ascending", async () => {
    const messages = await firestore
      .collection("messages")
      .orderBy("created", "asc")
      .get();

    expect(messages.docs.map((doc) => doc.data())).toEqual([
      message1,
      message2,
    ]);
  });

  test("sorts results descending", async () => {
    const messages = await firestore
      .collection("messages")
      .orderBy("created", "desc")
      .get();

    expect(messages.docs.map((doc) => doc.data())).toEqual([
      message2,
      message1,
    ]);
  });

  test("sorts results by multiple fields", async () => {
    const messages = await firestore
      .collection("messages")
      .orderBy("userId", "asc")
      .orderBy("created", "desc")
      .get();

    expect(messages.docs.map((doc) => doc.data())).toEqual([
      message2,
      message1,
    ]);
  });

  test("starts at a given field value", async () => {
    const messages = await firestore
      .collection("messages")
      .orderBy("created", "asc")
      .startAt(200)
      .get();

    expect(messages.docs.map((doc) => doc.data())).toEqual([message2]);
  });

  test("starts at multiple field values", async () => {
    const messages = await firestore
      .collection("messages")
      .orderBy("userId", "asc")
      .orderBy("created", "asc")
      .startAt("user1", 200)
      .get();

    expect(messages.docs.map((doc) => doc.data())).toEqual([message2]);
  });

  test("starts after a given field value", async () => {
    const messages = await firestore
      .collection("messages")
      .orderBy("created", "asc")
      .startAfter(100)
      .get();

    expect(messages.docs.map((doc) => doc.data())).toEqual([message2]);
  });

  test("ends at a given field value", async () => {
    const messages = await firestore
      .collection("messages")
      .orderBy("created", "asc")
      .endAt(100)
      .get();

    expect(messages.docs.map((doc) => doc.data())).toEqual([message1]);
  });

  test("ends before a given field value", async () => {
    const messages = await firestore
      .collection("messages")
      .orderBy("created", "asc")
      .endBefore(200)
      .get();

    expect(messages.docs.map((doc) => doc.data())).toEqual([message1]);
  });
});

test("adds documents", async () => {
  const firestore = new MockFirestore();

  // Create a document.
  await firestore.collection("messages").doc("message1").set({
    text: "Hello, MockFirestore!",
  });

  // Create another document that tests our automatic-ID function.
  await firestore.collection("entries").doc().set({
    text: "Document name should be 'entry1'.",
  });

  // Ensure our data is in the shape we want.
  expect(firestore.data).toEqual({
    entries: {
      entry1: {
        text: "Document name should be 'entry1'.",
      },
    },
    messages: {
      message1: {
        text: "Hello, MockFirestore!",
      },
    },
  });
});

test("updates documents", async () => {
  const firestore = new MockFirestore();

  // Create a document.
  await firestore.collection("messages").doc("message1").set({
    text: "Hello, MockFirestore!",
  });

  // Update the document.
  await firestore.collection("messages").doc("message1").update({
    text: "Updated message!",
  });

  expect(firestore.data).toEqual({
    messages: {
      message1: {
        text: "Updated message!",
      },
    },
  });
});

test("removes objects that become empty", async () => {
  const firestore = new MockFirestore();

  // Create a document.
  await firestore
    .collection("messages")
    .doc("message1")
    .set({
      text: "Hello, MockFirestore!",
      from: {
        name: { first: "Nick" },
      },
    });

  class DeleteTransform {}

  // Update the document and clear out the from.name field.
  await firestore
    .collection("messages")
    .doc("message1")
    .update({
      ["from.name.first"]: new DeleteTransform(),
    });

  expect(firestore.data).toEqual({
    messages: {
      message1: {
        text: "Hello, MockFirestore!",
      },
    },
  });
});

test("deletes documents", async () => {
  const firestore = new MockFirestore();

  // Create a document.
  await firestore.collection("messages").doc("message1").set({
    text: "Hello, MockFirestore!",
  });

  // Delete the document.
  await firestore.collection("messages").doc("message1").delete();

  expect(firestore.data).toEqual({});
});

test("runs batch operations", async () => {
  const firestore = new MockFirestore();

  const batch = firestore.batch();

  // Create a document.
  const documentRef = firestore.collection("messages").doc("message1");

  batch.set(documentRef, {
    text: "Hello, Batch!",
  });

  // Ensure nothing changed.
  expect(firestore.data).toEqual({});

  // Update the document.
  batch.update(documentRef, {
    text: "Updated in Batch!",
  });

  await batch.commit();

  expect(firestore.data).toEqual({
    messages: {
      message1: {
        text: "Updated in Batch!",
      },
    },
  });
});

test("runs transactions", async () => {
  const firestore = new MockFirestore();

  // Create a document.
  const documentRef = firestore.collection("messages").doc("message1");

  await documentRef.set({ text: "Hello, MockFirestore!" });

  const result = await firestore.runTransaction(async (tx) => {
    // Retrieve the document.
    const message: any = (await tx.get(documentRef)).data();

    // Update the document if the text matches.
    if (message.text === "Hello, MockFirestore!") {
      tx.update(documentRef, {
        text: "Updated message!",
      });
      return true;
    }

    // Return false if not.
    return false;
  });

  expect(result).toBe(true);

  expect(firestore.data).toEqual({
    messages: {
      message1: {
        text: "Updated message!",
      },
    },
  });
});
