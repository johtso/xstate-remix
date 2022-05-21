import { json, LoaderFunction, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { bookingMachine, BookingMachineState, eventFromPath, NavigablePaths, NavigablePathType, NavigationEvent } from "./machines/booking.machine";
import { asyncInterpret } from "./machines/utils";
import { commitSession, getSession } from "./sessions";


function assertNavigablePath(
  path: string
): asserts path is NavigablePathType {
  if (!(NavigablePaths as unknown as string[]).includes(path)) {
    throw new Error(`Not a navigable path ${path}`);
  }
}

function pathFromStateValue(
  stateValue: BookingMachineState["value"]
): string {
  return typeof stateValue === "string" ? stateValue : Object.keys(stateValue)[0];
}
 
export const loadMachineStateAndEnsureCorrectRoute: LoaderFunction = async ({ request, params }): Promise<BookingMachineState> => {
  const performanceId = params.performanceId;
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const machineState = session.get("machineState") as BookingMachineState;

  const pathname = new URL(request.url).pathname;
  const path = pathname.split("/").pop();
  invariant(path, `could not get current route from url path: ${pathname}`);

  console.log("current path", pathname);
  console.log("current route", path);
  console.log("current state", machineState.value);
  let currentStatePath = pathFromStateValue(machineState.value);
  
  assertNavigablePath(path);

  if (path !== currentStatePath) {
    console.log("path does not match state");
    const navEvent = eventFromPath(path);
    console.log("nav event", navEvent);
    const result = await asyncInterpret(bookingMachine, 5000, machineState, navEvent);
    const newStatePath = pathFromStateValue(result.value);
    console.log("new state", newStatePath);
    if (newStatePath === currentStatePath) {
      throw new Error(`Attempted navigation did not result in state-path change ${path}`);
    }

    session.set("machineState", result);
  
    const options = {
      headers: {"Set-Cookie": await commitSession(session)},
    }

    throw redirect(`/booking/${performanceId}/${newStatePath}`, options);
  }
  return machineState;
}

export type LoaderData = {
  machineState: BookingMachineState;
}

// export const loader: LoaderFunction = async (loaderArgs) => {
//   const machineState = await loadMachineStateAndEnsureCorrectRoute(loaderArgs);
//   return json<LoaderData>({ ticketSelection: machineState.context.tickets });
// }

export const machineStateLoader: LoaderFunction = async (loaderArgs) => {
  const machineState = await loadMachineStateAndEnsureCorrectRoute(loaderArgs);
  return json<LoaderData>({ machineState });
}