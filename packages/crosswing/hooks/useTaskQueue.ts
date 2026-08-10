import { ReactNode, createContext, createElement, useState } from "react";
import { useIsMounted } from "./useIsMounted.js";

// It's named "Queue" but it's really not, all tasks are run immediately in
// parallel. But I do reserve the right to make it a real queue in the future.

// Generic type for any class.
type Class<T> = new (...args: any[]) => T;

// Every Task has a unique ID.
let nextId: number = 1;
const getNextId = () => nextId++;

/** A "task" is simply an object that implements the "run" method. */
export interface Task {
  /** You must define a place for us to assign you a Task ID. We don't use it internally, but it is necessary for rendering React array representations of tasks. */
  id: number;
  /** The run() method is called immediately after your Task is queued. */
  run(): Promise<void>;
}

export type TaskQueueContextValue = {
  /** All tasks currently running. */
  tasks: Set<Task>;
  /** Convenience method that filters out only the tasks of a given class type. */
  tasksOfType<T extends Task>(cls: Class<T>): T[];
  /** Add a task to the queue and calls run() on it immediately. */
  queueTask(task: Task): void;
  /** If a Task encountered an error, it will be propagated to here. */
  lastError: Error | null;
};

export const TaskQueueContext = createContext<TaskQueueContextValue>({
  tasks: new Set(),
  tasksOfType: throwsNoProvider,
  queueTask: throwsNoProvider,
  lastError: null,
});
TaskQueueContext.displayName = "TaskQueueContext";

/**
 * Provides a TaskQueue using React.Context. The queue will re-render when
 * Tasks are added or removed from the queue. It will not re-render when Tasks
 * fire events (like "progress" for an upload task), so make sure to sign up for
 * events on tasks you care about.
 */
export function TaskQueueProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Set<Task>>(new Set());

  const addTask = (task: Task) => {
    setTasks((current) => {
      const next = new Set(current);
      next.add(task);
      return next;
    });
  };

  const removeTask = (task: Task) => {
    setTasks((current) => {
      const next = new Set(current);
      next.delete(task);
      return next;
    });
  };

  // Basic error reporting.
  const [lastError, setLastError] = useState<Error | null>(null);
  const isMounted = useIsMounted();

  const queueTask = async (task: Task) => {
    // Assign this task a unique ID.
    task.id = getNextId();

    // Add this task to our queue.
    addTask(task);

    const error = await tryRunTask(task);

    if (error) {
      console.error("Task error:", error);

      if (!isMounted()) {
        console.log(
          "TaskQueueProvider is no longer mounted; the user will not be alerted to this failure.",
        );
        return;
      }

      setLastError(error);
    }

    if (isMounted()) {
      // Remove the task from our global queue.
      removeTask(task);
    }
  };

  const tasksOfType = <T extends Task>(taskClass: Class<T>) =>
    Array.from(tasks).filter((task) => task instanceof taskClass) as T[];

  // Make sure to keep this object reference stable across renders so we don't
  // cause any context children to re-render unnecessarily.
  const contextValue = { tasks, tasksOfType, queueTask, lastError };

  return createElement(TaskQueueContext, {
    value: contextValue,
    children,
  });
}

// Separated out for React Compiler.
async function tryRunTask(task: Task): Promise<Error | null> {
  try {
    await task.run();
    return null;
  } catch (error: any) {
    return error;
  }
}

/**
 * Throw error when TaskQueueContext is used outside of context provider.
 */
function throwsNoProvider(): never {
  throw new Error(
    "Attempted to use TaskQueueContext outside of a provider. Make sure your app is rendered inside <TaskQueueProvider>.",
  );
}
