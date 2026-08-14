// Canonical business/GST details for tax invoices — no other config in the
// repo stores GSTIN, so this is the single source of truth. Pulled from the
// studio's existing (external) invoicing so generated invoices match exactly.
export const BUSINESS_INFO = {
  name: "Little Pixel Studios",
  addressLines: [
    "A5, Casa Grand Vogue, Gandhi Nagar Society,",
    "Nookampalayam main road, Perumbakkam",
    "Chennai, Tamil Nadu 600126",
    "India",
  ],
  gstin: "33AYUPM6758R1Z5",
  email: "magesh1987@gmail.com",
};
