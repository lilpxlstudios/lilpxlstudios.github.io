import { initBotId } from "botid/client/core";

initBotId({
  protect: [{ path: "/api/inquiries", method: "POST" }],
});
