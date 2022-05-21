import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { machineEventAction } from "~/actions";
import { loadMachineStateAndEnsureCorrectRoute } from "~/loaders";
import * as numberInput from "@zag-js/number-input"
import { useMachine, useSetup } from "@zag-js/react"
import { useSubmitCurrentForm } from "~/hooks";
import { FormEvent } from "react";
import React from "react";
import { HiddenRedirectField } from "~/components/utils";
import { json, LoaderFunction } from "@remix-run/node";
import { Context as BookingMachineContext } from "~/machines/booking.machine";

function NumberInput(
    { name, count, label, onChange }:
    { name: string, count: number, label: string, onChange: (details: { value: string; valueAsNumber: number; }) => void }
  ) {
  const [state, send] = useMachine(
    numberInput.machine({
      onChange,
      name: name,
      value: count.toString(),
      min: 0,
      clampValueOnBlur: true,
    })
  )
  const wrappedSend = (evt) => {
    console.log("current state", state);
    console.log("sending", evt);
    send(evt);
  }
  const ref = useSetup({ send, id: "1" })
  const api = numberInput.connect(state, wrappedSend)

  return (
    <div className="custom-number-input">
      <div ref={ref} {...api.rootProps}>
        <label {...api.labelProps}>{label}</label>
        <div className="input-container">
          <button {...api.decrementButtonProps}><span>-</span></button>
          <input {...api.inputProps} />
          <button {...api.incrementButtonProps}><span>+</span></button>
        </div>
      </div>
    </div>
  )
}


export type LoaderData = {
  ticketSelection: BookingMachineContext["tickets"];
}

export const loader: LoaderFunction = async (loaderArgs) => {
  const machineState = await loadMachineStateAndEnsureCorrectRoute(loaderArgs);
  return json<LoaderData>({ ticketSelection: machineState.context.tickets });
}

export const action = machineEventAction;

export default function TicketsRoute() {
  const { ticketSelection } = useLoaderData<LoaderData>();
  // const ticketSelection = machineState.context.tickets;
  const formRef = React.useRef<HTMLFormElement>(null);

  const submit = useSubmit();
  const onFormChange = ({ value, valueAsNumber }: {
    value: string;
    valueAsNumber: number;
  }) => {
    console.log({value, valueAsNumber })
    if (value !== "") {
      submit(formRef.current);
    }
  }
  console.log("rerendering with selection:", ticketSelection);
  return (
    <div>
      <Form method="post" ref={formRef}>
        {Object.entries(ticketSelection).map(([ticketType, selected]) => (
          <NumberInput
            key={ticketType}
            name={`event.tickets.${ticketType}`}
            label={ticketType}
            count={selected}
            onChange={onFormChange}
          />
        ))}
        <input type="hidden" name="event.type" value="UPDATE_TICKET_SELECTION"/>
        <HiddenRedirectField />
      </Form>
    </div>
  );
}
