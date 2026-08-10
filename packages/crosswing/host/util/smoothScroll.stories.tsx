import { useRef, useState } from "react";
import { styled } from "styled-components";
import { smoothScroll } from "./smoothScroll.js";

export default {
  component: smoothScroll,
  parameters: { layout: "centered" },
};

export const Default = () => {
  const ref = useRef<HTMLDivElement>(null);

  // Build the big list of people.
  const [people] = useState(() => {
    const people: Person[] = [];

    for (let i = 0; i < 1000; i++) {
      people.push({ name: `Citizen #${i}` });
    }

    return people;
  });

  return (
    <Container>
      <button onClick={() => smoothScroll(ref.current!, 0)}>Scroll to top</button>
      <div className="people" ref={ref}>
        {people.map((person, i) => (
          <div className="person" key={i}>
            {person.name}
          </div>
        ))}
      </div>
    </Container>
  );
};

interface Person {
  name: string;
}

const Container = styled.div`
  width: 400px;
  height: 400px;
  display: flex;
  flex-flow: column;
  border: 1px solid gray;

  @media (prefers-color-scheme: dark) {
    background: #333;
  }

  > button {
    flex-shrink: 0;
    height: 40px;
    margin: 5px;
  }

  > .people {
    height: 0;
    flex-grow: 1;

    display: flex;
    flex-flow: column;
    overflow: auto;

    > .person {
      flex-shrink: 0;
      height: 50px;
      font-family: sans-serif;
      display: flex;
      flex-flow: column;
      align-items: center;
      justify-content: center;

      @media (prefers-color-scheme: dark) {
        color: white;
      }
    }

    > .person + .person {
      border-top: 1px solid gray;
    }
  }
`;
