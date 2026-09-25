import { notFound } from "next/navigation";
import { WHY_US_PAGES } from "@/lib/footer-pages-data";
import { InfoPageTemplate } from "@/components/InfoPageTemplate";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(WHY_US_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = WHY_US_PAGES[slug];
  if (!page) return { title: "Halaman Tidak Ditemukan" };
  return {
    title: `${page.title} — ClipStream AI`,
    description: page.subtitle,
  };
}

export default async function WhyUsDetailPage({ params }: Props) {
  const { slug } = await params;
  const page = WHY_US_PAGES[slug];
  if (!page) return notFound();

  return <InfoPageTemplate page={page} />;
}
