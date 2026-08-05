import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sarath Search Engine',
    short_name: 'Sarath Search',
    description: 'Private, Fast, and Intelligent Web AI Search Engine',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#9333ea',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
