import Link from "next/link";
import { getSiteContent } from "@/lib/settings";

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <p style={{ color: "var(--cyan)", fontWeight: 600, marginBottom: "0.5rem" }}>
            {content.tagline}
          </p>
          <h1>{content.heroTitle}</h1>
          <p>{content.heroSubtitle}</p>
          <div className="hero-actions">
            <Link href="/book" className="btn btn-primary">
              Book Now
            </Link>
            <Link href="/gallery" className="btn btn-secondary">
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">{content.aboutTitle}</h2>
          <p className="section-subtitle" style={{ maxWidth: "720px" }}>
            {content.aboutBody}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container">
          <h2 className="section-title">{content.servicesTitle}</h2>
          <p className="section-subtitle">
            Choose the wash that fits your vehicle and schedule.
          </p>
          <div className="card-grid">
            {content.services.map((service) => (
              <article key={service.title} className="card">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <p className="price">{service.price}</p>
              </article>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/book" className="btn btn-primary">
              Schedule Your Wash
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Visit Us</h2>
          <div className="card-grid">
            <div className="card">
              <h3>📍 Location</h3>
              <p>{content.contactAddress}</p>
            </div>
            <div className="card">
              <h3>📞 Contact</h3>
              <p>{content.contactPhone}</p>
              <p>{content.contactEmail}</p>
            </div>
            <div className="card">
              <h3>🕐 Hours</h3>
              {content.hours.map((h) => (
                <p key={h.days}>
                  <strong>{h.days}:</strong> {h.hours}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
