import type { SiteSettings } from "@prisma/client";
import {
  isZipAccepted,
  normalizeZipCode,
  parseAcceptedZipcodes,
  ZIP_NOT_IN_SERVICE,
} from "./zipcodes";

export { ZIP_NOT_IN_SERVICE };

export type MobileBookingFields = {
  isMobile: boolean;
  address: string;
  zipCode: string;
};

export function getAcceptedZipcodes(settings: SiteSettings): string[] {
  return parseAcceptedZipcodes(settings.acceptedZipcodesJson);
}

export function validateMobileBooking(
  settings: SiteSettings,
  data: MobileBookingFields
): { ok: true } | { ok: false; error: string } {
  if (!data.isMobile) {
    return { ok: true };
  }

  if (!settings.mobileCarwashEnabled) {
    return { ok: false, error: "Mobile car wash is not available." };
  }

  const address = data.address.trim();
  const zip = normalizeZipCode(data.zipCode);

  if (!address || address.length < 5) {
    return { ok: false, error: "Service address is required for mobile bookings." };
  }

  if (zip.length !== 5) {
    return { ok: false, error: "Please enter a valid 5-digit zip code." };
  }

  const accepted = getAcceptedZipcodes(settings);
  if (!isZipAccepted(zip, accepted)) {
    return { ok: false, error: ZIP_NOT_IN_SERVICE };
  }

  return { ok: true };
}
