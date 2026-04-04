import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { uploadBinaryFile } from "@/lib/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const sirketKod = String(formData.get("sirketKod") ?? "");
  const subeKod = String(formData.get("subeKod") ?? "");
  const prefix = String(formData.get("prefix") ?? "");
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");

  if (!(file instanceof File) || !sirketKod || !subeKod) {
    return NextResponse.json({ error: "Eksik upload verisi." }, { status: 400 });
  }

  const ext = path.extname(file.name || "").toLowerCase() || ".png";
  const fileName = prefix ? `${prefix}_${id}${ext}` : file.name;

  try {
    const result = await uploadBinaryFile({
      sirketKod,
      subeKod,
      fileName,
      bytes: file,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload başarısız." },
      { status: 500 },
    );
  }
}
