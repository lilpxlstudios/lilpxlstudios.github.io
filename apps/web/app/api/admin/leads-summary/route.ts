import { timingSafeEqual, createHash } from "crypto";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import type { Inquiry, InquiryStatus } from "@lps/shared";

// Machine-to-machine credential for the leads dashboard Artifact, which can't
// hold the app's Firebase session cookie the way a logged-in browser can —
// this is deliberately separate from requireAdmin()'s cookie-session check.
const API_KEY = process.env.LEADS_SUMMARY_API_KEY;

// Hashing to a fixed-length digest before comparing means timingSafeEqual never
// sees mismatched buffer lengths (it throws on those) and the response time
// can't leak how many leading characters of a guessed token were correct.
function safeTokenEquals(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

const STAGES: { value: InquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "booked", label: "Booked" },
  { value: "lost", label: "Lost" },
];

export async function GET(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const auth = request.headers.get("authorization") ?? "";
  if (!safeTokenEquals(auth, `Bearer ${API_KEY}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snap = await adminDb.collection("inquiries").orderBy("submittedAt", "desc").get();
  const inquiries = snap.docs.map((doc) => ({ ...(doc.data() as Omit<Inquiry, "id">), id: doc.id }));

  const stages = STAGES.map((stage) => ({
    status: stage.value,
    label: stage.label,
    count: inquiries.filter((i) => i.status === stage.value).length,
  }));

  const recent = inquiries.slice(0, 20).map((i) => ({
    id: i.id,
    name: i.name,
    shootTypeInterest: i.shootTypeInterest,
    status: i.status,
    submittedAt: i.submittedAt,
  }));

  return NextResponse.json({ total: inquiries.length, stages, recent });
}
