import { COMPANY_PAGES } from "@/lib/footer-pages-data";
import { InfoPageTemplate } from "@/components/InfoPageTemplate";

export const metadata = {
  title: "Manifesto Protokol — ClipStream AI",
  description: "Filosofi, komitmen, dan prinsip dasar protokol ClipStream AI.",
};

export default function ManifestoPage() {
  const page = COMPANY_PAGES["manifesto"];
  return <InfoPageTemplate page={page} />;
}
