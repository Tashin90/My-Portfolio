import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Md. Naimul Haque Tashin Portfolio",
    short_name: "Tashin Portfolio",
    description: "Md. Naimul Haque Tashin — CSE Student, Web Developer, and Aspiring Researcher.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#a78bfa",
    background_color: "#060816",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" }
    ]
  };
}
