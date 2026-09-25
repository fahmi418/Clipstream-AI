import { notFound } from "next/navigation";
import { PRODUCT_PAGES } from "@/lib/footer-pages-data";
import { InfoPageTemplate } from "@/components/InfoPageTemplate";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(PRODUCT_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = PRODUCT_PAGES[slug];
  if (!page) return { title: "Fitur Tidak Ditemukan" };
  return {
    title: `${page.title} — ClipStream AI`,
    description: page.subtitle,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const page = PRODUCT_PAGES[slug];
  if (!page) return notFound();

  return <InfoPageTemplate page={page} />;
}
