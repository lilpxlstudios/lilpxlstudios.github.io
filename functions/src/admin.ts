import { initializeApp, getApps } from "firebase-admin/app";

export const app = getApps().length ? getApps()[0]! : initializeApp();
