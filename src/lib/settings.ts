import { prisma } from "./prisma";
import { parseAcceptedZipcodes } from "./zipcodes";

export type ServiceItem = {
  title: string;
  description: string;
  price: string;
};

export type HoursItem = {
  days: string;
  hours: string;
};

export type SiteContent = {
  businessName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutBody: string;
  servicesTitle: string;
  services: ServiceItem[];
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  hours: HoursItem[];
};

function parseJson<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    await prisma.siteSettings.create({ data: {} });
    return getSiteContent();
  }

  return {
    businessName: settings.businessName,
    tagline: settings.tagline,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    aboutTitle: settings.aboutTitle,
    aboutBody: settings.aboutBody,
    servicesTitle: settings.servicesTitle,
    services: parseJson<ServiceItem[]>(settings.servicesJson, []),
    contactPhone: settings.contactPhone,
    contactEmail: settings.contactEmail,
    contactAddress: settings.contactAddress,
    hours: parseJson<HoursItem[]>(settings.hoursJson, []),
  };
}

export async function getNotificationSettings() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  return settings;
}

export type BookingSettings = {
  mobileCarwashEnabled: boolean;
  acceptedZipcodes: string[];
};

export async function getBookingSettings(): Promise<BookingSettings> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    await prisma.siteSettings.create({ data: {} });
    return getBookingSettings();
  }

  return {
    mobileCarwashEnabled: settings.mobileCarwashEnabled,
    acceptedZipcodes: parseAcceptedZipcodes(settings.acceptedZipcodesJson),
  };
}
