import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "買い物リスト",
    short_name: "かいもの",
    description: "家族みんなで共有できる買い物リスト",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F6EE",
    theme_color: "#EEF0E8",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  };
}
