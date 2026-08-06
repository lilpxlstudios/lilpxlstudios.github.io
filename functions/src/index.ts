import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import "./admin";

setGlobalOptions({ region: "asia-south1", maxInstances: 10 });

// Confirms the Functions deploy pipeline (build, region, emulator wiring) works
// before order/payment/invoice functions land in later milestones.
export const healthCheck = onRequest((_req, res) => {
  res.status(200).json({ ok: true, service: "littlepixelstudios-functions" });
});
