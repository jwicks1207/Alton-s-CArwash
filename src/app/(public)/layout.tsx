import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteContent } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header businessName={content.businessName} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer
        businessName={content.businessName}
        contactPhone={content.contactPhone}
        contactEmail={content.contactEmail}
        contactAddress={content.contactAddress}
        hours={content.hours}
      />
    </div>
  );
}
