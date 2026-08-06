import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionCookie } from "@/lib/session";
import { adminAuth } from "@/lib/firebase/admin";

const bodySchema = z.object({ idToken: z.string().min(1) });

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(parsed.data.idToken);
    await createSessionCookie(parsed.data.idToken);
    return NextResponse.json({ ok: true, admin: decoded.admin === true });
  } catch {
    return NextResponse.json({ error: "Could not create session" }, { status: 401 });
  }
}
