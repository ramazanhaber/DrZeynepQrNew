import { describe, expect, it } from "vitest";

import {
  catalogToRows,
  nextAnaMenuId,
  nextMenuId,
  nextProductId,
  rowsToCatalog,
  searchRows,
} from "./catalog";
import type { AdminCatalog, QrMenuRow } from "./types";

const rows: QrMenuRow[] = [
  {
    sirketKod: "bolu",
    subeKod: "101",
    subeAd: "Konya Mutfagi",
    subeId: 1,
    sirketLogo: "https://ceqpos.com/logo.png",
    anamenuAd: "Pideler",
    menuAd: "Pideler",
    urunAd: "Kasarli Borek",
    urunId: 1001,
    anaMenuId: 10,
    menuId: 21,
    anamenuSirano: 1,
    menuSirano: 1,
    urunSirano: 1,
    satisFiyat: 25,
    aciklamaQR: "Lezzetli",
    anaFavori: 1,
    anamenuResimQr: "https://ceqpos.com/anamenu_10.png",
    urunResimQr: "https://ceqpos.com/urun_1001.png",
  },
];

describe("catalog helpers", () => {
  it("converts rows to catalog and back", () => {
    const catalog = rowsToCatalog(rows);
    expect(catalog.sirketKod).toBe("bolu");
    expect(catalog.anaMenuler).toHaveLength(1);
    expect(catalogToRows(catalog)).toEqual(rows);
  });

  it("searches rows with normalized text", () => {
    expect(searchRows(rows, "kasar")).toHaveLength(1);
    expect(searchRows(rows, "xyz")).toHaveLength(0);
  });

  it("computes next ids", () => {
    const catalog: AdminCatalog = rowsToCatalog(rows);
    expect(nextAnaMenuId(catalog)).toBe(11);
    expect(nextMenuId(catalog)).toBe(22);
    expect(nextProductId(catalog)).toBe(1002);
  });
});
