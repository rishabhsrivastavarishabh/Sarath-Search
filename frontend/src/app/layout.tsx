import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarath-search.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'Sarath Search Engine v4.1 — Private • Fast • Intelligent',
    template: '%s | Sarath Search Engine',
  },
  description: 'Sarath Search Engine v4.1 — Modern Web AI search engine powered by real-time indexing, Web AI summaries, and zero tracking privacy.',
  keywords: ['Sarath Search', 'Search Engine', 'AI Search', 'Web AI', 'Private Search', 'Fast Search', 'OpenRouter AI'],
  authors: [{ name: 'Sarath Team' }],
  creator: 'Sarath',
  publisher: 'Sarath Search Engine',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'Sarath Search Engine v4.1 — Private • Fast • Intelligent',
    description: 'Next-generation Web AI search engine delivering instant results, Perplexity-style summaries, and zero privacy tracking.',
    siteName: 'Sarath Search Engine',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Sarath Search Engine Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sarath Search Engine v4.1',
    description: 'Private, Fast, and Intelligent Web AI Search Engine',
    images: ['/logo.png'],
    creator: '@SarathSearch',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.webmanifest',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sarath Search Engine',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
