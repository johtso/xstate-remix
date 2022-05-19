import { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  console.log("root action triggered");
  console.log({body});
  return new Response("success", {status: 200})
}
