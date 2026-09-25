import { COMPANY_PAGES } from "@/lib/footer-pages-data";
import { InfoPageTemplate } from "@/components/InfoPageTemplate";

export const metadata = {
  title: "Tentang ClipStream AI — Protokol Escrow Video BNB Chain",
  description: "Pelajari visi, misi, dan tim di balik platform ClipStream AI.",
};

export default function AboutPage() {
  const page = COMPANY_PAGES["about"];
  return <InfoPageTemplate page={page} />;
}
