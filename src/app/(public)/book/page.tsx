import { BookingForm } from "@/components/BookingForm";
import { getBookingSettings, getSiteContent } from "@/lib/settings";

export default async function BookPage() {
  const [content, booking] = await Promise.all([
    getSiteContent(),
    getBookingSettings(),
  ]);

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title" style={{ textAlign: "center" }}>
          Book Your Appointment
        </h1>
        <p
          className="section-subtitle"
          style={{ textAlign: "center", margin: "0 auto 2rem" }}
        >
          Pick a date and time at {content.businessName}. We&apos;ll confirm your
          booking and have your ride shining in no time.
        </p>
        <BookingForm
          mobileCarwashEnabled={booking.mobileCarwashEnabled}
          acceptedZipcodes={booking.acceptedZipcodes}
        />
      </div>
    </section>
  );
}
