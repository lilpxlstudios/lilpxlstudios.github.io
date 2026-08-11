export const WHATSAPP_NUMBER = "919791143983";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const studioContact = {
  phoneDisplay: "+91 97911 43983",
  phoneHref: "tel:+919791143983",
  address: "VGP Layout Part 1, Palavakkam, ECR Road, Chennai - 600041",
  instagramHandle: "@little_pixel_photography",
  instagramUrl: "https://instagram.com/little_pixel_photography",
  mapsUrl: "https://maps.google.com/?q=Little+Pixel+Photography+Palavakkam+Chennai",
};
