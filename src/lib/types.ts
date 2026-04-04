export type QrLink = {
  ipport?: string | null;
  ceqposkod?: string | null;
  seqposkod?: string | null;
  subeid?: string | null;
  masaid?: string | null;
  masaad?: string | null;
};

export type QrMenuRow = {
  sirketKod?: string | null;
  subeKod?: string | null;
  subeAd?: string | null;
  sirketLogo?: string | null;
  anamenuAd?: string | null;
  menuAd?: string | null;
  urunAd?: string | null;
  subeId?: number | null;
  urunSirano?: number | null;
  anamenuSirano?: number | null;
  menuSirano?: number | null;
  urunId?: number | null;
  anaMenuId?: number | null;
  menuId?: number | null;
  satisFiyat?: number | null;
  anaFavori?: number | null;
  aciklamaQR?: string | null;
  anamenuResimQr?: string | null;
  urunResimQr?: string | null;
  adet?: number | null;
  masaid?: number | null;
};

export type AdminSession = {
  sirketKod: string;
  subeKod: string;
};

export type AdminProduct = {
  id: number;
  anaMenuId: number;
  menuId: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  sortOrder: number;
};

export type AdminMenu = {
  id: number;
  anaMenuId: number;
  name: string;
  sortOrder: number;
  products: AdminProduct[];
};

export type AdminAnaMenu = {
  id: number;
  name: string;
  sortOrder: number;
  imageUrl: string;
  isFavorite: number;
  menus: AdminMenu[];
};

export type AdminCatalog = {
  sirketKod: string;
  subeKod: string;
  subeAd: string;
  sirketLogo: string;
  anaMenuler: AdminAnaMenu[];
};

export type PublishResult = {
  jsonUrl: string;
  qrImageUrl: string;
  menuUrl: string;
};

export type AppRoute =
  | { type: "unknown" }
  | { type: "admin"; session: AdminSession | null }
  | { type: "menu"; link: QrLink };
