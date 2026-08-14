import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import type { Inquiry, InquiryStatus } from "@lps/shared";
import { InquiryPipelineCard } from "./InquiryPipelineCard";

const STAGES: { value: InquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "booked", label: "Booked" },
  { value: "lost", label: "Lost" },
];

async function getInquiries(): Promise<Inquiry[]> {
  const snap = await adminDb.collection("inquiries").orderBy("submittedAt", "desc").get();
  return snap.docs.map((doc) => ({ ...(doc.data() as Omit<Inquiry, "id">), id: doc.id }));
}

export default async function CrmPage() {
  const inquiries = await getInquiries();

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">CRM — Lead Pipeline</h1>
        <Link href="/admin/clients" className="text-sm text-accent-600">
          Manage clients →
        </Link>
      </div>

      {STAGES.map((stage) => {
        const stageInquiries = inquiries.filter((i) => i.status === stage.value);
        if (stageInquiries.length === 0) return null;
        return (
          <div key={stage.value}>
            <h2 className="text-lg mb-3">
              {stage.label} <span className="text-ink-500 text-sm">({stageInquiries.length})</span>
            </h2>
            <ul className="flex flex-col divide-y divide-ink-100 border border-ink-100 rounded-md">
              {stageInquiries.map((inquiry) => (
                <InquiryPipelineCard key={inquiry.id} inquiry={inquiry} />
              ))}
            </ul>
          </div>
        );
      })}

      {inquiries.length === 0 && <p className="text-ink-500 text-sm">No inquiries yet.</p>}
    </div>
  );
}
