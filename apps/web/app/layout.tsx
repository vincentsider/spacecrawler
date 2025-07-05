import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { Toaster } from "react-hot-toast";

// Font configurations
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-sans',
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '700', '900'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://voiceaispace.com'),
  title: {
    default: "Voice AI Space - Premier Voice AI Jobs, Events & Products",
    template: "%s | Voice AI Space"
  },
  description: "The leading platform for voice AI professionals. Discover high-paying jobs, exclusive events, and cutting-edge products in speech technology, conversational AI, and voice synthesis.",
  keywords: [
    "voice AI jobs",
    "speech technology careers",
    "conversational AI",
    "voice synthesis",
    "speech recognition",
    "voice AI events",
    "voice AI products",
    "natural language processing",
    "voice assistants",
    "AI voice technology",
    "voice AI companies",
    "voice AI startups"
  ],
  authors: [{ name: "Voice AI Space Team" }],
  creator: "Voice AI Space",
  publisher: "Voice AI Space",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Voice AI Space - Premier Voice AI Jobs, Events & Products",
    description: "The leading platform for voice AI professionals. Find your next opportunity in voice technology.",
    url: "https://voiceaispace.com",
    siteName: "Voice AI Space",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Voice AI Space - Your Gateway to Voice AI Opportunities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice AI Space - Premier Voice AI Platform",
    description: "Discover voice AI jobs, events, and products. Join the voice AI revolution.",
    site: "@voiceaispace",
    creator: "@voiceaispace",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://voiceaispace.com",
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  category: 'technology',
};

// Structured Data for Organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Voice AI Space",
  "url": "https://voiceaispace.com",
  "logo": "https://voiceaispace.com/logo.png",
  "sameAs": [
    "https://twitter.com/voiceaispace",
    "https://linkedin.com/company/voiceaispace",
    "https://github.com/voiceaispace"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hello@voiceaispace.com",
    "contactType": "customer support",
    "availableLanguage": "English"
  }
};

// Structured Data for WebSite
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Voice AI Space",
  "url": "https://voiceaispace.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://voiceaispace.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased" style={{ margin: 0, padding: 0, background: '#000' }}>
        {/* <Header /> */}
        <main className="flex-1">{children}</main>
        {/* <Footer /> */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: 'font-sans',
            duration: 4000,
            style: {
              background: 'rgb(var(--card))',
              color: 'rgb(var(--card-foreground))',
              border: '1px solid rgb(var(--border))',
            },
          }}
        />
      </body>
    </html>
  );
}
