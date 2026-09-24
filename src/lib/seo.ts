import type { Metadata } from "next";

const fallbackSiteUrl = "https://sunulogis.sn";

function normalizeSiteUrl(value?: string) {
  if (!value) return fallbackSiteUrl;

  const withProtocol = value.startsWith("http") ? value : `https://${value}`;

  try {
    const url = new URL(withProtocol);
    return url.origin;
  } catch {
    return fallbackSiteUrl;
  }
}

export const siteConfig = {
  name: "SunuLogis",
  url: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL
  ),
  title:
    "SunuLogis | Biens immobiliers à vendre et à louer au Sénégal",
  description:
    "Découvrez une sélection exclusive de biens immobiliers à vendre et à louer au Sénégal. SunuLogis aide à préciser la recherche, demander un dossier et organiser les visites.",
  ogDescription:
    "Catalogue immobilier SunuLogis : biens à vendre ou à louer, demande de visite et contact WhatsApp direct.",
  locale: "fr_SN",
  email: "contact@sunulogis.sn",
  phone: "+221778057536",
  ogImage: "/opengraph-image",
  sameAs: [
    "https://www.facebook.com/SunuLogis",
    "https://www.instagram.com/sunulogis/",
    "https://tiktok.com/@sunulogis8",
  ],
};

export function getAbsoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export const seoKeywords = [
  "SunuLogis",
  "achat immobilier Sénégal",
  "maison à vendre Sénégal",
  "villa à vendre Dakar",
  "appartement à louer Dakar",
  "location appartement Sénégal",
  "terrain à vendre Sénégal",
  "apporteur affaires immobilier Sénégal",
  "visite immobilière Dakar",
  "SunuLogis immobilier",
];

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: seoKeywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "real estate",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/sunulogis-logo.jpeg",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.ogDescription,
    url: "/",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "SunuLogis - biens immobiliers au Sénégal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.ogDescription,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export function getStructuredData() {
  const organizationId = `${siteConfig.url}/#real-estate-agent`;
  const websiteId = `${siteConfig.url}/#website`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "@id": organizationId,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: getAbsoluteUrl("/logo.svg"),
      image: getAbsoluteUrl("/sunulogis-logo.jpeg"),
      description: siteConfig.description,
      email: siteConfig.email,
      telephone: siteConfig.phone,
      priceRange: "FCFA",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dakar",
        addressRegion: "Dakar",
        addressCountry: "SN",
      },
      areaServed: [
        {
          "@type": "Country",
          name: "S\u00e9n\u00e9gal",
        },
        {
          "@type": "City",
          name: "Dakar",
          addressCountry: "SN",
        },
      ],
      sameAs: siteConfig.sameAs,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Biens immobiliers SunuLogis",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "House",
              name: "Biens à vendre au Sénégal",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Apartment",
              name: "Appartements à louer au Sénégal",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Residence",
              name: "Villas et maisons au Sénégal",
            },
          },
        ],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: siteConfig.name,
      url: siteConfig.url,
      inLanguage: "fr-SN",
      description: siteConfig.description,
      publisher: {
        "@id": organizationId,
      },
    },
  ];
}
