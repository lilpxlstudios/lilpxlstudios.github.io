import { adminDb } from "@/lib/firebase/admin";
import type { Inquiry } from "@lps/shared";
import { InquiryStatusForm } from "./InquiryStatusForm";

async function getInquiries(): Promise<Inquiry[]> {
  const snap = await adminDb.collection("inquiries").orderBy("submittedAt", "desc").get();
  return snap.docs.map((doc) => ({ ...(doc.data() as Omit<Inquiry, "id">), id: doc.id }));
}

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl">Inquiries</h1>
      {inquiries.length === 0 ? (
        <p className="text-ink-500 text-sm">No inquiries yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-100 border border-ink-100 rounded-md">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id} className="px-4 py-3 flex flex-col gap-2">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-medium">
                    {inquiry.name} <span className="text-ink-500 font-normal">— {inquiry.email}</span>
                  </p>
                  {inquiry.phone && <p className="text-sm text-ink-500">{inquiry.phone}</p>}
                  {inquiry.shootTypeInterest && (
                    <p className="text-sm text-ink-500">Interested in: {inquiry.shootTypeInterest}</p>
                  )}
                </div>
                <p className="text-sm text-ink-500 shrink-0">
                  {new Date(inquiry.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm text-ink-700">{inquiry.message}</p>
              <InquiryStatusForm inquiryId={inquiry.id} status={inquiry.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
