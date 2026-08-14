import { z } from "zod";

export const newsletterSubscriberSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable().default(null),
  optInAt: z.number(),
  optInSource: z.string(),
  doubleOptInConfirmed: z.boolean().default(false),
  confirmationToken: z.string().nullable().default(null),
  status: z.enum(["pending", "subscribed", "unsubscribed"]),
  unsubscribedAt: z.number().nullable().default(null),
});
export type NewsletterSubscriber = z.infer<typeof newsletterSubscriberSchema>;

export const marketingContentSchema = z.object({
  id: z.string(),
  type: z.enum(["social_caption", "newsletter_draft", "ad_copy"]),
  prompt: z.string(),
  generatedText: z.string(),
  platform: z.string().nullable().default(null),
  status: z.enum(["draft", "approved", "sent"]),
  createdAt: z.number(),
  createdBy: z.string(),
});
export type MarketingContent = z.infer<typeof marketingContentSchema>;

export const inquiryStatusSchema = z.enum(["new", "contacted", "quoted", "booked", "lost"]);
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;

export const inquirySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable().default(null),
  message: z.string(),
  shootTypeInterest: z.string().nullable().default(null),
  submittedAt: z.number(),
  status: inquiryStatusSchema,
  notes: z.string().nullable().default(null),
  followUpAt: z.number().nullable().default(null),
});
export type Inquiry = z.infer<typeof inquirySchema>;
