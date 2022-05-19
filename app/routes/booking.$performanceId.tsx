import { LoaderFunction, json, redirect, ActionFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AnyEventObject, EventFrom, interpret, StateFrom } from "xstate";
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
  const session = await getSession(
    request.headers.get("Cookie")
  );

  const performanceId = params.performanceId!;
  // if (!Object.keys(performances).includes(performanceId)) {
  //   throw new Response("No Performance With That ID", {
  //     status: 404,
  //   });
  // }
  const performance = performances[performanceId as keyof typeof performances];

  let machineState: StateFrom<typeof bookingMachine>;
  let isInitialState: boolean = false;

  if (!session.has("machineState")) {
    machineState = bookingMachine.initialState;
    session.set("machineState", machineState);
    isInitialState = true;
  } else {
    machineState = session.get("machineState");
  }

  const currentStatePath = stateValueToPath(machineState.value);
  const currentPath = new URL(request.url).pathname;

  const intendedPath = `/booking/${performanceId}/${currentStatePath}`;

  const options: ResponseInit = {}
  if (isInitialState) {
    options.headers = {
      "Set-Cookie": await commitSession(session)
    };
  }

  if (!(currentPath === intendedPath)) {
    return redirect(intendedPath, options);
  } else {   
    return json<LoaderData>({ machineState, performance }, options);
  }
}

export default function IndexRoute() {
  const { machineState } = useLoaderData<LoaderData>();

  console.log("current context root", machineState?.context);

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
