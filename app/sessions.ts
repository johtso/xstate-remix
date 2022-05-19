import { createCookieSessionStorage } from "@remix-run/node"; // or "@remix-run/cloudflare"
import { machineStateCookie } from "./cookies";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: machineStateCookie,
  });

export { getSession, commitSession, destroySession };