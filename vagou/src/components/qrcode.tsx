"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export function QrCode({ text, size = 200, className }: { text: string; size?: number; className?: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let vivo = true;
    QRCode.toString(text, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#161616", light: "#ffffff" } })
      .then((s) => vivo && setSvg(s))
      .catch(() => vivo && setSvg(""));
    return () => {
      vivo = false;
    };
  }, [text]);
  return <div className={className} style={{ width: size, height: size }} role="img" aria-label="QR code" dangerouslySetInnerHTML={{ __html: svg }} />;
}
