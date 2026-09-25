import { COMPANY_PAGES } from "@/lib/footer-pages-data";
import { InfoPageTemplate } from "@/components/InfoPageTemplate";

export const metadata = {
  title: "Karier & Lowongan Kerja — ClipStream AI",
  description: "Bergabunglah dengan tim ClipStream AI untuk membangun masa depan Creator Economy Web3.",
};

export default function CareersPage() {
  const page = COMPANY_PAGES["careers"];
  return <InfoPageTemplate page={page} />;
}
