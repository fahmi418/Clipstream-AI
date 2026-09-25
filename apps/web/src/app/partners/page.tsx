import { COMPANY_PAGES } from "@/lib/footer-pages-data";
import { InfoPageTemplate } from "@/components/InfoPageTemplate";

export const metadata = {
  title: "Partner Program — ClipStream AI",
  description: "Program kemitraan untuk media, podcaster, agency, dan protokol Web3.",
};

export default function PartnersPage() {
  const page = COMPANY_PAGES["partners"];
  return <InfoPageTemplate page={page} />;
}
