import firebase from "firebase/compat/app";
import { CSSProperties, useState } from "react";
import { MockFirebaseAppProvider } from "../storybook/MockFirebaseAppProvider";
import { useInfiniteFirestoreQuery } from "./useInfiniteFirestoreQuery";

export default {
  component: useInfiniteFirestoreQuery, // Just for Storybook naming.
  parameters: { layout: "centered" },
};

export const Default = () => {
  // Build the big people collection.
  const [people] = useState(() => {
    const people: Record<string, Omit<Person, "id">> = {};

    for (let i = 0; i < 1000; i++) {
      people[`person${i}`] = { name: `person #${i}` };
    }

    return people;
  });

  return (
    <MockFirebaseAppProvider firestore={{ people }}>
      <Inner />
    </MockFirebaseAppProvider>
  );
};

function Inner() {
  const [people, onScroll] = useInfiniteFirestoreQuery(
    (app) =>
      app()
        .firestore()
        .collection("people") as firebase.firestore.CollectionReference<Person>,
    [],
    {
      pageSize: 50,
    },
  );

  return (
    <div style={containerStyle} onScroll={onScroll}>
      <div style={peopleStyle}>
        {people?.map((person, i) => (
          <div
            style={
              i === 0
                ? personStyle
                : { ...personStyle, borderTop: "1px solid #d1d1d1" }
            }
            key={i}
          >
            {person.name}
          </div>
        ))}
      </div>
    </div>
  );
}

interface Person {
  id: string;
  name: string;
}

const containerStyle: CSSProperties = {
  overflow: "auto",
  width: "300px",
  height: "300px",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #d1d1d1",
};

const peopleStyle: CSSProperties = {
  height: 0,
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
};

const personStyle: CSSProperties = {
  flexShrink: 0,
  height: "50px",
  fontSize: "15px",
  fontFamily: "Fira Sans, sans-serif",
  color: "#333333",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};
