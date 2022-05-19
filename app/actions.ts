
import { ActionFunction, redirect } from "@remix-run/node";
import { EventFrom } from "xstate";
import { getSession, commitSession } from "~/sessions";
import { bookingMachine } from "./machines/booking.machine";
import { asyncInterpret } from "./machines/utils";


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

  const formData = await request.formData();
  let values = Object.fromEntries(formData);
  console.log("root action triggered");

  for (let key in values) {
    if (key.endsWith("[]")) {
      delete values[key];
      values[key.slice(0, -2)] = formData.getAll(key);
    }
  }

  const redirectTo = values.__redirectTo;
  delete values.__redirectTo;

  console.log("interpreting event", values);

  const result = await asyncInterpret(bookingMachine, 5000, machineState, values as EventFrom<typeof bookingMachine>);
  
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
