/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ScrollSpy from "react-scrollspy-navigation";
import {
  ArrowLeft,
  CircleX,
  ExternalLink,
  Grid2x2,
  LayoutList,
  List,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  QrCode,
  RefreshCcw,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_MENU_LINK } from "@/lib/config";
import {
  emptyCatalog,
  favoriteRows,
  groupRowsByAnaMenu,
  nextAnaMenuId,
  nextMenuId,
  nextProductId,
  rowsToCatalog,
  searchRows,
  totalMenus,
  totalProducts,
  uniqueCategoryRows,
} from "@/lib/catalog";
import { buildMenuUrl, decodeQrPayload, parseAdminToken, qrJsonUrl } from "@/lib/qr";
import type {
  AdminAnaMenu,
  AdminCatalog,
  AdminMenu,
  AdminProduct,
  AdminSession,
  AppRoute,
  PublishResult,
  QrLink,
  QrMenuRow,
} from "@/lib/types";

type Props = {
  route: AppRoute;
};

type ExtendedPublishResult = PublishResult & {
  localMenuUrl?: string;
};

type ProductDraft = {
  id?: number;
  anaMenuId: number;
  menuId: number;
  name: string;
  description: string;
  price: string;
  sortOrder: string;
  file?: File | null;
};

type AnaMenuDraft = {
  id?: number;
  name: string;
  sortOrder: string;
  favorite: boolean;
  file?: File | null;
};

type MenuDraft = {
  id?: number;
  anaMenuId: number;
  name: string;
  sortOrder: string;
};

function Footer() {
  return (
    <footer className="mt-6 border-t border-white/70 bg-[linear-gradient(90deg,#7c3aed,#4f46e5,#6d28d9)] px-4 py-4 text-white shadow-[0_-8px_30px_rgba(76,29,149,0.16)]">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-sm font-medium">
        <span>Powered by</span>
        <a
          href="https://ceqpos.com"
          target="_blank"
          rel="noreferrer"
          className="font-black underline"
        >
          ceqpos.com
        </a>
        <span className="text-xs opacity-80">v0.2.5</span>
      </div>
    </footer>
  );
}

function currency(value?: number | null) {
  return `${(value ?? 0).toFixed(2)} TL`;
}

