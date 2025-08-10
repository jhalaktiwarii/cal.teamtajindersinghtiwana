import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name:  "Appointment Schedule TST",
    short_name:"Appointment Schedule TST",
    description:  "Team Tajinder Singh Tiwana Calendar App",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    "icons": [
    {
      "src": "/icon512_maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon512_rounded.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
  }
}