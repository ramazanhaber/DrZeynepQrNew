import { NextRequest, NextResponse } from "next/server";

import { ADMIN_PASSWORD } from "@/lib/config";
import { createAdminToken } from "@/lib/qr";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    adminPassword?: string;
    sirketKod?: string;
    subeKod?: string;
  };

  if (body.adminPassword !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Admin şifresi hatalı." }, { status: 401 });
  }

  if (!body.sirketKod?.trim() || !body.subeKod?.trim()) {
    return NextResponse.json(
      { error: "Şirket kodu ve şube kodu zorunludur." },
      { status: 400 },
    );
  }

  const session = {
    sirketKod: body.sirketKod.trim(),
    subeKod: body.subeKod.trim(),
  };

  return NextResponse.json({
    session,
    token: createAdminToken(session),
  });
}
