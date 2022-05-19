import { ActionFunction, ErrorBoundaryComponent, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useLoaderData, useLocation, useMatches, useSubmit, useTransition } from "@remix-run/react";
import { AnyEventObject, AnyStateMachine, EventFrom, interpret, StateFrom } from "xstate";
import { bookingMachine, BookingMachineState } from "~/machines/booking.machine";
import { canEvent as _canEvent, curry, getMachineStateFromRequest, useParentData } from "~/utils";

import { getSession, commitSession } from "~/sessions";
import { asyncInterpret, deserializeState } from "~/machines/utils";
import { machineEventAction } from "~/actions";
import React from "react";
import { useHydrated, useRouteData } from "remix-utils";
import { HiddenRedirectField } from "~/components/utils";


type LoaderData = {
  machineState: BookingMachineState;
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const machineState = session.get("machineState");
  console.log("seats loader machineState", machineState?.context);
  return json<LoaderData>({ machineState });
}

export const action = machineEventAction;

export default function SeatsRoute() {
  const { machineState } = useLoaderData<LoaderData>();
  const canEvent = curry(_canEvent)(bookingMachine)(machineState);
  const submit = useSubmit();
  const isHydrated = useHydrated();

  const waitingForServer = false;

  function submitForm(event: React.FormEvent<HTMLInputElement>) {
    submit(event.currentTarget.form, { replace: true });
  }

  const seats = machineState.context.seats;
  const checkboxes = seats.map((selected, i) => (
    <input
      type="checkbox"
      key={i}
      id={`${i}`}
      name={`selections[]`}
      value={`${i}`}
      defaultChecked={selected}
      onChange={submitForm}
    />
  ))
  return (
    <div>
      <h3>Seat Picker</h3>
      <Form method="post">
        <fieldset>{checkboxes}</fieldset>
        <input type="hidden" name="type" value="UPDATE_SEAT_SELECTION"/>
        <HiddenRedirectField />
      </Form>
      <Form method="post">
        <button type="submit" disabled={!canEvent("CONFIRM_SEAT_SELECTION") || waitingForServer} name="type" value="CONFIRM_SEAT_SELECTION">CONFIRM</button>
      </Form>
    </div>
  );
}