import type { DeliveryPhoto } from "@lps/shared";

export function GalleryGrid({ orderId, photos }: { orderId: string; photos: DeliveryPhoto[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {photos.map((photo) => (
        <a
          key={photo.id}
          href={`/api/gallery/${orderId}/${photo.id}`}
          className="group relative aspect-square rounded-md overflow-hidden border border-ink-100"
        >
          {photo.thumbUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.thumbUrl}
              alt={photo.fileName}
              className="w-full h-full object-cover transition group-hover:opacity-80"
            />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition group-hover:bg-black/30 group-hover:text-white text-xs font-medium">
            Download
          </span>
        </a>
      ))}
    </div>
  );
}
