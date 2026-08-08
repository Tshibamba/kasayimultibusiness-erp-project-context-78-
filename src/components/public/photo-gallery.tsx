"use client";

export function PhotoGallery({
  photos,
}: {
  photos: { url: string; legende: string }[];
}) {
  return (
    <div className="scrollbar-none scroll-snap-x -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:px-0">
      {photos.map((p, idx) => (
        <figure
          key={idx}
          className="snap-item group relative h-64 w-72 shrink-0 overflow-hidden rounded-2xl shadow-md sm:h-72 sm:w-80"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.url}
            alt={p.legende}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-marine/95 via-marine/40 to-transparent p-4 pt-10 text-sm font-semibold text-white">
            {p.legende}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
