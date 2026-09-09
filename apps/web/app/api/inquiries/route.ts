import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";
import { inquirySchema } from "@lps/shared";
import { adminDb } from "@/lib/firebase/admin";

const publicInquirySchema = inquirySchema.pick({
  name: true,
  email: true,
  phone: true,
  message: true,
  shootTypeInterest: true,
});

export async function POST(request: Request) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: "Request blocked" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = publicInquirySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const ref = adminDb.collection("inquiries").doc();
  await ref.set({
    ...parsed.data,
    submittedAt: Date.now(),
    status: "new",
    notes: null,
    followUpAt: null,
  });

  return NextResponse.json({ ok: true });
}
