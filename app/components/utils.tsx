import { Link, useLocation } from "@remix-run/react";
import clsx from "clsx";
import { useHydrated } from "remix-utils";
import { InterpreterFrom } from "xstate";
import { bookingMachine, eventFromPath, NavigablePathType } from "~/machines/booking.machine";

export function HiddenRedirectField({ route }: { route?: string }) {
  const { pathname } = useLocation();
  const isHydrated = useHydrated();
  if (!isHydrated || route) {
    const redirectTo = route ? route : pathname;
    return <input type="hidden" name="__redirectTo" value={redirectTo} />;
  } else {
    return null;
  }
}

interface MachineLinkProps {
  machine: InterpreterFrom<typeof bookingMachine>;
  to: NavigablePathType;
  isSibling?: boolean;
}

export function MachineLink(
    { machine, to, isSibling, className, ...props}:
    MachineLinkProps &
    Omit<React.ComponentProps<typeof Link>, "to" | "prefetch">
  ) {
  const event = eventFromPath(to);
  const isPossible = machine.state.can(event);
  // const path = event.split(".").pop()!.toLowerCase();

  return (
    <Link
      to={`${isSibling ? "../" : ""}${to}`}
      className={clsx(
        className,
        "machine-link",
        "btn",
        { "btn-accent": isPossible }
      )}
      prefetch="intent"
      {...props}
    />
  )
};
