import type { Metadata, Viewport } from "next";
import "@fontsource/hanken-grotesk/300.css";
import "@fontsource/hanken-grotesk/400.css";
import "@fontsource/hanken-grotesk/500.css";
import "@fontsource/hanken-grotesk/600.css";
import "@fontsource/newsreader/300.css";
import "@fontsource/newsreader/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Vagou — gestão de estacionamentos", template: "%s · Vagou" },
  description: "Entrada e saída em segundos, caixa sem susto e o seu estacionamento na palma da mão.",
  applicationName: "Vagou",
};

export const viewport: Viewport = {
  themeColor: "#F2F2F1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
