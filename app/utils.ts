import { useMatches } from "@remix-run/react";
import { StateFrom } from "xstate";
import { deserializeState } from "./machines/utils";
import * as cookies from "~/cookies";
import { bookingMachine } from "./machines/booking.machine";

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
