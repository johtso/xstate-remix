import { LoaderFunction, json, redirect, ActionFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AnyEventObject, interpret, StateFrom } from "xstate";
import * as cookies from "~/cookies";
import { deserializeState, serializeState, stateValueToPath, asyncInterpret } from "~/machines/utils";
import { bookingMachine } from "~/machines/booking.machine";
import { LoaderData, PerformanceType } from "~/types";
import { getMachineStateFromRequest } from "~/utils";

import { getSession, commitSession } from "~/sessions";

const performances = {
  "1": {
    id: "1",
    title: "The Shawshank Redemption",
  },
  "2": {
    id: "2",
    title: "The Godfather",
  },
} as { [id: string]: PerformanceType };

export const loader: LoaderFunction = async ({ request, params }) => {
  // const session = await getSession(
  //   request.headers.get("Cookie")
  // );

  const performanceId = params.performanceId!;
  if (!Object.keys(performances).includes(performanceId)) {
    throw new Response("No Performance With That ID", {
      status: 404,
    });
  }
  const performance = performances[performanceId as keyof typeof performances];

  let machineState: StateFrom<typeof bookingMachine>;
  let isInitialState: boolean = false;
  try {
    machineState = await getMachineStateFromRequest(request);
  } catch (e) {
    if (e instanceof NoValidMachineState) {
      machineState = bookingMachine.initialState;
      isInitialState = true;
    } else {
      throw e;
    }
  }

  const currentStatePath = stateValueToPath(machineState.value);
  const currentPath = new URL(request.url).pathname;

  const intendedPath = `/booking/${performanceId}/${currentStatePath}`;

  const options: ResponseInit = {}
  if (isInitialState) {
    options.headers = await cookies.createMachineStateCookieHeader(machineState);
    console.log("setting cookie in loader (initial)", machineState.context);
  }

  if (!(currentPath === intendedPath)) {
    return redirect(intendedPath, options);
  } else {   
    return json<LoaderData>({ machineState, performance }, options);
  }
}

export const action: ActionFunction = async ({ request }) => {
  const machineState = await getMachineStateFromRequest(request);
  console.log("machine state before action", machineState.context);
  if (machineState === null) {
    throw new Response("No Machine State", {
      status: 500,
    });
  }

  const formData = await request.formData();
  let values = Object.fromEntries(formData);
  console.log("root action triggered");

  for (let key in values) {
    if (key.endsWith("[]")) {
      delete values[key];
      values[key.slice(0, -2)] = formData.getAll(key);
    }
  }
  const result = await asyncInterpret(bookingMachine, 5000, machineState, values as AnyEventObject);
  console.log("setting cookie following event", result.context);
  return new Response("success", {
    status: 200,
    headers: await cookies.createMachineStateCookieHeader(result),
  }) 
}

export default function IndexRoute() {
  const { machineState } = useLoaderData<LoaderData>();

  console.log("current context root", machineState.context);

  return (
    <div>
      <h1>Booking Page</h1>
      <h2>Current State</h2>
      <pre>{ machineState.value }</pre>
      <h2>Seats</h2>
      <pre>{ JSON.stringify(machineState?.context.seats) }</pre>
      <h2>Tickets</h2>
      <pre>{ JSON.stringify(machineState?.context.tickets) }</pre>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
