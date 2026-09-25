import { notFound } from "next/navigation";
import { SOLUTIONS_PAGES } from "@/lib/footer-pages-data";
import { InfoPageTemplate } from "@/components/InfoPageTemplate";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(SOLUTIONS_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = SOLUTIONS_PAGES[slug];
  if (!page) return { title: "Solusi Tidak Ditemukan" };
  return {
    title: `${page.title} — ClipStream AI`,
    description: page.subtitle,
  };
}

export default async function SolutionsDetailPage({ params }: Props) {
  const { slug } = await params;
  const page = SOLUTIONS_PAGES[slug];
  if (!page) return notFound();

  return <InfoPageTemplate page={page} />;
}
