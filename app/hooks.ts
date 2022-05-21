import { useLoaderData, useSubmit } from "@remix-run/react";
import { interpret } from "xstate";
import { LoaderData } from "./loaders";
import { bookingMachine } from "./machines/booking.machine";

export function useMachineState() {
  const { machineState } = useLoaderData<LoaderData>();
  return machineState
}

export function useInterpretedMachine() {
  const machineState = useMachineState();
  return interpret(bookingMachine).start(machineState);
}

export function useSubmitCurrentForm() {
  const submit = useSubmit();

  function submitForm(event: React.FormEvent<HTMLInputElement>) {
    submit(event.currentTarget.form, { replace: true });
  }

  return submitForm;
}