import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { catalogToRows, totalProducts } from "@/lib/catalog";
import { buildMenuUrl } from "@/lib/qr";
import { uploadBinaryFile, uploadJsonFile } from "@/lib/server";
import type { AdminCatalog, AdminSession } from "@/lib/types";

function menuTag(session: AdminSession) {
  return `qr-menu:${session.sirketKod}_${session.subeKod}`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    session?: AdminSession;
    catalog?: AdminCatalog;
  };

  if (!body.session || !body.catalog) {
    return NextResponse.json({ error: "Eksik yayın verisi." }, { status: 400 });
  }

  if (totalProducts(body.catalog) === 0) {
    return NextResponse.json(
      { error: "Yayınlamak için en az bir ürün eklemelisiniz." },
      { status: 400 },
    );
  }

  try {
    const jsonContent = JSON.stringify(catalogToRows(body.catalog), null, 2);
    const jsonResult = await uploadJsonFile({
      sirketKod: body.session.sirketKod,
      subeKod: body.session.subeKod,
      fileName: "qr.json",
      jsonContent,
    });

    const menuUrl = buildMenuUrl(body.session);
    const qrResponse = await fetch(
      `https://api.qrserver.com/v1/create-qr-code/?size=900x900&data=${encodeURIComponent(menuUrl)}`,
      { cache: "no-store" },
    );

    if (!qrResponse.ok) {
      throw new Error(`QR gorseli olusturulamadi (${qrResponse.status}).`);
    }

    const qrBlob = new Blob([await qrResponse.arrayBuffer()], { type: "image/png" });
    const qrResult = await uploadBinaryFile({
      sirketKod: body.session.sirketKod,
      subeKod: body.session.subeKod,
      fileName: "qr_link.png",
      bytes: qrBlob,
    });

    revalidateTag(menuTag(body.session), "max");

    return NextResponse.json({
      jsonUrl: jsonResult.publicUrl,
      qrImageUrl: qrResult.publicUrl,
      menuUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Yayın başarısız." },
      { status: 500 },
    );
  }
}
