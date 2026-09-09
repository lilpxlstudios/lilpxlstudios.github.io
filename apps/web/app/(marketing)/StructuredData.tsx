import { SITE_URL } from "@/lib/siteUrl";
import { studioContact } from "./siteConfig";

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Little Pixel Studios",
    image: `${SITE_URL}/images/hero/hero-western.jpg`,
    url: SITE_URL,
    telephone: studioContact.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      streetAddress: studioContact.address,
      addressLocality: "Chennai",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
    sameAs: [studioContact.instagramUrl],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
