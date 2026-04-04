import type {
  AdminAnaMenu,
  AdminCatalog,
  AdminMenu,
  AdminProduct,
  QrMenuRow,
} from "@/lib/types";

export function emptyCatalog(
  sirketKod = "",
  subeKod = "",
): AdminCatalog {
  return {
    sirketKod,
    subeKod,
    subeAd: "",
    sirketLogo: "",
    anaMenuler: [],
  };
}

export function normalizeTurkishText(text: string) {
  return text
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ş", "s")
    .replaceAll("ü", "u");
}

export function rowsToCatalog(rows: QrMenuRow[]): AdminCatalog {
  if (rows.length === 0) {
    return emptyCatalog();
  }

  const anaMap = new Map<number, AdminAnaMenu>();
  const menuMap = new Map<string, AdminMenu>();

  rows.forEach((row) => {
    const anaId = row.anaMenuId ?? 0;
    const menuId = row.menuId ?? 0;
    const resolvedAnaId = anaId === 0 ? anaMap.size + 1 : anaId;
    const resolvedMenuId = menuId === 0 ? menuMap.size + 1 : menuId;
    const menuKey = `${resolvedAnaId}-${resolvedMenuId}`;

    if (!anaMap.has(resolvedAnaId)) {
      anaMap.set(resolvedAnaId, {
        id: resolvedAnaId,
        name: row.anamenuAd ?? "",
        sortOrder: row.anamenuSirano ?? 1,
        imageUrl: row.anamenuResimQr ?? "",
        isFavorite: row.anaFavori ?? 0,
        menus: [],
      });
    }

    if (!menuMap.has(menuKey)) {
      const menu: AdminMenu = {
        id: resolvedMenuId,
        anaMenuId: resolvedAnaId,
        name: row.menuAd ?? "",
        sortOrder: row.menuSirano ?? 1,
        products: [],
      };
      menuMap.set(menuKey, menu);
      anaMap.get(resolvedAnaId)?.menus.push(menu);
    }

    menuMap.get(menuKey)?.products.push({
      id: row.urunId ?? 0,
      anaMenuId: resolvedAnaId,
      menuId: resolvedMenuId,
      name: row.urunAd ?? "",
      description: row.aciklamaQR ?? "",
      imageUrl: row.urunResimQr ?? "",
      price: row.satisFiyat ?? 0,
      sortOrder: row.urunSirano ?? 1,
    });
  });

  const first = rows[0];
  const catalog: AdminCatalog = {
    sirketKod: first.sirketKod ?? "",
    subeKod: first.subeKod ?? "",
    subeAd: first.subeAd ?? "",
    sirketLogo: first.sirketLogo ?? "",
    anaMenuler: [...anaMap.values()].sort((a, b) => a.sortOrder - b.sortOrder),
  };

  catalog.anaMenuler.forEach((ana) => {
    ana.menus.sort((a, b) => a.sortOrder - b.sortOrder);
    ana.menus.forEach((menu) =>
      menu.products.sort((a, b) => a.sortOrder - b.sortOrder),
    );
  });

  return catalog;
}

export function catalogToRows(catalog: AdminCatalog): QrMenuRow[] {
  return [...catalog.anaMenuler]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((ana) =>
      [...ana.menus]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .flatMap((menu) =>
          [...menu.products]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((product) => ({
              sirketKod: catalog.sirketKod,
              subeKod: catalog.subeKod,
              subeAd: catalog.subeAd,
              sirketLogo: catalog.sirketLogo,
              anamenuAd: ana.name,
              menuAd: menu.name,
              urunAd: product.name,
              subeId: 1,
              urunSirano: product.sortOrder,
              anamenuSirano: ana.sortOrder,
              menuSirano: menu.sortOrder,
              urunId: product.id,
              anaMenuId: ana.id,
              menuId: menu.id,
              satisFiyat: product.price,
              anaFavori: ana.isFavorite,
              aciklamaQR: product.description,
              anamenuResimQr: ana.imageUrl,
              urunResimQr: product.imageUrl,
            })),
        ),
    );
}

export function nextAnaMenuId(catalog: AdminCatalog) {
  return Math.max(0, ...catalog.anaMenuler.map((item) => item.id)) + 1;
}

export function nextMenuId(catalog: AdminCatalog) {
  return (
    Math.max(0, ...catalog.anaMenuler.flatMap((item) => item.menus.map((m) => m.id))) +
    1
  );
}

export function nextProductId(catalog: AdminCatalog) {
  return (
    Math.max(
      0,
      ...catalog.anaMenuler.flatMap((item) =>
        item.menus.flatMap((menu) => menu.products.map((product) => product.id)),
      ),
    ) + 1
  );
}

export function totalMenus(catalog: AdminCatalog) {
  return catalog.anaMenuler.reduce((sum, item) => sum + item.menus.length, 0);
}

export function totalProducts(catalog: AdminCatalog) {
  return catalog.anaMenuler.reduce(
    (sum, item) =>
      sum + item.menus.reduce((menuSum, menu) => menuSum + menu.products.length, 0),
    0,
  );
}

export function searchRows(rows: QrMenuRow[], query: string) {
  const q = normalizeTurkishText(query);
  if (q.length < 2) {
    return [];
  }
  return rows.filter((item) =>
    [
      item.urunAd ?? "",
      item.menuAd ?? "",
      item.anamenuAd ?? "",
      item.aciklamaQR ?? "",
    ].some((text) => normalizeTurkishText(text).includes(q)),
  );
}

export function groupRowsByAnaMenu(rows: QrMenuRow[]) {
  const map = new Map<string, QrMenuRow[]>();
  rows.forEach((row) => {
    const key = row.anamenuAd ?? "Diğer";
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)?.push(row);
  });
  return [...map.entries()].map(([name, items]) => ({
    name,
    items: [...items].sort(
      (a, b) => (a.urunSirano ?? 0) - (b.urunSirano ?? 0),
    ),
  }));
}

export function uniqueCategoryRows(rows: QrMenuRow[]) {
  const byId = new Map<number, QrMenuRow>();
  rows.forEach((row) => {
    const key = row.anaMenuId ?? byId.size + 1;
    if (!byId.has(key)) {
      byId.set(key, row);
    }
  });
  return [...byId.values()].sort(
    (a, b) => (a.anamenuSirano ?? 0) - (b.anamenuSirano ?? 0),
  );
}

export function favoriteRows(rows: QrMenuRow[]) {
  return uniqueCategoryRows(rows).filter((item) => (item.anaFavori ?? 0) === 1);
}

export function qrRowFromProduct(
  catalog: AdminCatalog,
  product: AdminProduct,
): QrMenuRow | undefined {
  for (const ana of catalog.anaMenuler) {
    for (const menu of ana.menus) {
      const found = menu.products.find((item) => item.id === product.id);
      if (found) {
        return {
          sirketKod: catalog.sirketKod,
          subeKod: catalog.subeKod,
          subeAd: catalog.subeAd,
          sirketLogo: catalog.sirketLogo,
          anamenuAd: ana.name,
          menuAd: menu.name,
          urunAd: found.name,
          urunId: found.id,
          anaMenuId: ana.id,
          menuId: menu.id,
          satisFiyat: found.price,
          aciklamaQR: found.description,
          anamenuResimQr: ana.imageUrl,
          urunResimQr: found.imageUrl,
        };
      }
    }
  }
}
