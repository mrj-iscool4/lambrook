import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appeals",
  description: "Submit an appeal for an active UKRP moderation action.",
};

export default function AppealsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
