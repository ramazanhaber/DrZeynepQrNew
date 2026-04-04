import { describe, expect, it } from "vitest";

import {
  buildMenuUrl,
  createAdminToken,
  decodeQrPayload,
  encodeQrPayload,
  parseAdminToken,
  resolveAppRoute,
} from "./qr";

describe("qr helpers", () => {
  it("encodes and decodes qr payloads", () => {
    const payload = {
      subeid: "bolu",
      ceqposkod: "101",
      masaid: "5",
      masaad: "Masa 5",
      ipport: "127.0.0.1:5000",
    };

    const encoded = encodeQrPayload(payload);
    expect(decodeQrPayload(encoded)).toEqual(payload);
  });

  it("creates and parses admin tokens", () => {
    const session = {
      sirketKod: "bolu",
      subeKod: "101",
    };

    const token = createAdminToken(session);
    expect(parseAdminToken(token)).toEqual(session);
  });

  it("resolves menu and admin routes", () => {
    const menuUrl = buildMenuUrl({ sirketKod: "bolu", subeKod: "101" });
    const slug = menuUrl.split("/#/")[1];

    expect(resolveAppRoute(slug ? [slug] : []).type).toBe("menu");
    expect(resolveAppRoute(["admin"]).type).toBe("admin");
  });
});
