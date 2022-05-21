import { useMatches } from "@remix-run/react";
import { Action, AnyStateMachine, EventFrom, interpret, StateFrom } from "xstate";
import { deserializeState } from "./machines/utils";
import * as cookies from "~/cookies";
import { bookingMachine } from "./machines/booking.machine";
import { ActionFunction } from "@remix-run/node";


export function useParentData() {
  const matches = useMatches();
  const parentMatch = matches[matches.length - 2];
  return parentMatch?.data;
}

export async function getMachineStateFromRequest(request: Request): Promise<StateFrom<typeof bookingMachine>> {
  const cookieHeader = request.headers.get("Cookie");
  const machineStateString = await cookies.machineStateCookie.parse(cookieHeader);
  if (machineStateString) {
    return deserializeState(machineStateString);
  } else {
    throw NoValidMachineState("Machine state cookie not found.");
  }
}

type CurryFirst<T> = T extends (x: infer U, ...rest: any) => any ? U : never;
type CurryRest<T> =
    T extends (x: infer U) => infer V ? U :
    T extends (x: infer U, ...rest: infer V) => infer W ? Curried<(...args: V) => W> :
    never

type Curried<T extends (...args: any) => any> = (x: CurryFirst<T>) => CurryRest<T>

export const curry = <T extends (...args: any) => any>(fn: T): Curried<T> => {
    if (!fn.length) { return fn(); }
    return (arg: CurryFirst<T>): CurryRest<T> => {
        return curry(fn.bind(null, arg) as any) as any;
    };
}

// export function canEvent<TMachine extends AnyStateMachine>(machine: TMachine, state: StateFrom<TMachine>, event: EventFrom<TMachine>) {
//   const service = interpret(machine);
//   service.start(state);
//   return service.state.can(event);
// }

export function objTotal(obj: {[key: string]: number}) {
  return Object.values(obj).reduce((acc, curr) => acc + curr, 0);
}
