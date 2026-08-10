import { Meta } from "@storybook/react";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { colors } from "../colors/colors.js";
import { CrosswingAppDecorator } from "../storybook.js";
import { useNewPersistedState } from "./useNewPersistedState.js";

export default {
  component: useNewPersistedState as any, // Just for auto story naming.
  decorators: [CrosswingAppDecorator({ layout: "fullscreen" })],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof useNewPersistedState>;

export const BasicTextInput = () => {
  const [logs, setLogs] = useState<ReactNode[]>([]);
  const [persistedValue, setPersistedValue] = useState("Initial value");
  const [simulateError, setSimulateError] = useState(false);

  function log(message: ReactNode) {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((logs) => [...logs, `[${timestamp}] ${message}`]);
  }

  const persistedState = useNewPersistedState({
    key: "test-text-input",
    persistedValue,
    updateFunc: async (newValue: string) => {
      log(`🔄 updateFunc called with: "${newValue}"`);

      if (simulateError) {
        throw new Error("Simulated database error!");
      }

      // Simulate network delay
      await wait(300);
      setPersistedValue(newValue);
      log(`✅ Successfully persisted: "${newValue}"`);
    },
    updateDelay: 1000, // 1 second delay
    onComplete: (value) => log(`🎉 onComplete: "${value}"`),
    onError: (error) => log(`❌ onError: ${error.message}`),
  });

  return (
    <div style={ContainerStyle}>
      <h3>Basic Text Input with Persistence</h3>

      <div style={ControlsStyle}>
        <label>
          Draft Value:
          <input
            type="text"
            value={persistedState.value}
            onChange={(e) => {
              log(`⌨️ User typed: "${e.target.value}"`);
              persistedState.set(e.target.value);
            }}
            style={InputStyle}
          />
        </label>

        <div style={StateStyle}>
          <div>Draft Value: "{persistedState.value}"</div>
          <div>Persisted Value: "{persistedValue}"</div>
          <div>Error: {persistedState.error?.message || "None"}</div>
          <div>Is Updating: {persistedState.isUpdating ? "🔄 Yes" : "No"}</div>
        </div>

        <div style={ButtonGroupStyle}>
          <button onClick={() => persistedState.set("Force update")}>Force Update</button>
          <button onClick={() => setSimulateError(!simulateError)}>
            {simulateError ? "Disable" : "Enable"} Errors
          </button>
          <button onClick={() => setLogs([])}>Clear Logs</button>
        </div>
      </div>

      <div style={LogsStyle}>
        <h4>Event Log:</h4>
        {logs.map((log, i) => (
          <div key={i} style={LogLineStyle}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export const RapidTyping = () => {
  const [logs, setLogs] = useState<ReactNode[]>([]);
  const [persistedValue, setPersistedValue] = useState("");
  const [updateCount, setUpdateCount] = useState(0);

  function log(message: ReactNode) {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((logs) => [...logs, `[${timestamp}] ${message}`]);
  }

  const persistedState = useNewPersistedState({
    key: "rapid-typing-test",
    persistedValue,
    updateFunc: async (newValue: string) => {
      const currentUpdate = updateCount + 1;
      setUpdateCount(currentUpdate);
      log(`🔄 Update #${currentUpdate}: "${newValue}"`);

      await wait(500); // Simulate slower network
      setPersistedValue(newValue);
      log(`✅ Completed #${currentUpdate}: "${newValue}"`);
    },
    updateDelay: 500, // Shorter delay for rapid typing
    onComplete: (value) => log(`🎉 Final result: "${value}"`),
    onError: null,
  });

  function simulateRapidTyping() {
    const words = [
      "Hello",
      "Hello ",
      "Hello w",
      "Hello wo",
      "Hello wor",
      "Hello worl",
      "Hello world",
      "Hello world!",
    ];
    log("🚀 Starting rapid typing simulation...");

    words.forEach((word, index) => {
      setTimeout(() => {
        log(`⌨️ Simulating type: "${word}"`);
        persistedState.set(word);
      }, index * 100); // Type every 100ms
    });
  }

  return (
    <div style={ContainerStyle}>
      <h3>Rapid Typing Test</h3>

      <div style={ControlsStyle}>
        <div style={StateStyle}>
          <div>Current Draft: "{persistedState.value}"</div>
          <div>Last Persisted: "{persistedValue}"</div>
          <div>Update Count: {updateCount}</div>
          <div>Is Updating: {persistedState.isUpdating ? "🔄 Yes" : "No"}</div>
        </div>

        <div style={ButtonGroupStyle}>
          <button onClick={simulateRapidTyping}>Simulate Rapid Typing</button>
          <button onClick={() => setLogs([])}>Clear Logs</button>
        </div>
      </div>

      <div style={LogsStyle}>
        <h4>Event Log (shows debouncing in action):</h4>
        {logs.map((log, i) => (
          <div key={i} style={LogLineStyle}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ToggleState = () => {
  const [logs, setLogs] = useState<ReactNode[]>([]);
  const [persistedValue, setPersistedValue] = useState(false);

  function log(message: ReactNode) {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((logs) => [...logs, `[${timestamp}] ${message}`]);
  }

  const persistedState = useNewPersistedState({
    key: "toggle-test",
    persistedValue,
    updateFunc: async (newValue: boolean) => {
      log(`🔄 Toggling to: ${newValue}`);
      await wait(200);
      setPersistedValue(newValue);
      log(`✅ Persisted: ${newValue}`);
    },
    updateDelay: 800,
    onComplete: (value) => log(`🎉 Toggle complete: ${value}`),
    onError: null,
  });

  return (
    <div style={ContainerStyle}>
      <h3>Toggle State Test</h3>

      <div style={ControlsStyle}>
        <div style={StateStyle}>
          <div>Draft State: {String(persistedState.value)}</div>
          <div>Persisted State: {String(persistedValue)}</div>
          <div>Is Updating: {persistedState.isUpdating ? "🔄 Yes" : "No"}</div>
        </div>

        <div style={ButtonGroupStyle}>
          <button onClick={persistedState.toggle}>Toggle Value</button>
          <button onClick={() => setLogs([])}>Clear Logs</button>
        </div>
      </div>

      <div style={LogsStyle}>
        <h4>Toggle Event Log:</h4>
        {logs.map((log, i) => (
          <div key={i} style={LogLineStyle}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ErrorHandling = () => {
  const [logs, setLogs] = useState<ReactNode[]>([]);
  const [persistedValue, setPersistedValue] = useState("stable value");
  const [shouldError, setShouldError] = useState(false);

  function log(message: ReactNode) {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((logs) => [...logs, `[${timestamp}] ${message}`]);
  }

  const persistedState = useNewPersistedState({
    key: "error-test",
    persistedValue,
    updateFunc: async (newValue: string) => {
      log(`🔄 Attempting to update: "${newValue}"`);

      if (shouldError) {
        throw new Error("Database connection failed!");
      }

      await wait(300);

      if (newValue === "bad value") {
        throw new Error("Bad value!");
      }

      setPersistedValue(newValue);
      log(`✅ Successfully updated: "${newValue}"`);
    },
    updateDelay: 600,
    onComplete: (value) => log(`🎉 Update successful: "${value}"`),
    onError: (error) => log(`❌ Update failed: ${error.message}`),
  });

  return (
    <div style={ContainerStyle}>
      <h3>Error Handling Test</h3>

      <div style={ControlsStyle}>
        <div style={StateStyle}>
          <div>Draft Value: "{persistedState.value}"</div>
          <div>Persisted Value: "{persistedValue}"</div>
          <div>Error: {persistedState.error?.message || "None"}</div>
          <div>Error Mode: {shouldError ? "ON" : "OFF"}</div>
          <div>Is Updating: {persistedState.isUpdating ? "🔄 Yes" : "No"}</div>
        </div>

        <div style={ButtonGroupStyle}>
          <button onClick={() => persistedState.set("good value")}>Update to "good value"</button>
          <button onClick={() => persistedState.set("neutral value")}>
            Update to "neutral value"
          </button>
          <button onClick={() => persistedState.set("bad value")}>Update to "bad value"</button>
          <button onClick={() => setShouldError(!shouldError)}>
            {shouldError ? "Disable" : "Enable"} Error Mode
          </button>
          <button onClick={() => setLogs([])}>Clear Logs</button>
        </div>
      </div>

      <div style={LogsStyle}>
        <h4>Error Handling Log:</h4>
        {logs.map((log, i) => (
          <div key={i} style={LogLineStyle}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ConcurrentUpdates = () => {
  const [logs, setLogs] = useState<ReactNode[]>([]);
  const [persistedValue, setPersistedValue] = useState("initial");
  const [updateCounter, setUpdateCounter] = useState(0);

  function log(message: ReactNode) {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((logs) => [...logs, `[${timestamp}] ${message}`]);
  }

  const persistedState = useNewPersistedState({
    key: "concurrent-test",
    persistedValue,
    updateFunc: async (newValue: string) => {
      // Increment counter and capture this update's number
      const updateNumber = updateCounter + 1;
      setUpdateCounter(updateNumber);

      log(`🔄 Update #${updateNumber} starting: "${newValue}"`);

      // Artificial delay based on content - "slow" takes 3 seconds, others take 500ms
      const delay = newValue.includes("slow") ? 3000 : 500;
      log(`⏰ Update #${updateNumber} will take ${delay}ms`);

      await wait(delay);

      // Simulate the race condition - the last one to complete wins
      setPersistedValue(newValue);
      log(`✅ Update #${updateNumber} completed: "${newValue}" (NOW PERSISTED)`);
    },
    updateDelay: 400, // Short delay to make concurrent calls more likely
    onComplete: (value) => log(`🎉 onComplete: "${value}"`),
    onError: null,
  });

  function simulateRaceCondition() {
    log("🚀 Simulating race condition...");
    log("📝 Type 'slow update' first, then 'fast update' quickly");

    // First update: slow (3 second delay)
    setTimeout(() => {
      log(`⌨️ User types: "slow update"`);
      persistedState.set("slow update");
    }, 100);

    // Second update: fast (500ms delay) - should complete first but gets overwritten
    setTimeout(() => {
      log(`⌨️ User types: "fast update"`);
      persistedState.set("fast update");
    }, 600); // 600ms later, but before the first update completes
  }

  return (
    <div style={ContainerStyle}>
      <h3>Concurrent Updates Test (Race Condition Demo)</h3>

      <div style={ControlsStyle}>
        <div style={StateStyle}>
          <div>Draft Value: "{persistedState.value}"</div>
          <div>Persisted Value: "{persistedValue}"</div>
          <div>Update Counter: {updateCounter}</div>
          <div>Is Updating: {persistedState.isUpdating ? "🔄 Yes" : "No"}</div>
        </div>

        <div style={ButtonGroupStyle}>
          <button onClick={() => persistedState.set("slow update")}>Slow Update (3s delay)</button>
          <button onClick={() => persistedState.set("fast update")}>
            Fast Update (0.5s delay)
          </button>
          <button onClick={simulateRaceCondition}>Simulate Race Condition</button>
          <button onClick={() => setLogs([])}>Clear Logs</button>
        </div>

        <div
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: colors.textSecondary(),
          }}
        >
          Expected problem: "slow update" should overwrite "fast update" even though it started
          first
        </div>
      </div>

      <div style={LogsStyle}>
        <h4>Race Condition Log:</h4>
        <div style={{ marginBottom: "10px", fontSize: "12px", opacity: 0.8 }}>
          Watch the update numbers - a lower-numbered update completing after a higher-numbered one
          indicates the race condition bug.
        </div>
        {logs.map((log, i) => (
          <div key={i} style={LogLineStyle}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export const KeyIsolation = () => {
  const [logs, setLogs] = useState<ReactNode[]>([]);
  const [currentKey, setCurrentKey] = useState("user-1");

  // Simulate a database with multiple objects
  const [database, setDatabase] = useState({
    "user-1": "John Doe",
    "user-2": "Jane Smith",
    "user-3": "Bob Johnson",
  });

  function log(message: ReactNode) {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((logs) => [...logs, `[${timestamp}] ${message}`]);
  }

  const persistedState = useNewPersistedState({
    key: currentKey,
    persistedValue: database[currentKey as keyof typeof database],
    updateFunc: async (newValue: string) => {
      // Capture the key at the time this update was scheduled
      const updateKey = currentKey;
      log(`🔄 [${updateKey}] Starting update to: "${newValue}"`);

      // Simulate a slow update to make key switching more obvious
      await wait(2000);

      // Update our fake database
      setDatabase((prev) => ({
        ...prev,
        [updateKey]: newValue,
      }));

      log(`✅ [${updateKey}] Successfully persisted: "${newValue}"`);
    },
    updateDelay: 1000,
    onComplete: (value) => log(`🎉 [${currentKey}] onComplete: "${value}"`),
    onError: (error) => log(`❌ [${currentKey}] onError: ${error.message}`),
  });

  // Store a ref to track pending edits per key
  const pendingEditsRef = useRef<Record<string, string>>({});

  function switchToKey(newKey: string) {
    log(`🔀 Switching from ${currentKey} to ${newKey}`);
    setCurrentKey(newKey);
  }

  // Apply any pending edit when we switch to a key
  useEffect(() => {
    const pendingEdit = pendingEditsRef.current[currentKey];
    if (pendingEdit) {
      log(`⌨️ Applying pending edit for ${currentKey}: "${pendingEdit}"`);
      persistedState.set(pendingEdit);
      delete pendingEditsRef.current[currentKey];
    }
  }, [currentKey, persistedState]);

  function editCurrentKey(value: string) {
    log(`⌨️ Editing ${currentKey}: "${value}"`);
    persistedState.set(value);
  }

  function editKey(key: string, value: string) {
    if (key === currentKey) {
      editCurrentKey(value);
    } else {
      // Queue the edit for when we switch to this key
      log(`📝 Queueing edit for ${key}: "${value}" (will apply when switched to)`);
      pendingEditsRef.current[key] = value;
    }
  }

  function simulateKeySwitch() {
    log("🚀 Starting key isolation test...");

    // Make sure we start on user-1
    setCurrentKey("user-1");

    // Edit user-1
    setTimeout(() => {
      editKey("user-1", "John Doe Updated");
    }, 100);

    // Switch to user-2 while user-1 is still updating
    setTimeout(() => {
      switchToKey("user-2");
    }, 500);

    // Queue edit for user-2 (will apply after switch)
    setTimeout(() => {
      editKey("user-2", "Jane Smith Updated");
    }, 700);

    // Switch to user-3 and edit
    setTimeout(() => {
      switchToKey("user-3");
      setTimeout(() => {
        editKey("user-3", "Bob Johnson Updated");
      }, 100);
    }, 1500);

    // Switch back to user-1 to verify it was updated
    setTimeout(() => {
      switchToKey("user-1");
    }, 6000);

    // Finally switch to user-2 to verify it was updated too
    setTimeout(() => {
      switchToKey("user-2");
    }, 8000);
  }

  return (
    <div style={ContainerStyle}>
      <h3>Key Isolation Test</h3>

      <div style={ControlsStyle}>
        <div style={StateStyle}>
          <div>
            Current Key: <strong>{currentKey}</strong>
          </div>
          <div>Draft Value: "{persistedState.value}"</div>
          <div>Database State:</div>
          <div style={{ marginLeft: "20px", fontSize: "12px" }}>
            {Object.entries(database).map(([k, v]) => (
              <div
                key={k}
                style={{
                  fontWeight: k === currentKey ? "bold" : "normal",
                  color: k === currentKey ? colors.primary() : colors.textSecondary(),
                }}
              >
                {k}: "{v}"
              </div>
            ))}
          </div>
          <div>Is Updating: {persistedState.isUpdating ? "🔄 Yes" : "No"}</div>
        </div>

        <div style={ButtonGroupStyle}>
          {Object.keys(database).map((k) => (
            <button
              key={k}
              onClick={() => switchToKey(k)}
              style={{
                fontWeight: k === currentKey ? "bold" : "normal",
                opacity: k === currentKey ? 1 : 0.7,
              }}
            >
              Switch to {k}
            </button>
          ))}
          <button onClick={simulateKeySwitch}>Run Isolation Test</button>
          <button onClick={() => setLogs([])}>Clear Logs</button>
        </div>

        <div
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: colors.textSecondary(),
          }}
        >
          <strong>Expected behavior:</strong> Each user should maintain their own update queue.
          Switching keys mid-update should not cancel or interfere with other keys' updates.
        </div>
      </div>

      <div style={LogsStyle}>
        <h4>Key Isolation Log:</h4>
        {logs.map((log, i) => (
          <div key={i} style={LogLineStyle}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function
async function wait(ms: number = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Styles
const ContainerStyle: CSSProperties = {
  fontFamily: "sans-serif",
  padding: "20px",
  maxWidth: "600px",
  background: colors.textBackground(),
  borderRadius: "8px",
  color: colors.text(),
};

const ControlsStyle: CSSProperties = {
  marginBottom: "20px",
  padding: "15px",
  background: colors.textBackground(),
  borderRadius: "6px",
  border: `1px solid ${colors.separator()}`,
};

const StateStyle: CSSProperties = {
  marginBottom: "15px",
  padding: "10px",
  background: colors.textBackgroundAlt(),
  borderRadius: "4px",
  fontSize: "14px",
  color: colors.textSecondary(),
};

const ButtonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const InputStyle: CSSProperties = {
  marginLeft: "10px",
  padding: "6px 10px",
  fontSize: "14px",
  border: `1px solid ${colors.separator()}`,
  borderRadius: "4px",
  minWidth: "200px",
  background: colors.textBackground(),
  color: colors.text(),
};

const LogsStyle: CSSProperties = {
  background: colors.textBackgroundAlt(),
  color: colors.text(),
  padding: "15px",
  borderRadius: "6px",
  fontSize: "13px",
  fontFamily: "Monaco, Consolas, monospace",
  maxHeight: "300px",
  overflowY: "auto",
};

const LogLineStyle: CSSProperties = {
  marginBottom: "4px",
  lineHeight: "1.4",
};
