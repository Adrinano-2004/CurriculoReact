import type { Metadata } from "next";
import { Shell } from "@/components/shell";

export const metadata: Metadata = { title: "Sistema" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
