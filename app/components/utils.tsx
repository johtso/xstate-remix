import { useLocation } from "@remix-run/react";
import { useHydrated } from "remix-utils";

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
