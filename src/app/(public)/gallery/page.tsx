import Link from "next/link";
import Image from "next/image";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export default async function GalleryPage() {
  noStore();
  const images = await prisma.galleryImage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Our Work</h1>
        <p className="section-subtitle">
          See the shine we deliver — from express washes to full detailing.
        </p>

        <div className="gallery-grid">
          {images.map((img) => (
            <figure key={img.id} className="gallery-item">
              <Image
                src={img.url}
                alt={img.caption || "Car wash gallery"}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ objectFit: "cover" }}
              />
              {img.caption && (
                <figcaption className="gallery-caption">{img.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>

        {images.length === 0 && (
          <p style={{ color: "var(--gray)" }}>Gallery coming soon.</p>
        )}

        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link href="/book" className="btn btn-primary">
            Book Now
          </Link>
        </div>
      </div>
    </section>
  );
}
