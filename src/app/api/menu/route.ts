import { NextRequest, NextResponse } from "next/server";

import { qrJsonUrl } from "@/lib/qr";

function menuTag(sirketKod: string, subeKod: string) {
  return `qr-menu:${sirketKod}_${subeKod}`;
}

export async function GET(request: NextRequest) {
  const sirketKod = request.nextUrl.searchParams.get("sirketKod");
  const subeKod = request.nextUrl.searchParams.get("subeKod");

  if (!sirketKod || !subeKod) {
    return NextResponse.json({ error: "sirketKod ve subeKod zorunlu." }, { status: 400 });
  }

  try {
    const response = await fetch(
      qrJsonUrl({ sirketKod, subeKod }),
      {
        next: {
          revalidate: 300,
          tags: [menuTag(sirketKod, subeKod)],
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json([], {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    const text = await response.text();
    if (!text.trim()) {
      return NextResponse.json([], {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    return new NextResponse(text, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json([], {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