function ProductCard({
  row,
  compact,
  onClick,
  count,
  onCountChange,
  orderingEnabled,
}: {
  row: QrMenuRow;
  compact?: boolean;
  onClick: () => void;
  count: number;
  onCountChange: (next: number) => void;
  orderingEnabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group overflow-hidden rounded-[22px] border border-slate-200 bg-white text-left shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 ${compact ? "flex items-center gap-4 p-3" : ""}`}
    >
      <div className={compact ? "h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100" : "relative h-48 overflow-hidden bg-slate-100"}>
        {row.urunResimQr ? (
          <img
            src={row.urunResimQr}
            alt={row.urunAd ?? "Ürün"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
        {!compact ? (
          <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/75 px-3 py-1 text-sm font-bold text-white">
            {currency(row.satisFiyat)}
          </div>
        ) : null}
      </div>
      <div className={compact ? "flex-1" : "space-y-2 p-4"}>
        <div className="line-clamp-2 text-sm font-black text-slate-900">{row.urunAd}</div>
        {compact ? <div className="mt-1 text-xs text-slate-500">{row.menuAd}</div> : null}
        {compact ? <div className="mt-3 text-sm font-black text-violet-700">{currency(row.satisFiyat)}</div> : null}
        {!compact && row.menuAd ? <div className="text-xs text-slate-500">{row.menuAd}</div> : null}
        {orderingEnabled ? (
          <div
            className={`mt-3 flex items-center gap-2 ${compact ? "" : "justify-end"}`}
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full"
              onClick={() => onCountChange(Math.max(0, count - 1))}
            >
              -
            </Button>
            <div className="w-10 text-center text-sm font-black text-slate-900">{count}</div>
            <Button
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => onCountChange(count + 1)}
            >
              +
            </Button>
          </div>
        ) : null}
      </div>
    </button>
  );
}

function UnknownScreen() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-6xl items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl overflow-hidden bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] text-white">
        <CardContent className="space-y-6 p-8 sm:p-10">
          <Badge className="bg-white/15 text-white">CeqPos QR</Badge>
          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight">
              QR menü gösterimi ve yönetimi tek yerde
            </h1>
            <p className="max-w-xl text-sm leading-7 text-white/80">
              Demo menüyü açabilir veya admin girişiyle şirket ve şube bazlı QR menü
              yönetimine geçebilirsiniz.
            </p>
          </div>
          <img
            src="https://www.roketnot.com/out/qr2.png"
            alt="QR demo"
            className="h-64 w-full rounded-[24px] object-cover"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild className="w-full">
              <a href={DEMO_MENU_LINK}>
                <QrCode className="mr-2 h-4 w-4" />
                DEMO QR AÇ
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin">
                <ExternalLink className="mr-2 h-4 w-4" />
                LOGIN OL
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function buildLocalMenuUrl(origin: string, liveMenuUrl: string) {
  const hashPayload = liveMenuUrl.split("/#/")[1];
  if (!hashPayload) {
    return liveMenuUrl;
  }
  return `${origin}/${hashPayload}`;
}

function toSectionId(label: string) {
  return `group-${label
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ş", "s")
    .replaceAll("ü", "u")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")}`;
}

function resolveHashRoute(hash: string): AppRoute {
  if (hash.startsWith("admin/")) {
    return {
      type: "admin",
      session: parseAdminToken(hash.slice("admin/".length)),
    };
  }

  const payload = decodeQrPayload(hash);
  if (payload) {
    return {
      type: "menu",
      link: payload,
    };
  }

  return { type: "unknown" };
}

function routeFromHash(route: AppRoute, hashValue: string) {
  const hash = hashValue.replace(/^#\/?/, "");
  if (!hash) {
    return route;
  }

  return route.type === "unknown" ? resolveHashRoute(hash) : route;
}

function PublicMenu({ link }: { link: QrLink }) {
  const [rows, setRows] = useState<QrMenuRow[]>([]);
  const [busy, setBusy] = useState(true);
  const [query, setQuery] = useState("");
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [viewMode, setViewMode] = useState<0 | 1 | 2>(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showCategoryDetail, setShowCategoryDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<QrMenuRow | null>(null);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const sirketKod = link.subeid ?? "";
    const subeKod = link.ceqposkod ?? link.seqposkod ?? "";
    const load = async () => {
      setBusy(true);
      const response = await fetch(
        `/api/menu?sirketKod=${encodeURIComponent(sirketKod)}&subeKod=${encodeURIComponent(subeKod)}`,
      );
      const data = (await response.json()) as QrMenuRow[];
      setRows(data);
      setSelectedCategoryId(data[0]?.anaMenuId ?? null);
      setBusy(false);
    };
    void load();
  }, [link.ceqposkod, link.seqposkod, link.subeid]);

  const categories = useMemo(() => uniqueCategoryRows(rows), [rows]);
  const favorites = useMemo(() => favoriteRows(rows), [rows]);
  const searched = useMemo(() => searchRows(rows, query), [rows, query]);
  const allGroups = useMemo(() => groupRowsByAnaMenu(rows), [rows]);
  const selectedCategory = categories.find((item) => item.anaMenuId === selectedCategoryId);
  const categoryMenus = useMemo(() => {
    const selectedName = selectedCategory?.anamenuAd;
    if (!selectedName) {
      return [] as { name: string; items: QrMenuRow[] }[];
    }
    const matching = rows.filter((item) => item.anamenuAd === selectedName);
    const menuNames = [...new Set(matching.map((item) => item.menuAd ?? "Diğer"))];
    return menuNames.map((name) => ({
      name,
      items: matching.filter((item) => (item.menuAd ?? "Diğer") === name),
    }));
  }, [rows, selectedCategory]);
  const cartItems = useMemo(
    () =>
      rows
        .filter((item) => (item.urunId ? cart[item.urunId] : 0) > 0)
        .map((item) => ({
          row: item,
          count: item.urunId ? cart[item.urunId] : 0,
        })),
    [cart, rows],
  );
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.row.satisFiyat ?? 0) * item.count,
    0,
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.count, 0);
  const orderingEnabled = (link.masaid ?? "0") !== "0";

  const renderProductList = (items: QrMenuRow[]) => {
    if (viewMode === 2) {
      return (
        <div className="space-y-3">
          {items.map((item) => (
            <ProductCard
              key={item.urunId}
              row={item}
              compact
              count={item.urunId ? cart[item.urunId] ?? 0 : 0}
              orderingEnabled={orderingEnabled}
              onCountChange={
                item.urunId
                  ? (next) =>
                      setCart((prev) => ({
                        ...prev,
                        [item.urunId!]: next,
                      }))
                  : () => undefined
              }
              onClick={() => setSelectedProduct(item)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className={`grid gap-4 ${viewMode === 0 ? "grid-cols-1" : "grid-cols-2 xl:grid-cols-3"}`}>
        {items.map((item) => (
          <ProductCard
            key={item.urunId}
            row={item}
            count={item.urunId ? cart[item.urunId] ?? 0 : 0}
            orderingEnabled={orderingEnabled}
            onCountChange={
              item.urunId
                ? (next) =>
                    setCart((prev) => ({
                      ...prev,
                      [item.urunId!]: next,
                    }))
                : () => undefined
            }
            onClick={() => setSelectedProduct(item)}
          />
        ))}
      </div>
    );
  };

  async function submitOrder() {
    if (!link.ipport || cartItems.length === 0) {
      return;
    }
    setOrdering(true);
    const items = cartItems.map((item) => ({
      ...item.row,
      adet: item.count,
      masaid: Number(link.masaid ?? "0"),
    }));
    const response = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ipport: link.ipport,
        items,
      }),
    });
    const result = (await response.json()) as { success?: boolean };
    setOrdering(false);
    if (result.success) {
      setCart({});
      setCartOpen(false);
      window.alert("BAŞARILI...");
      return;
    }
    window.alert("Bir hata oldu... !");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 py-4 sm:px-4">
      <div className="rounded-[30px] border border-white/80 bg-white/75 p-3 shadow-[0_28px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:flex md:flex-row md:items-center">
          <button
            type="button"
            onClick={() => {
              setShowAllProducts(false);
              setShowCategoryDetail(false);
              setQuery("");
            }}
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            {rows[0]?.sirketLogo ? (
              <img src={rows[0].sirketLogo} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <QrCode className="h-7 w-7 text-slate-400" />
            )}
          </button>
          <div className="relative min-w-0 md:flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ürün ara..."
              className="h-12 rounded-full border-slate-300 bg-white pl-11 pr-11"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Aramayı temizle"
              >
                <CircleX className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <div className="min-w-0 text-center text-base font-black leading-tight text-slate-900 md:min-w-44">
            {rows[0]?.subeAd || "QR Menü"}
          </div>
          {orderingEnabled ? (
            <Button
              variant="secondary"
              onClick={() => setCartOpen(true)}
              className="col-span-3 rounded-full md:col-auto"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {cartCount}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-white/70 p-1 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <Button
          variant={showAllProducts ? "ghost" : "secondary"}
          onClick={() => setShowAllProducts(false)}
          className="h-11 rounded-full"
        >
          Kategoriler
        </Button>
        <Button
          variant={showAllProducts ? "secondary" : "ghost"}
          onClick={() => setShowAllProducts(true)}
          className="h-11 rounded-full"
        >
          Tüm Ürünler
        </Button>
        {showAllProducts ? (
          <div className="col-span-2 flex justify-end gap-2 pt-1">
            <Button size="icon" variant={viewMode === 0 ? "secondary" : "ghost"} onClick={() => setViewMode(0)}>
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={viewMode === 1 ? "secondary" : "ghost"} onClick={() => setViewMode(1)}>
              <Grid2x2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant={viewMode === 2 ? "secondary" : "ghost"} onClick={() => setViewMode(2)}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex-1">
        {busy ? (
          <div className="flex min-h-96 items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : showCategoryDetail && selectedCategory ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-3 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setShowCategoryDetail(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="text-2xl font-black tracking-tight text-slate-950">MENÜ</div>
                  <div className="text-sm font-medium text-violet-700">
                    {selectedCategory.anamenuAd}
                  </div>
                </div>
              </div>
            </div>

            <ScrollSpy
              activeClass="!border-violet-500 !bg-violet-500 !text-white"
              activeAttr
              offsetTop={150}
              behavior="smooth"
              rootMargin="-18% 0px -68% 0px"
            >
              <div className="sticky top-2 z-20 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="flex min-w-max gap-2">
                  {categoryMenus.map((menu) => (
                    <a
                      key={`detail-nav-${menu.name}`}
                      href={`#${toSectionId(`${selectedCategory.anamenuAd}-${menu.name}`)}`}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition"
                    >
                      {menu.name}
                    </a>
                  ))}
                </div>
              </div>
            </ScrollSpy>

            <div className="space-y-4">
              {categoryMenus.map((menu, index) => (
                <section
                  key={menu.name}
                  id={toSectionId(`${selectedCategory.anamenuAd}-${menu.name}`)}
                  className="scroll-mt-40 space-y-3"
                >
                  <div className="flex items-center justify-between rounded-sm bg-sky-500 px-3 py-2 text-white">
                    <div className="text-sm font-black">{menu.name}</div>
                    {index === 0 ? (
                      <div className="flex gap-1">
                        <Button size="icon" variant={viewMode === 0 ? "secondary" : "ghost"} onClick={() => setViewMode(0)} className="h-8 w-8 rounded-md bg-transparent text-white hover:bg-white/15">
                          <LayoutList className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant={viewMode === 1 ? "secondary" : "ghost"} onClick={() => setViewMode(1)} className="h-8 w-8 rounded-md bg-transparent text-white hover:bg-white/15">
                          <Grid2x2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant={viewMode === 2 ? "secondary" : "ghost"} onClick={() => setViewMode(2)} className="h-8 w-8 rounded-md bg-transparent text-white hover:bg-white/15">
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  {renderProductList(menu.items)}
                </section>
              ))}
            </div>
          </div>
        ) : query.length >= 2 ? (
          searched.length === 0 ? (
            <Card className="p-12 text-center text-slate-500">Arama sonucu bulunamadı</Card>
          ) : (
            renderProductList(searched)
          )
        ) : showAllProducts ? (
          <div className="space-y-6">
            <ScrollSpy
              activeClass="!border-sky-500 !bg-sky-500 !text-white"
              activeAttr
              offsetTop={140}
              behavior="smooth"
              rootMargin="-20% 0px -65% 0px"
            >
              <div className="sticky top-2 z-20 overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="flex min-w-max gap-2">
                  {allGroups.map((group) => (
                    <a
                      key={`nav-${group.name}`}
                      href={`#${toSectionId(group.name)}`}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition"
                    >
                      {group.name}
                    </a>
                  ))}
                </div>
              </div>
            </ScrollSpy>
            {allGroups.map((group) => (
              <section
                key={group.name}
                id={toSectionId(group.name)}
                className="scroll-mt-36 space-y-3"
              >
                <div className="flex items-center justify-between rounded-2xl bg-sky-600 px-4 py-3 text-white">
                  <h2 className="text-sm font-black uppercase tracking-[0.18em]">{group.name}</h2>
                  <span className="text-xs font-bold opacity-80">{group.items.length} ürün</span>
                </div>
                {renderProductList(group.items)}
              </section>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {favorites.length > 0 ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900">Öne Çıkanlar</h2>
                  <Badge>{favorites.length} kategori</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  {favorites.map((item) => (
                    <button
                      key={`fav-${item.anaMenuId}`}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(item.anaMenuId ?? null);
                        setShowCategoryDetail(true);
                      }}
                      className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                    >
                      <div className="relative h-40 bg-slate-100 sm:h-44">
                        {item.anamenuResimQr ? (
                          <img src={item.anamenuResimQr} alt={item.anamenuAd ?? ""} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                        ) : null}
                        <div className="absolute inset-x-0 bottom-0 bg-slate-950/65 px-3 py-2 text-white">
                          <div className="text-sm font-black sm:text-lg">{item.anamenuAd}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">Kategoriler</h2>
                <Badge>{categories.length} ana menü</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {categories.map((item) => {
                  return (
                    <button
                      key={item.anaMenuId}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(item.anaMenuId ?? null);
                        setShowCategoryDetail(true);
                      }}
                      className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition"
                    >
                      <div className="relative h-40 bg-slate-100 sm:h-44">
                        {item.anamenuResimQr ? (
                          <img src={item.anamenuResimQr} alt={item.anamenuAd ?? ""} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                        ) : null}
                        <div className="absolute inset-x-0 bottom-0 bg-slate-950/65 px-3 py-2 text-white">
                          <div className="text-sm font-black sm:text-lg">{item.anamenuAd}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {showCategoryDetail && selectedCategory ? (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-slate-950">{selectedCategory.anamenuAd}</h3>
                  <Badge>{categoryMenus.length} menü</Badge>
                </div>
                <Tabs defaultValue={categoryMenus[0]?.name}>
                  <TabsList>
                    {categoryMenus.map((menu) => (
                      <TabsTrigger key={menu.name} value={menu.name}>
                        {menu.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {categoryMenus.map((menu) => (
                    <TabsContent key={menu.name} value={menu.name}>
                      {renderProductList(menu.items)}
                    </TabsContent>
                  ))}
                </Tabs>
              </section>
            ) : null}
          </div>
        )}
      </div>

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          {selectedProduct ? (
            <div className="grid gap-0 md:grid-cols-[1.15fr_1fr]">
              <div className="relative min-h-80 bg-slate-100">
                {selectedProduct.urunResimQr ? (
                  <img src={selectedProduct.urunResimQr} alt={selectedProduct.urunAd ?? ""} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="space-y-5 p-6">
                <DialogHeader>
                  <Badge className="w-fit bg-rose-50 text-rose-700">%20 İndirimli</Badge>
                  <DialogTitle className="pt-2 text-3xl">{selectedProduct.urunAd}</DialogTitle>
                  <DialogDescription className="text-base font-black text-emerald-600">
                    {currency(selectedProduct.satisFiyat)}
                  </DialogDescription>
                </DialogHeader>
                <Card className="rounded-3xl bg-slate-50 shadow-none">
                  <CardContent className="space-y-3">
                    <div className="text-sm font-black text-sky-700">Ürün Açıklaması</div>
                    <p className="text-sm leading-7 text-slate-600">
                      {selectedProduct.aciklamaQR || "Açıklama bulunmamaktadır."}
                    </p>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-3 rounded-3xl bg-[linear-gradient(135deg,#eff6ff,#f5f3ff)] p-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Kategori</div>
                    <div className="mt-1 text-sm font-black text-slate-800">{selectedProduct.menuAd}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Ana Menü</div>
                    <div className="mt-1 text-sm font-black text-slate-800">{selectedProduct.anamenuAd}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SEPETİM ({(link.masaad ?? "0").replaceAll("%20", " ")})</DialogTitle>
            <DialogDescription>Siparişe gidecek ürünler</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {cartItems.length === 0 ? (
              <Card className="rounded-3xl p-6 text-center text-slate-500">Hiç ürün yok.</Card>
            ) : (
              cartItems.map((item) => (
                <Card key={item.row.urunId} className="rounded-3xl">
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <div className="truncate font-black text-slate-900">{item.row.urunAd}</div>
                      <div className="text-sm text-slate-500">
                        {item.count} x {currency(item.row.satisFiyat)}
                      </div>
                    </div>
                    <div className="font-black text-violet-700">
                      {currency((item.row.satisFiyat ?? 0) * item.count)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="flex items-center justify-between rounded-3xl bg-slate-100 px-4 py-3">
            <div className="text-sm font-bold text-slate-500">Toplam</div>
            <div className="text-lg font-black text-slate-900">{currency(cartTotal)}</div>
          </div>
          <Button onClick={submitOrder} disabled={ordering || cartItems.length === 0}>
            {ordering ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
            SİPARİŞ VER
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminPanel({ initialSession }: { initialSession: AdminSession | null }) {
  const [session, setSession] = useState<AdminSession | null>(initialSession);
  const [catalog, setCatalog] = useState<AdminCatalog | null>(null);
  const [publishResult, setPublishResult] = useState<ExtendedPublishResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [login, setLogin] = useState({
    adminPassword: "",
    sirketKod: initialSession?.sirketKod ?? "",
    subeKod: initialSession?.subeKod ?? "",
  });
  const [anaMenuDialog, setAnaMenuDialog] = useState<AnaMenuDraft | null>(null);
  const [menuDialog, setMenuDialog] = useState<MenuDraft | null>(null);
  const [productDialog, setProductDialog] = useState<ProductDraft | null>(null);

  async function loadCatalog(target = session) {
    if (!target) return;
    setBusy(true);
    setErrorText(null);
    try {
      const response = await fetch(
        `/api/menu?sirketKod=${encodeURIComponent(target.sirketKod)}&subeKod=${encodeURIComponent(target.subeKod)}`,
        { cache: "no-store" },
      );
      const rows = (await response.json()) as QrMenuRow[];
      const nextCatalog =
        rows.length === 0 ? emptyCatalog(target.sirketKod, target.subeKod) : rowsToCatalog(rows);
      setCatalog(nextCatalog);
      const localOrigin =
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const liveMenuUrl = buildMenuUrl(target);
      setPublishResult({
        jsonUrl: qrJsonUrl(target),
        qrImageUrl: `https://ceqpos.com/out/qrmenu/${target.sirketKod}_${target.subeKod}/qr_link.png`,
        menuUrl: liveMenuUrl,
        localMenuUrl: buildLocalMenuUrl(localOrigin, liveMenuUrl),
      });
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Katalog yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (initialSession) {
      void loadCatalog(initialSession);
    }
    // initialSession token page load should restore the catalog once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSession]);

  async function submitLogin() {
    setBusy(true);
    setErrorText(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });
      const result = (await response.json()) as {
        error?: string;
        session?: AdminSession;
        token?: string;
      };
      if (!response.ok || !result.session || !result.token) {
        throw new Error(result.error ?? "Giriş başarısız.");
      }
      setSession(result.session);
      window.history.replaceState({}, "", `/admin/${result.token}`);
      await loadCatalog(result.session);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Giriş başarısız.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadAsset(
    file: File,
    prefix: string,
    id: number | string,
    currentSession = session,
  ) {
    if (!currentSession) throw new Error("Session yok.");
    const form = new FormData();
    form.set("sirketKod", currentSession.sirketKod);
    form.set("subeKod", currentSession.subeKod);
    form.set("prefix", prefix);
    form.set("id", String(id));
    form.set("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    const result = (await response.json()) as { publicUrl?: string; error?: string };
    if (!response.ok || !result.publicUrl) {
      throw new Error(result.error ?? "Upload başarısız.");
    }
    return result.publicUrl;
  }

  async function publishCatalogAction() {
    if (!session || !catalog) return;
    setBusy(true);
    setErrorText(null);
    setMessage(null);
    const response = await fetch("/api/admin/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session, catalog }),
    });
    const result = (await response.json()) as PublishResult & { error?: string };
    setBusy(false);
    if (!response.ok) {
      setErrorText(result.error ?? "Yayın başarısız.");
      return;
    }
    const localOrigin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    setPublishResult({
      ...result,
      localMenuUrl: buildLocalMenuUrl(localOrigin, result.menuUrl),
    });
    setMessage("QR menü yayınlandı.");
  }

  function upsertAnaMenu(draft: AnaMenuDraft, imageUrl?: string) {
    if (!catalog) return;
    const next = structuredClone(catalog) as AdminCatalog;
    const existing = draft.id
      ? next.anaMenuler.find((item) => item.id === draft.id)
      : undefined;
    if (existing) {
      existing.name = draft.name;
      existing.sortOrder = Number(draft.sortOrder) || 1;
      existing.isFavorite = draft.favorite ? 1 : 0;
      if (imageUrl) existing.imageUrl = imageUrl;
    } else {
      next.anaMenuler.push({
        id: nextAnaMenuId(next),
        name: draft.name,
        sortOrder: Number(draft.sortOrder) || 1,
        imageUrl: imageUrl ?? "",
        isFavorite: draft.favorite ? 1 : 0,
        menus: [],
      });
    }
    next.anaMenuler.sort((a, b) => a.sortOrder - b.sortOrder);
    setCatalog(next);
  }

  function upsertMenu(draft: MenuDraft) {
    if (!catalog) return;
    const next = structuredClone(catalog) as AdminCatalog;
    const existing = draft.id
      ? next.anaMenuler.flatMap((item) => item.menus).find((item) => item.id === draft.id)
      : undefined;
    if (existing) {
      next.anaMenuler.forEach((item) => {
        item.menus = item.menus.filter((menu) => menu.id !== existing.id);
      });
      next.anaMenuler.find((item) => item.id === draft.anaMenuId)?.menus.push(existing);
      existing.anaMenuId = draft.anaMenuId;
      existing.name = draft.name;
      existing.sortOrder = Number(draft.sortOrder) || 1;
    } else {
      next.anaMenuler
        .find((item) => item.id === draft.anaMenuId)
        ?.menus.push({
          id: nextMenuId(next),
          anaMenuId: draft.anaMenuId,
          name: draft.name,
          sortOrder: Number(draft.sortOrder) || 1,
          products: [],
        });
    }
    next.anaMenuler.forEach((item) => item.menus.sort((a, b) => a.sortOrder - b.sortOrder));
    setCatalog(next);
  }

  function upsertProduct(draft: ProductDraft, imageUrl?: string) {
    if (!catalog) return;
    const next = structuredClone(catalog) as AdminCatalog;
    const existing = draft.id
      ? next.anaMenuler
          .flatMap((item) => item.menus)
          .flatMap((menu) => menu.products)
          .find((item) => item.id === draft.id)
      : undefined;

    next.anaMenuler.forEach((ana) =>
      ana.menus.forEach((menu) => {
        menu.products = menu.products.filter((item) => item.id !== draft.id);
      }),
    );

    const targetMenu = next.anaMenuler
      .find((item) => item.id === draft.anaMenuId)
      ?.menus.find((item) => item.id === draft.menuId);
    if (!targetMenu) {
      setCatalog(next);
      return;
    }

    targetMenu.products.push({
      id: existing?.id ?? nextProductId(next),
      anaMenuId: draft.anaMenuId,
      menuId: draft.menuId,
      name: draft.name,
      description: draft.description,
      price: Number(draft.price.replace(",", ".")) || 0,
      sortOrder: Number(draft.sortOrder) || 1,
      imageUrl: imageUrl ?? existing?.imageUrl ?? "",
    });

    next.anaMenuler.forEach((ana) =>
      ana.menus.forEach((menu) => menu.products.sort((a, b) => a.sortOrder - b.sortOrder)),
    );
    setCatalog(next);
  }

  async function saveAnaMenu() {
    if (!anaMenuDialog || !catalog) return;
    setBusy(true);
    try {
      let imageUrl: string | undefined;
      const nextId = anaMenuDialog.id ?? nextAnaMenuId(catalog);
      if (anaMenuDialog.file) {
        imageUrl = await uploadAsset(anaMenuDialog.file, "anamenu", nextId);
      }
      upsertAnaMenu(anaMenuDialog, imageUrl);
      setAnaMenuDialog(null);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Ana menü kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }

  async function saveMenu() {
    if (!menuDialog) return;
    upsertMenu(menuDialog);
    setMenuDialog(null);
  }

  async function saveProduct() {
    if (!productDialog || !catalog) return;
    setBusy(true);
    try {
      let imageUrl: string | undefined;
      const nextId = productDialog.id ?? nextProductId(catalog);
      if (productDialog.file) {
        imageUrl = await uploadAsset(productDialog.file, "urun", nextId);
      }
      upsertProduct(productDialog, imageUrl);
      setProductDialog(null);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Ürün kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadLogo(file: File) {
    if (!session || !catalog) return;
    setBusy(true);
    try {
      const imageUrl = await uploadAsset(file, "", "logo");
      setCatalog({ ...catalog, sirketLogo: imageUrl });
      setMessage("Logo yüklendi.");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Logo yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }

  function deleteAnaMenu(item: AdminAnaMenu) {
    if (!catalog || !window.confirm(`${item.name} silinecek. Emin misiniz?`)) return;
    setCatalog({
      ...catalog,
      anaMenuler: catalog.anaMenuler.filter((entry) => entry.id !== item.id),
    });
  }

  function deleteMenu(item: AdminMenu) {
    if (!catalog || !window.confirm(`${item.name} silinecek. Emin misiniz?`)) return;
    setCatalog({
      ...catalog,
      anaMenuler: catalog.anaMenuler.map((ana) =>
        ana.id === item.anaMenuId
          ? { ...ana, menus: ana.menus.filter((menu) => menu.id !== item.id) }
          : ana,
      ),
    });
  }

  function deleteProduct(item: AdminProduct) {
    if (!catalog || !window.confirm(`${item.name} silinecek. Emin misiniz?`)) return;
    setCatalog({
      ...catalog,
      anaMenuler: catalog.anaMenuler.map((ana) => ({
        ...ana,
        menus: ana.menus.map((menu) =>
          menu.id === item.menuId
            ? { ...menu, products: menu.products.filter((product) => product.id !== item.id) }
            : menu,
        ),
      })),
    });
  }

  if (!session) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-6xl items-center justify-center px-4 py-10">
        <Card className="w-full max-w-2xl overflow-hidden bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] text-white">
          <CardContent className="space-y-6 p-8 sm:p-10">
            <Badge className="bg-white/15 text-white">Admin Login</Badge>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight">
                Şirket ve şube bazlı QR menü yönetimi
              </h1>
              <p className="text-sm leading-7 text-white/80">
                Giriş için 3 bilgi zorunlu: admin şifresi, şirket kodu ve şube kodu.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                type="password"
                placeholder="Admin Şifresi"
                value={login.adminPassword}
                onChange={(event) => setLogin((prev) => ({ ...prev, adminPassword: event.target.value }))}
                className="border-white/20 bg-white text-slate-900"
              />
              <Input
                placeholder="Şirket Kodu"
                value={login.sirketKod}
                onChange={(event) => setLogin((prev) => ({ ...prev, sirketKod: event.target.value }))}
                className="border-white/20 bg-white text-slate-900"
              />
              <Input
                placeholder="Şube Kodu"
                value={login.subeKod}
                onChange={(event) => setLogin((prev) => ({ ...prev, subeKod: event.target.value }))}
                className="border-white/20 bg-white text-slate-900"
              />
            </div>
            {errorText ? <div className="text-sm font-bold text-rose-200">{errorText}</div> : null}
            <Button onClick={submitLogin} disabled={busy} className="w-full">
              {busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Panele Gir
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4">
      <Card className="rounded-[30px] bg-white/80 backdrop-blur-sm">
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-950">QR Menü Yönetimi</h1>
            <div className="mt-1 text-sm font-semibold text-slate-500">
              {catalog?.subeAd || `${session.sirketKod} / ${session.subeKod}`}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => void loadCatalog()} disabled={busy}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Yenile
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSession(null);
                setCatalog(null);
                setPublishResult(null);
                window.history.replaceState({}, "", "/admin");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış
            </Button>
          </div>
        </CardContent>
      </Card>

      {errorText ? <Card className="border-rose-200 bg-rose-50 text-rose-700"><CardContent>{errorText}</CardContent></Card> : null}
      {message ? <Card className="border-emerald-200 bg-emerald-50 text-emerald-700"><CardContent>{message}</CardContent></Card> : null}

      {!catalog ? (
        <div className="flex min-h-96 items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      ) : (
        <Tabs defaultValue="panel">
          <TabsList>
            <TabsTrigger value="panel">Panel</TabsTrigger>
            <TabsTrigger value="anamenu">Ana Menü ({catalog.anaMenuler.length})</TabsTrigger>
            <TabsTrigger value="menu">Menü ({totalMenus(catalog)})</TabsTrigger>
            <TabsTrigger value="urun">Ürün ({totalProducts(catalog)})</TabsTrigger>
          </TabsList>

          <TabsContent value="panel" className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle>Yayın Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Şube Adı</div>
                    <Input
                      value={catalog.subeAd}
                      onChange={(event) => setCatalog({ ...catalog, subeAd: event.target.value })}
                      className="mt-3"
                    />
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Logo</div>
                    <div className="mt-3 flex items-center gap-3">
                      <label className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void uploadLogo(file);
                          }}
                        />
                      </label>
                      {catalog.sirketLogo ? (
                        <img src={catalog.sirketLogo} alt="Logo" className="h-14 w-14 rounded-2xl object-cover" />
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Card className="rounded-3xl bg-slate-950 text-white">
                    <CardContent className="py-6">
                      <div className="text-sm text-white/70">Ana Menü</div>
                      <div className="mt-2 text-4xl font-black">{catalog.anaMenuler.length}</div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-3xl bg-sky-600 text-white">
                    <CardContent className="py-6">
                      <div className="text-sm text-white/70">Menü</div>
                      <div className="mt-2 text-4xl font-black">{totalMenus(catalog)}</div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-3xl bg-emerald-600 text-white">
                    <CardContent className="py-6">
                      <div className="text-sm text-white/70">Ürün</div>
                      <div className="mt-2 text-4xl font-black">{totalProducts(catalog)}</div>
                    </CardContent>
                  </Card>
                </div>
                <Button onClick={publishCatalogAction} disabled={busy}>
                  {busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                  QR Menü Yayınla
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yayın Çıktıları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {publishResult ? (
                  <>
                    <a href={publishResult.menuUrl} target="_blank" rel="noreferrer" className="block rounded-3xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                      Menü Linki (Canlı)
                      <div className="mt-1 break-all text-xs font-medium text-slate-500">{publishResult.menuUrl}</div>
                    </a>
                    {publishResult.localMenuUrl ? (
                      <a href={publishResult.localMenuUrl} target="_blank" rel="noreferrer" className="block rounded-3xl bg-sky-50 p-4 text-sm font-bold text-sky-800">
                        Menü Linki (Local)
                        <div className="mt-1 break-all text-xs font-medium text-sky-700">{publishResult.localMenuUrl}</div>
                      </a>
                    ) : null}
                    <a href={publishResult.jsonUrl} target="_blank" rel="noreferrer" className="block rounded-3xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                      qr.json
                      <div className="mt-1 break-all text-xs font-medium text-slate-500">{publishResult.jsonUrl}</div>
                    </a>
                    <a href={publishResult.qrImageUrl} target="_blank" rel="noreferrer" className="block rounded-3xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                      QR Görseli
                      <div className="mt-1 break-all text-xs font-medium text-slate-500">{publishResult.qrImageUrl}</div>
                    </a>
                  </>
                ) : (
                  <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">Henüz yayın yapılmadı.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anamenu">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ana Menüler</CardTitle>
                <Button onClick={() => setAnaMenuDialog({ name: "", sortOrder: "1", favorite: false })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ana Menü Ekle
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {catalog.anaMenuler.map((item) => (
                  <Card key={item.id} className="overflow-hidden rounded-[26px]">
                    <div className="h-40 bg-slate-100">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" /> : null}
                    </div>
                    <CardContent className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-black text-slate-900">{item.name}</div>
                          <div className="text-sm text-slate-500">Sıra: {item.sortOrder}</div>
                        </div>
                        {item.isFavorite === 1 ? <Badge>Favori</Badge> : null}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setAnaMenuDialog({
                          id: item.id,
                          name: item.name,
                          sortOrder: String(item.sortOrder),
                          favorite: item.isFavorite === 1,
                        })}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Düzenle
                        </Button>
                        <Button variant="destructive" onClick={() => deleteAnaMenu(item)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Menüler</CardTitle>
                <Button
                  onClick={() =>
                    setMenuDialog({
                      anaMenuId: catalog.anaMenuler[0]?.id ?? 0,
                      name: "",
                      sortOrder: "1",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Menü Ekle
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {catalog.anaMenuler.map((ana) => (
                  <Card key={ana.id} className="rounded-[26px] bg-slate-50 shadow-none">
                    <CardContent className="space-y-3">
                      <div className="text-lg font-black text-slate-900">{ana.name}</div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {ana.menus.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="font-black text-slate-900">{item.name}</div>
                                <div className="text-sm text-slate-500">Sıra: {item.sortOrder}</div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setMenuDialog({
                                  id: item.id,
                                  anaMenuId: item.anaMenuId,
                                  name: item.name,
                                  sortOrder: String(item.sortOrder),
                                })}>
                                  <Pencil className="h-4 w-4" />
                                  <span className="ml-2">Düzenle</span>
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteMenu(item)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="urun">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ürünler</CardTitle>
                <Button
                  onClick={() => {
                    const firstAna = catalog.anaMenuler[0];
                    const firstMenu = firstAna?.menus[0];
                    setProductDialog({
                      anaMenuId: firstAna?.id ?? 0,
                      menuId: firstMenu?.id ?? 0,
                      name: "",
                      description: "",
                      price: "0",
                      sortOrder: "1",
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ürün Ekle
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {catalog.anaMenuler.map((ana) => (
                  <section key={ana.id} className="space-y-3">
                    <div className="text-lg font-black text-slate-900">{ana.name}</div>
                    {ana.menus.map((menu) => (
                      <Card key={menu.id} className="rounded-[26px] bg-slate-50 shadow-none">
                        <CardContent className="space-y-4">
                          <div className="font-black text-slate-700">{menu.name}</div>
                          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {menu.products.map((item) => (
                              <div key={item.id} className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
                                <div className="h-40 bg-slate-100">
                                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" /> : null}
                                </div>
                                <div className="space-y-3 p-4">
                                  <div className="line-clamp-2 font-black text-slate-900">{item.name}</div>
                                  <div className="line-clamp-2 text-sm text-slate-500">{item.description}</div>
                                  <div className="text-sm font-black text-violet-700">{currency(item.price)}</div>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setProductDialog({
                                      id: item.id,
                                      anaMenuId: item.anaMenuId,
                                      menuId: item.menuId,
                                      name: item.name,
                                      description: item.description,
                                      price: String(item.price),
                                      sortOrder: String(item.sortOrder),
                                    })}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Düzenle
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => deleteProduct(item)}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Sil
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </section>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={Boolean(anaMenuDialog)} onOpenChange={(open) => !open && setAnaMenuDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{anaMenuDialog?.id ? "Ana Menü Düzenle" : "Ana Menü Ekle"}</DialogTitle>
          </DialogHeader>
          {anaMenuDialog ? (
            <div className="space-y-4">
              <Input value={anaMenuDialog.name} onChange={(event) => setAnaMenuDialog({ ...anaMenuDialog, name: event.target.value })} placeholder="Ana Menü Adı" />
              <Input value={anaMenuDialog.sortOrder} onChange={(event) => setAnaMenuDialog({ ...anaMenuDialog, sortOrder: event.target.value })} placeholder="Sıra No" />
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <input type="checkbox" checked={anaMenuDialog.favorite} onChange={(event) => setAnaMenuDialog({ ...anaMenuDialog, favorite: event.target.checked })} />
                Favori Ana Menü
              </label>
              <Input type="file" accept="image/*" onChange={(event) => setAnaMenuDialog({ ...anaMenuDialog, file: event.target.files?.[0] ?? null })} />
              <Button onClick={() => void saveAnaMenu()} disabled={busy}>Kaydet</Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(menuDialog)} onOpenChange={(open) => !open && setMenuDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{menuDialog?.id ? "Menü Düzenle" : "Menü Ekle"}</DialogTitle>
          </DialogHeader>
          {menuDialog && catalog ? (
            <div className="space-y-4">
              <select
                className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                value={menuDialog.anaMenuId}
                onChange={(event) => setMenuDialog({ ...menuDialog, anaMenuId: Number(event.target.value) })}
              >
                {catalog.anaMenuler.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <Input value={menuDialog.name} onChange={(event) => setMenuDialog({ ...menuDialog, name: event.target.value })} placeholder="Menü Adı" />
              <Input value={menuDialog.sortOrder} onChange={(event) => setMenuDialog({ ...menuDialog, sortOrder: event.target.value })} placeholder="Sıra No" />
              <Button onClick={() => void saveMenu()}>Kaydet</Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(productDialog)} onOpenChange={(open) => !open && setProductDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{productDialog?.id ? "Ürün Düzenle" : "Ürün Ekle"}</DialogTitle>
          </DialogHeader>
          {productDialog && catalog ? (
            <div className="space-y-4">
              <select
                className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                value={productDialog.anaMenuId}
                onChange={(event) => {
                  const nextAnaMenuIdValue = Number(event.target.value);
                  const nextMenuIdValue =
                    catalog.anaMenuler.find((item) => item.id === nextAnaMenuIdValue)?.menus[0]?.id ?? 0;
                  setProductDialog({
                    ...productDialog,
                    anaMenuId: nextAnaMenuIdValue,
                    menuId: nextMenuIdValue,
                  });
                }}
              >
                {catalog.anaMenuler.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                value={productDialog.menuId}
                onChange={(event) => setProductDialog({ ...productDialog, menuId: Number(event.target.value) })}
              >
                {(catalog.anaMenuler.find((item) => item.id === productDialog.anaMenuId)?.menus ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <Input value={productDialog.name} onChange={(event) => setProductDialog({ ...productDialog, name: event.target.value })} placeholder="Ürün Adı" />
              <Textarea value={productDialog.description} onChange={(event) => setProductDialog({ ...productDialog, description: event.target.value })} placeholder="Açıklama" />
              <Input value={productDialog.price} onChange={(event) => setProductDialog({ ...productDialog, price: event.target.value })} placeholder="Satış Fiyatı" />
              <Input value={productDialog.sortOrder} onChange={(event) => setProductDialog({ ...productDialog, sortOrder: event.target.value })} placeholder="Sıra No" />
              <Input type="file" accept="image/*" onChange={(event) => setProductDialog({ ...productDialog, file: event.target.files?.[0] ?? null })} />
              <Button onClick={() => void saveProduct()} disabled={busy}>Kaydet</Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function QrApp({ route }: Props) {
  const [hash, setHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash,
  );

  useEffect(() => {
    const syncHash = () => {
      setHash(window.location.hash);
    };

    window.addEventListener("hashchange", syncHash);

    return () => {
      window.removeEventListener("hashchange", syncHash);
    };
  }, []);

  const clientRoute = useMemo(() => routeFromHash(route, hash), [route, hash]);

  return (
    <>
      {clientRoute.type === "menu" ? <PublicMenu link={clientRoute.link} /> : null}
      {clientRoute.type === "admin" ? <AdminPanel initialSession={clientRoute.session} /> : null}
      {clientRoute.type === "unknown" ? <UnknownScreen /> : null}
      <Footer />
    </>
  );
}
