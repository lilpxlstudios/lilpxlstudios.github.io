export type InquirySubmission = {
  name: string;
  email: string;
  phone: string | null;
  message: string;
  shootTypeInterest: string | null;
};

export async function submitInquiry(payload: InquirySubmission): Promise<void> {
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Request failed");
}
