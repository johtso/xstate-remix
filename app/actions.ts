
import { ActionFunction, redirect } from "@remix-run/node";
import { useLocation } from "@remix-run/react";
import QueryString from "qs";
import { getFormData, getFormDataOrFail } from "remix-params-helper";
import { EventFrom } from "xstate";
import { z } from "zod";
import { getSession, commitSession } from "~/sessions";
import { bookingMachine, zBookingMachineEvent } from "./machines/booking.machine";
import { asyncInterpret } from "./machines/utils";
import qs from "qs";

const zAction = z.object({
  __redirectTo: z.string().optional(),
  event: zBookingMachineEvent,
});

export const machineEventAction: ActionFunction = async ({ request }) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const machineState = session.get("machineState");

  // const machineState = await getMachineStateFromRequest(request);
  console.log("machine state before action", machineState?.context);
  if (machineState === null) {
    throw new Response("No Machine State", {
      status: 500,
    });
  }

  // const formData = await request.formData();
  // const parseResult = await getFormData(request, zAction);
  const parsedQS = qs.parse(await request.text(), { allowDots: true });
  console.log({ parsedQS })

  const parsedAction = zAction.parse(parsedQS);

  // if (!parseResult.success) {
  //   console.log("couldn't parse action", parseResult.errors);
  //   throw new Response("Could not parse action", {
  //     status: 500,
  //   });
  // }

  // const parsedAction = parseResult.data;

  // let values = Object.fromEntries(formData);
  console.log("root action triggered");

  // for (let key in values) {
  //   if (key.endsWith("[]")) {
  //     delete values[key];
  //     values[key.slice(0, -2)] = formData.getAll(key);
  //   }
  // }

  const redirectTo = parsedAction.__redirectTo;
  // delete values.__redirectTo;

  console.log("interpreting event", parsedAction.event);

  const result = await asyncInterpret(bookingMachine, 5000, machineState, parsedAction.event);//values as EventFrom<typeof bookingMachine>);
  
  session.set("machineState", result);

  const options = {
    headers: {"Set-Cookie": await commitSession(session)},
  }

  if (redirectTo) {
    return redirect(redirectTo, options);
  } else {
    return new Response("success", options);
  }
}
