import type { SiteContent } from "@/lib/settings";

type FooterProps = Pick<
  SiteContent,
  "businessName" | "contactPhone" | "contactEmail" | "contactAddress" | "hours"
>;

export function Footer({
  businessName,
  contactPhone,
  contactEmail,
  contactAddress,
  hours,
}: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>{businessName}</h4>
            <p>Professional car care you can trust.</p>
          </div>
          <div>
            <h4>Contact</h4>
            <p>{contactPhone}</p>
            <p>{contactEmail}</p>
            <p>{contactAddress}</p>
          </div>
          <div>
            <h4>Hours</h4>
            {hours.map((h) => (
              <p key={h.days}>
                <strong>{h.days}:</strong> {h.hours}
              </p>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} {businessName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
