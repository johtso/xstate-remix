import { interpret, StateFrom, EventFrom, AnyStateMachine, AnyState, StateValue } from "xstate";
import { waitFor } from "xstate/lib/waitFor";

export async function asyncInterpret<TMachine extends AnyStateMachine>(
  machine: TMachine,
  msToWait: number,
  initialState: StateFrom<TMachine>,
  initialEvent: EventFrom<TMachine>,
) {
  const service = interpret(machine);
  service.start(initialState);
  if (initialEvent) {
    service.send(initialEvent);
  }
  return await waitFor(
    service,
    (state) => !state.hasTag("busy") || state.done!,
    { timeout: msToWait }
  );
}

export function serializeState(state: AnyState): string {
  return JSON.stringify(state);
}

export function deserializeState(stateString: string): AnyState {
  return JSON.parse(stateString);
}

function stateValueToArray(stateValue: StateValue, acc: string[] = []): string[] {
  // stateValue is a object representing the current state path
  // e.g. { success: { foo: "bar" } }
  // return the flattened state as an array of strings
  // e.g. ["success", "foo", "bar"]
  if (typeof stateValue === "string") {
    acc.push(stateValue);
    return acc;
  } else if (typeof stateValue === "object") {
    return stateValueToArray(stateValue, acc);
  } else {
    throw new Error(`Unexpected stateValue type: ${typeof stateValue}`);
  }
}

export function stateValueToPath(stateValue: StateValue): string {
  return stateValueToArray(stateValue).join("/");
}
