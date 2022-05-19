import { createCookie } from "@remix-run/node"; // or "@remix-run/cloudflare"
import { AnyState } from "xstate";
import { serializeState } from "./machines/utils";

export const machineStateCookie = createCookie("machine-state", {
  maxAge: 604_800, // one week
});

export async function createMachineStateCookieHeader(machineState: AnyState) {
  return {
    "Set-Cookie": await machineStateCookie.serialize(serializeState(machineState)),
  }
}
