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
    "SunuLogis | Location appartement Dakar et logements au S\u00e9n\u00e9gal",
  description:
    "Trouvez rapidement un appartement meuble, une chambre, une villa, un hotel ou une auberge a Dakar et partout au Senegal. SunuLogis facilite la recherche de logements fiables avec contact direct WhatsApp.",
  ogDescription:
    "Appartements, chambres, villas, hotels et auberges au Senegal avec recherche simple, filtres utiles et contact direct WhatsApp.",
  locale: "fr_SN",
  email: "contact@sunulogis.sn",
  phone: "+221773615944",
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
  "location appartement Dakar",
  "appartement meuble Dakar",
  "logement Senegal",
  "hebergement Dakar",
  "reservation logement Senegal",
  "auberge Senegal",
  "hotel Dakar",
  "villa a louer Senegal",
  "chambre a louer Dakar",
  "logement etudiant Dakar",
  "location vacances Senegal",
  "maison a vendre Senegal",
  "WhatsApp reservation logement",
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
        alt: "SunuLogis - logements fiables au Senegal",
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
        name: "Locations et logements SunuLogis",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Accommodation",
              name: "Appartements meubles a Dakar",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Accommodation",
              name: "Chambres et auberges au Senegal",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Accommodation",
              name: "Villas, hotels et lodges au Senegal",
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
