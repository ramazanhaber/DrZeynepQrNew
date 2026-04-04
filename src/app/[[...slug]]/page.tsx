import { QrApp } from "@/components/qr-app";
import { resolveAppRoute } from "@/lib/qr";

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const route = resolveAppRoute(slug);

  return <QrApp route={route} />;
}
