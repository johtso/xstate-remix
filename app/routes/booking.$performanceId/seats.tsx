import { ActionFunction, ErrorBoundaryComponent, json, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData, useMatches } from "@remix-run/react";
import { interpret } from "xstate";
import { bookingMachine, BookingMachineState } from "~/machines/booking.machine";
import { LoaderData } from "~/types";
import { getMachineStateFromRequest, useParentData } from "~/utils";


export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <p>The stack trace is:</p>
      <pre>{error.stack}</pre>
    </div>
  );
}

type LoaderData = {
  machineState: BookingMachineState;
}

export const loader: LoaderFunction = async ({ request }) => {
  const machineState = await getMachineStateFromRequest(request);
  console.log("seats loader machineState", machineState.context);
  return json<LoaderData>({ machineState });
}

export default function SeatsRoute() {
  // const data = useParentData();
  // const machineState: LoaderData["machineState"] = data.machineState;
  
  const { machineState } = useLoaderData<LoaderData>();

  console.log("current context seats", machineState.context);
  const machineService = interpret(bookingMachine);
  machineService.start(machineState);

  const eventWouldChangeState = machineService.state.nextEvents.includes("SEAT_SELECTION");

  const seats = machineState.context.seats;
  const checkboxes = seats.map((selected, i) => (
    <input type="checkbox" key={i} id={`${i}`} name={`selections[]`} value={`${i}`} defaultChecked={selected} />
  ))
  return (
    <div>
      <h1>Seats Page</h1>
      <Form action=".." method="post">
        <fieldset>{checkboxes}</fieldset>
        <button type="submit" name="type" value="SEAT_SELECTION" disabled={!eventWouldChangeState}>SAVE</button>
      </Form>
    </div>
  );
}