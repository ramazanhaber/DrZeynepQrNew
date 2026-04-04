import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    ipport?: string;
    items?: unknown[];
  };

  if (!body.ipport) {
    return NextResponse.json(
      { success: false, message: "ipport boş, sipariş gönderilemiyor." },
      { status: 400 },
    );
  }

  const response = await fetch(`http://${body.ipport}/api/QrMenu/setQrSiparis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body.items ?? []),
  });

  const text = await response.text();

  return NextResponse.json(
    {
      success: response.ok && text.trim().length > 0,
      status: response.status,
      body: text,
    },
    { status: response.ok ? 200 : 502 },
  );
}
