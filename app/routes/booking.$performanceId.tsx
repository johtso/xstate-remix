import { LoaderFunction, json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { StateFrom } from "xstate";
import { stateValueToPath } from "~/machines/utils";
import { bookingMachine, NavigablePaths, totalSeats, validSelections } from "~/machines/booking.machine";
import { LoaderData, PerformanceType } from "~/types";

import { getSession, commitSession } from "~/sessions";
import { useInterpretedMachine } from "~/hooks";
import { MachineLink } from "~/components/utils";
import { objTotal } from "~/utils";
import clsx from "clsx";

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
  if (!Object.keys(performances).includes(performanceId)) {
    throw new Response("No Performance With That ID", {
      status: 404,
    });
  }
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
  const machine = useInterpretedMachine();
  machine
  const ctx = machine.state.context;
  const totalTickets = objTotal(ctx.tickets);
  const displayTicketCount = (totalTickets || machine.state.value === "tickets");

  const steps = ["seats", "tickets", "perks"] as const;
  const futureStep = (step: typeof steps[number]) => {
    const currentStep = steps.indexOf(machine.state.value as typeof steps[number]);
    return steps.indexOf(step) > currentStep;
  }

  const selectionsAreValid = validSelections(ctx);

  return (
    <div>
      <h1>Booking Page</h1>
      <nav>
        <ol className="steps">
          <li className={clsx("step", { "step-primary": !futureStep("seats")})}>
            <MachineLink machine={machine} to="seats">
              SEATS <span className={clsx("selection-count seats badge", selectionsAreValid ? "btn-accent" : "btn-secondary")}>{totalSeats(ctx)}</span>
            </MachineLink>
          </li>
          <li className={clsx("step", { "step-primary": !futureStep("tickets")})}>
            <MachineLink machine={machine} to="tickets">
              TICKETS {displayTicketCount ? (
                <span className={clsx("selection-count seats badge", selectionsAreValid ? "btn-accent" : "btn-secondary")}>
                  {objTotal(ctx.tickets)}
                </span>
              ) : null}
            </MachineLink>
          </li>
          <li className={clsx("step", { "step-primary": !futureStep("perks")})}>
            <MachineLink machine={machine} to="perks">
              PERKS
            </MachineLink>
          </li>
        </ol>
      </nav>
      <h2>Seats</h2>
      <pre>
        {ctx.seats.map((selected, i) => (
          selected ? <span key={i} className="badge">{`A${i}`}</span> : null
        ))}
      </pre>
      <h2>Tickets</h2>
      <div>
        {Object.entries(ctx.tickets).map(([id, count]) => (
          <span className="badge" key={id}>{`${id}: ${count}`}</span>
        ))}
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
