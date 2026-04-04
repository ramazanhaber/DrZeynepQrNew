import crypto from "node:crypto";

import {
  EDIT_LINK_SECRET,
  MENU_BASE_URL,
  MENU_HOST_URL,
} from "@/lib/config";
import type { AdminSession, AppRoute, QrLink } from "@/lib/types";

export function folderName(session: AdminSession) {
  return `${session.sirketKod}_${session.subeKod}`;
}

export function qrJsonUrl(session: AdminSession) {
  return `${MENU_BASE_URL}/${folderName(session)}/qr.json`;
}

export function buildMenuUrl(session: AdminSession) {
  const payload: QrLink = {
    subeid: session.sirketKod,
    ceqposkod: session.subeKod,
    masaid: "0",
    masaad: "0",
  };
  return `${MENU_HOST_URL}/#/${encodeQrPayload(payload)}`;
}

export function encodeQrPayload(payload: QrLink) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

export function decodeQrPayload(encoded: string): QrLink | null {
  try {
    let normalized = decodeURIComponent(
      encoded.replace(/^#\//, "").replace(/^\//, ""),
    );
    while (normalized.length % 4 !== 0) {
      normalized += "=";
    }
    const text = Buffer.from(normalized, "base64").toString("utf8");
    const payload = JSON.parse(text) as QrLink;
    if (!payload.ceqposkod && payload.seqposkod) {
      payload.ceqposkod = payload.seqposkod;
    }
    return payload;
  } catch {
    return null;
  }
}

export function signAdminPayload(payloadBase64: string) {
  return crypto
    .createHash("sha256")
    .update(`${payloadBase64}|${EDIT_LINK_SECRET}`)
    .digest("hex")
    .slice(0, 24);
}

export function createAdminToken(session: AdminSession) {
  const payload = {
    sirketKod: session.sirketKod,
    subeKod: session.subeKod,
    iat: Date.now(),
  };
  const payloadBase64 = Buffer.from(
    JSON.stringify(payload),
    "utf8",
  ).toString("base64url");
  return `${payloadBase64}.${signAdminPayload(payloadBase64)}`;
}

export function parseAdminToken(token: string): AdminSession | null {
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) {
    return null;
  }
  if (signAdminPayload(payloadBase64) !== signature) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf8"),
    ) as Partial<AdminSession>;
    if (!payload.sirketKod || !payload.subeKod) {
      return null;
    }
    return {
      sirketKod: payload.sirketKod,
      subeKod: payload.subeKod,
    };
  } catch {
    return null;
  }
}

export function resolveAppRoute(slug?: string[]): AppRoute {
  if (!slug || slug.length === 0) {
    return { type: "unknown" };
  }

  if (slug[0] === "admin") {
    return {
      type: "admin",
      session: slug[1] ? parseAdminToken(slug[1]) : null,
    };
  }

  const payload = decodeQrPayload(slug.join("/"));
  if (payload) {
    return { type: "menu", link: payload };
  }

  return { type: "unknown" };
}
