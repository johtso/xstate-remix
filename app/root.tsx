import { Links, LiveReload, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import styles from "~/styles/app.css";

export function links() {
  return [
    // {
    //   rel: "stylesheet",
    //   href: "https://unpkg.com/modern-css-reset@1.4.0/dist/reset.min.css",
    // },
    // {
    //   rel: "stylesheet",
    //   href: "https://unpkg.com/purecss@2.1.0/build/pure-min.css",
    // },
    {
      rel: "stylesheet",
      href: styles,
    }
  ];
}

export default function App() {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Remix: So great, it's funny!</title>
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
