import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { bookingMachine } from "~/machines/booking.machine";
import { machineEventAction } from "~/actions";
import React from "react";
import { HiddenRedirectField, MachineLink } from "~/components/utils";
import { LoaderData, machineStateLoader } from "~/loaders";
import { interpret } from "xstate";
import { useInterpretedMachine, useSubmitCurrentForm } from "~/hooks";

export const loader = machineStateLoader;

export const action = machineEventAction;

export default function SeatsRoute() {
  const machine = useInterpretedMachine();
  // const interpretedMachine = interpret(bookingMachine).start(machineState);
  // const canEvent = curry(_canEvent)(bookingMachine)(machineState);

  const formRef = React.useRef<HTMLFormElement>(null);

  const submit = useSubmit();
  const onFormChange = () => {
    submit(formRef.current);
  }
  const seats = machine.state.context.seats;
  const checkboxes = seats.map((selected, i) => (
    <input
      type="checkbox"
      key={i}
      id={`${i}`}
      name={`event.selections[]`}
      value={`${i}`}
      defaultChecked={selected}
      onChange={onFormChange}
    />
  ))
  return (
    <div>
      <h3>Seat Picker</h3>
      <Form method="post" ref={formRef}>
        <fieldset>{checkboxes}</fieldset>
        <input type="hidden" name="event.type" value="UPDATE_SEAT_SELECTION"/>
        <HiddenRedirectField />
      </Form>
      <MachineLink machine={machine} to="tickets" isSibling={true}>CONFIRM</MachineLink>
      {/* <Form method="post">
        <button type="submit" disabled={!canEvent("CONFIRM_SEAT_SELECTION") || waitingForServer} name="type" value="CONFIRM_SEAT_SELECTION">CONFIRM</button>
      </Form> */}
    </div>
  );
}