import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { api, apiFetch, setCsrfToken } from "../api";
import { API_BASE_URL } from "../config";
import toast from "react-hot-toast";

type Item = Record<string, any>;
type View =
  "dashboard" | "products" | "blogs" | "orders" | "payments" | "revenue" | "audit" | "data" | "settings";
type Action = "duplicate" | "archive" | "publish" | "draft" | "hidden";
type PaginationState = { page: number; limit: number; total: number; pages: number };

const blankProduct = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: 0,
  isFree: false,
  ownerSharePercent: 100,
  category: "Web Dev Projects",
  thumbnail: "",
  galleryImages: "",
  techStack: "",
  tags: "",
  demoUrl: "",
  downloadUrl: "",
  status: "hidden",
  seoTitle: "",
  seoDescription: "",
};
const blankBlog = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  author: "CodersVoice",
  category: "Development",
  tags: "",
  status: "draft",
  seoTitle: "",
  metaDescription: "",
};
const listify = (value: unknown) =>
  typeof value === "string"
    ? value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : value;
const formatINR = (value: unknown) => `INR ${Number(value || 0).toLocaleString("en-IN")}`;
const localDateValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const dateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localDateValue(date);
};
const revenueDateRange = (days: number) => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - Math.max(0, days - 1));
  return { from: localDateValue(start), to: localDateValue(end) };
};
const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </>
    ),
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
    receipt: (
      <>
        <path d="M5 3h14v18l-3-2-2 2-2-2-3 2-4-2V3Z" />
        <path d="M8 8h8M8 12h8" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5M4 19h17" />
        <path d="m7 15 4-4 3 2 5-6" />
        <path d="M16 7h3v3" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    gear: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.1 2.1-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56v.1h-3v-.1A1.7 1.7 0 0 0 10.7 18.6a1.7 1.7 0 0 0-1.88.34l-.06.06-2.1-2.1.06-.06A1.7 1.7 0 0 0 7.06 15a1.7 1.7 0 0 0-1.56-1.03H5.4v-3h.1A1.7 1.7 0 0 0 7.06 9.94a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.1-2.1.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56v-.1h3v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.1 2.1-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.1v3h-.1A1.7 1.7 0 0 0 19.4 15Z" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
      </>
    ),
    copy: (
      <>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 6.2A11.6 11.6 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-3.1 3.7M6.6 6.6C3.7 8.4 2 12 2 12s3.5 6 10 6c1.3 0 2.5-.2 3.5-.6" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

const IconButton = ({
  label,
  tone = "default",
  onClick,
  icon,
  disabled = false,
}: {
  label: string;
  tone?: "default" | "danger" | "active";
  onClick: () => void;
  icon: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${tone === "danger" ? "border-red-500/20 text-red-300 hover:bg-red-500/15" : tone === "active" ? "border-amber-400/25 text-amber-300 hover:bg-amber-400/10" : "border-slate-700 text-slate-300 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-300"}`}
  >
    <Icon name={icon} size={15} />
  </button>
);

const Admin: React.FC = () => {
  const [admin, setAdmin] = useState<Item | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [view, setView] = useState<View>("dashboard");
  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0, pages: 1 });
  const [stats, setStats] = useState<Item>({});
  const [settings, setSettings] = useState<Item>({});
  const [editing, setEditing] = useState<Item | null>(null);
  const [editorError, setEditorError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingAction, setPendingAction] = useState("");
  const [uploadingField, setUploadingField] = useState("");
  const [downloadingReport, setDownloadingReport] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dataSummary, setDataSummary] = useState<Item[]>([]);
  const [databaseStorage, setDatabaseStorage] = useState<Item | null>(null);
  const [retentionTarget, setRetentionTarget] = useState("audit_logs");
  const [retentionFrom, setRetentionFrom] = useState("");
  const [retentionTo, setRetentionTo] = useState("");
  const [retentionPreview, setRetentionPreview] = useState<Item | null>(null);
  const [retentionConfirmation, setRetentionConfirmation] = useState("");
  const [dataManagementLoading, setDataManagementLoading] = useState(false);
  const [purgingData, setPurgingData] = useState(false);
  const [retentionBackupDownloaded, setRetentionBackupDownloaded] = useState(false);
  const [downloadingRetentionBackup, setDownloadingRetentionBackup] = useState("");
  const [revenue, setRevenue] = useState<Item | null>(null);
  const [revenueProducts, setRevenueProducts] = useState<Item[]>([]);
  const [revenueProductIds, setRevenueProductIds] = useState<string[]>([]);
  const [revenueProductPickerOpen, setRevenueProductPickerOpen] = useState(false);
  const [revenueProductSearch, setRevenueProductSearch] = useState("");
  const [revenueFrom, setRevenueFrom] = useState(dateDaysAgo(29));
  const [revenueTo, setRevenueTo] = useState(dateDaysAgo(0));
  const [revenueFallbackShare, setRevenueFallbackShare] = useState("100");
  const [revenuePreset, setRevenuePreset] = useState<number | null>(30);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const articleTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const revenueRequestRef = useRef(0);
  const nav = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: "grid" },
      { id: "products", label: "Products", icon: "box" },
      { id: "blogs", label: "Blog", icon: "book" },
      { id: "orders", label: "Orders", icon: "receipt" },
      { id: "payments", label: "Payments", icon: "card" },
      { id: "revenue", label: "Revenue analytics", icon: "chart" },
      { id: "audit", label: "Audit logs", icon: "clock" },
      { id: "data", label: "Data management", icon: "database" },
      { id: "settings", label: "Settings", icon: "gear" },
    ],
    [],
  );
  const announce = (message: string) => toast.success(message);
  const reportError = (message: string) => toast.error(message);
  const loadDataSummary = async () => {
    setDataManagementLoading(true);
    try {
      const response = await api<{ items: Item[]; storage?: Item }>("/api/admin/data-management/summary");
      setDataSummary(response.items || []);
      setDatabaseStorage(response.storage || null);
    } catch (error: any) {
      reportError(error.message || "Unable to load retention data.");
    } finally {
      setDataManagementLoading(false);
    }
  };
  const loadRevenue = async (overrides: Partial<{ from: string; to: string; productIds: string[]; fallbackShare: string }> = {}) => {
    const from = overrides.from ?? revenueFrom;
    const to = overrides.to ?? revenueTo;
    const productIds = overrides.productIds ?? revenueProductIds;
    const fallbackShare = overrides.fallbackShare ?? revenueFallbackShare;
    const requestId = ++revenueRequestRef.current;
    setRevenueLoading(true);
    try {
      const params = new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}), ...(productIds.length ? { productIds: productIds.join(",") } : {}), defaultOwnerShare: fallbackShare || "100" });
      const [analytics, options] = await Promise.all([
        api<Item>(`/api/admin/revenue?${params}`),
        revenueProducts.length ? Promise.resolve({ items: revenueProducts }) : api<{ items: Item[] }>("/api/admin/revenue/products"),
      ]);
      if (requestId !== revenueRequestRef.current) return;
      setRevenue(analytics);
      if (!revenueProducts.length) setRevenueProducts(options.items || []);
    } catch (error: any) {
      if (requestId === revenueRequestRef.current) reportError(error.message || "Unable to calculate revenue.");
    } finally {
      if (requestId === revenueRequestRef.current) setRevenueLoading(false);
    }
  };
  const applyRevenuePreset = (days: number) => {
    const { from, to } = revenueDateRange(days);
    setRevenuePreset(days);
    setRevenueFrom(from);
    setRevenueTo(to);
    void loadRevenue({ from, to, productIds: revenueProductIds, fallbackShare: revenueFallbackShare });
  };
  const tableView = ["products", "blogs", "orders", "payments", "audit"].includes(view);
  const pageNumbers = useMemo(() => {
    const candidates = [1, pagination.page - 2, pagination.page - 1, pagination.page, pagination.page + 1, pagination.page + 2, pagination.pages];
    return [...new Set(candidates.filter((value) => value >= 1 && value <= pagination.pages))];
  }, [pagination.page, pagination.pages]);
  const load = async (target = view, requestedPage = pagination.page) => {
    if (!admin) return;
    setLoading(true);
    try {
      if (target === "dashboard")
        setStats((await api<any>("/api/admin/dashboard")).stats);
      else if (target === "data") await loadDataSummary();
      else if (target === "revenue") await loadRevenue();
      else if (["products", "blogs", "orders", "payments", "audit"].includes(target)) {
        const params = new URLSearchParams({
          page: String(requestedPage),
          limit: String(pagination.limit),
          ...(query ? { q: query } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(categoryFilter && ["products", "blogs"].includes(target)
            ? { category: categoryFilter }
            : {}),
          ...(auditActionFilter && target === "audit"
            ? { action: auditActionFilter }
            : {}),
          ...(paymentMethodFilter && target === "payments" ? { method: paymentMethodFilter } : {}),
          ...(target === "payments" ? { sort: sortFilter } : {}),
          ...(dateFrom ? { from: dateFrom } : {}),
          ...(dateTo ? { to: dateTo } : {}),
        });
        const path = target === "audit" ? "/api/admin/audit-logs" : `/api/admin/${target}`;
        const response = await api<any>(`${path}?${params}`);
        setItems(response.items);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          pages: Math.max(response.pages || 1, 1),
        });
        if (response.items.length === 0 && response.total > 0 && requestedPage > 1) {
          setPagination((current) => ({ ...current, page: current.page - 1 }));
        }
      }
      else setSettings((await api<any>("/api/admin/settings")).item);
    } catch (error: any) {
      reportError(error.message || "Could not load this data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    Promise.all([
      api<any>("/api/admin/me").catch(() => null),
      api<any>("/api/admin/setup-status").catch(() => null),
    ])
      .then(([session, setup]) => {
        if (session) {
          setAdmin(session.admin);
          setCsrfToken(session.csrfToken);
        }
        setNeedsSetup(Boolean(setup?.needsSetup));
      })
      .finally(() => {
        document.title = "Admin | CodersVoice";
        document
          .querySelector('meta[name="robots"]')
          ?.setAttribute("content", "noindex,nofollow");
      });
    return () =>
      document
        .querySelector('meta[name="robots"]')
        ?.setAttribute("content", "index,follow");
  }, []);
  useEffect(() => {
    if (admin) load();
  }, [admin, view, query, statusFilter, categoryFilter, auditActionFilter, paymentMethodFilter, sortFilter, dateFrom, dateTo, pagination.page, pagination.limit]);
  const login = async (event: FormEvent) => {
    event.preventDefault();
    if (authLoading) return;
    setAuthLoading(true);
    try {
      if (needsSetup) {
        await api("/api/admin/bootstrap", {
          method: "POST",
          body: JSON.stringify(credentials),
        });
        setNeedsSetup(false);
        announce("Admin created. Sign in with the same credentials.");
        return;
      }
      const data = await api<any>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      setAdmin(data.admin);
      setCsrfToken(data.csrfToken);
    } catch (error: any) {
      reportError(error.message || "Unable to sign in.");
    } finally {
      setAuthLoading(false);
    }
  };
  const logout = async () => {
    try {
      await api("/api/admin/logout", { method: "POST" });
    } finally {
      setAdmin(null);
      setCsrfToken("");
    }
  };
  const changeView = (target: View) => {
    setEditing(null);
    setQuery("");
    setStatusFilter("");
    setCategoryFilter("");
    setAuditActionFilter("");
    setPaymentMethodFilter("");
    setSortFilter("newest");
    setDateFrom("");
    setDateTo("");
    setRetentionPreview(null);
    setRetentionConfirmation("");
    setRetentionBackupDownloaded(false);
    setPagination((current) => ({ ...current, page: 1, total: 0, pages: 1 }));
    setView(target);
  };
  const resetTableFilters = () => {
    setQuery("");
    setStatusFilter("");
    setCategoryFilter("");
    setAuditActionFilter("");
    setPaymentMethodFilter("");
    setSortFilter("newest");
    setDateFrom("");
    setDateTo("");
    setPagination((current) => ({ ...current, page: 1 }));
  };
  const setTableFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPagination((current) => ({ ...current, page: 1 }));
  };
  const openEdit = (item: Item) => {
    setEditorError("");
    setEditing({
      ...item,
      tags: (item.tags || []).join(", "),
      techStack: (item.techStack || []).join(", "),
      galleryImages: (item.galleryImages || []).join(", "),
    });
  };
  const openCreate = () => {
    setEditorError("");
    setEditing(view === "products" ? { ...blankProduct } : { ...blankBlog });
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing || saving) return;
    const kind = view === "products" ? "products" : "blogs";
    if (view === "products") {
      const required = [
        ["name", "product name"], ["slug", "URL slug"], ["category", "category"], ["shortDescription", "short description"], ["description", "description"], ["thumbnail", "thumbnail"], ["downloadUrl", "private download URL"],
      ].filter(([key]) => !String(editing[key] ?? "").trim()).map(([, label]) => label);
      const isFree = editing.isFree === true;
      if (required.length || !Number.isFinite(Number(editing.price)) || Number(editing.price) < 0 || (!isFree && Number(editing.price) <= 0)) {
        const message = required.length ? `Complete required fields: ${required.join(", ")}.` : "Price must be greater than zero. Mark the product as free to offer it at no cost.";
        setEditorError(message);
        reportError(message);
        return;
      }
      if (!editing._id && !/^https:\/\/res\.cloudinary\.com\//i.test(String(editing.thumbnail))) {
        const message = "Store the thumbnail in Cloudinary first: upload a local image or paste its URL and choose ‘Import URL to Cloudinary’.";
        setEditorError(message);
        reportError(message);
        return;
      }
    }
    const prepared = {
      ...editing,
      isFree: editing.isFree === true,
      price: editing.isFree === true ? 0 : Number(editing.price),
      tags: listify(editing.tags),
      techStack: listify(editing.techStack),
      galleryImages: listify(editing.galleryImages),
    };
    if (view === "products" && Array.isArray(prepared.galleryImages) && prepared.galleryImages.some((url) => !/^https:\/\/res\.cloudinary\.com\//i.test(String(url)))) {
      const message = "Import every gallery URL to Cloudinary before saving the product.";
      setEditorError(message);
      reportError(message);
      return;
    }
    const payload = Object.fromEntries(
      Object.entries(prepared).filter(
        ([key, value]) =>
          !["_id", "createdAt", "updatedAt", "__v", "publishedAt"].includes(
            key,
          ) && value !== "",
      ),
    );
    setSaving(true);
    setEditorError("");
    try {
      const endpoint = editing._id
        ? `/api/admin/${kind}/${editing._id}`
        : `/api/admin/${kind}`;
      await api(endpoint, {
        method: editing._id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setEditing(null);
      announce("Saved successfully.");
      setPagination((current) => ({ ...current, page: 1 }));
      await load(kind, 1);
    } catch (error: any) {
      const message = error.message || "Unable to save this record.";
      setEditorError(message);
      reportError(message);
    } finally {
      setSaving(false);
    }
  };
  const action = async (id: string, actionName: Action) => {
    const kind = view === "products" ? "products" : "blogs";
    if (
      actionName === "archive" &&
      !window.confirm(
        "Archive this record? Existing order history will stay intact.",
      )
    )
      return;
    setPendingAction(`${id}:${actionName}`);
    try {
      const endpoint =
        actionName === "duplicate"
          ? `/api/admin/${kind}/${id}/duplicate`
          : actionName === "archive"
            ? `/api/admin/${kind}/${id}`
            : `/api/admin/${kind}/${id}/status`;
      const status = actionName === "publish" ? "published" : actionName;
      await api(endpoint, {
        method: actionName === "archive" ? "DELETE" : "POST",
        body: ["duplicate", "archive"].includes(actionName)
          ? undefined
          : JSON.stringify({ status }),
      });
      const entity = view === "products" ? "Product" : "Article";
      const messages: Record<Action, string> = {
        duplicate: `${view === "products" ? "Hidden product" : "Draft article"} copy created.`,
        archive: `${entity} archived.`,
        publish: view === "products" ? "Product is now visible in the Store." : "Article published.",
        draft: "Article moved to draft.",
        hidden: "Product hidden from the Store.",
      };
      announce(messages[actionName]);
      await load(kind, 1);
    } catch (error: any) {
      reportError(error.message || "Unable to update this record.");
    } finally {
      setPendingAction("");
    }
  };
  const resendDeliveryEmail = async (id: string) => {
    if (!window.confirm("Resend the delivery email for this paid order?")) return;
    setPendingAction(`${id}:resend-email`);
    try {
      await api(`/api/admin/orders/${id}/resend-email`, { method: "POST" });
      announce("Resend accepted by the email provider.");
      await load(view === "payments" ? "payments" : "orders", pagination.page);
    } catch (error: any) {
      reportError(error.message || "Unable to resend the delivery email.");
    } finally {
      setPendingAction("");
    }
  };
  const downloadReport = async (scope: "products" | "orders" | "payments" | "revenue" | "dashboard", format: "pdf" | "xlsx") => {
    const key = `${scope}:${format}`;
    if (downloadingReport) return;
    setDownloadingReport(key);
    try {
      const params = new URLSearchParams({ format });
      if (scope === "products") {
        if (query) params.set("q", query);
        if (statusFilter) params.set("status", statusFilter);
        if (categoryFilter) params.set("category", categoryFilter);
      }
      if (scope === "orders" || scope === "payments") {
        if (query) params.set("q", query);
        if (statusFilter) params.set("status", statusFilter);
      }
      if (scope === "payments" && paymentMethodFilter) params.set("method", paymentMethodFilter);
      if (scope === "revenue") {
        if (revenueFrom) params.set("from", revenueFrom);
        if (revenueTo) params.set("to", revenueTo);
        if (revenueProductIds.length) params.set("productIds", revenueProductIds.join(","));
        params.set("defaultOwnerShare", revenueFallbackShare || "100");
      }
      if (scope !== "revenue") {
        if (dateFrom) params.set("from", dateFrom);
        if (dateTo) params.set("to", dateTo);
      }
      const response = await fetch(`${API_BASE_URL}/api/admin/reports/${scope}?${params.toString()}`, { credentials: "include" });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Unable to generate the report." }));
        throw new Error(error.message || "Unable to generate the report.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const disposition = response.headers.get("content-disposition") || "";
      const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || `codersvoice-${scope}-report.${format}`;
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      announce(`${format.toUpperCase()} report downloaded.`);
    } catch (error: any) {
      reportError(error.message || "Unable to download the report.");
    } finally {
      setDownloadingReport("");
    }
  };
  const previewRetentionPurge = async () => {
    if (!retentionFrom || !retentionTo) {
      reportError("Choose both a start and end date before previewing a cleanup batch.");
      return;
    }
    setDataManagementLoading(true);
    setRetentionPreview(null);
    setRetentionConfirmation("");
    try {
      const response = await api<Item>("/api/admin/data-management/preview", {
        method: "POST",
        body: JSON.stringify({ target: retentionTarget, from: retentionFrom, to: retentionTo }),
      });
      setRetentionPreview(response);
      setRetentionBackupDownloaded(false);
      if (!response.count) announce("No eligible records exist in this date range.");
    } catch (error: any) {
      reportError(error.message || "Unable to preview this cleanup batch.");
    } finally {
      setDataManagementLoading(false);
    }
  };
  const purgeRetainedData = async () => {
    if (!retentionPreview || retentionPreview.requiresSmallerBatch || !retentionPreview.count) return;
    if (!retentionBackupDownloaded) {
      reportError("Download the selected cleanup batch as a backup before deleting it.");
      return;
    }
    if (!window.confirm(`Permanently delete ${retentionPreview.count} ${retentionPreview.label}? This cannot be undone.`)) return;
    setPurgingData(true);
    try {
      const response = await api<Item>("/api/admin/data-management/purge", {
        method: "POST",
        body: JSON.stringify({ target: retentionTarget, from: retentionFrom, to: retentionTo, confirmation: retentionConfirmation }),
      });
      announce(`${response.deletedCount} ${retentionPreview.label} permanently deleted.`);
      setRetentionPreview(null);
      setRetentionConfirmation("");
      setRetentionBackupDownloaded(false);
      await loadDataSummary();
    } catch (error: any) {
      reportError(error.message || "Unable to delete this batch.");
    } finally {
      setPurgingData(false);
    }
  };
  const downloadRetentionBackup = async (format: "ndjson" | "xlsx") => {
    if (!retentionPreview || !retentionPreview.count || retentionPreview.requiresSmallerBatch) return;
    const key = `retention:${format}`;
    setDownloadingRetentionBackup(key);
    try {
      const response = await apiFetch("/api/admin/data-management/export", {
        method: "POST",
        body: JSON.stringify({ target: retentionTarget, from: retentionFrom, to: retentionTo, format }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Unable to export the selected backup." }));
        throw new Error(error.message || "Unable to export the selected backup.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const disposition = response.headers.get("content-disposition") || "";
      anchor.href = url;
      anchor.download = disposition.match(/filename="?([^";]+)"?/i)?.[1] || `codersvoice-${retentionTarget}-backup.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setRetentionBackupDownloaded(true);
      announce(`${format === "ndjson" ? "NDJSON" : "Excel"} backup downloaded. You can now confirm deletion.`);
    } catch (error: any) {
      reportError(error.message || "Unable to export the selected backup.");
    } finally {
      setDownloadingRetentionBackup("");
    }
  };
  const field = (key: string, label: string, type = "text", required = false) => (
    <label className="block text-sm font-medium text-slate-300">
      {label}{required && <span className="ml-1 text-red-400">*</span>}
      <input
        type={type}
        required={required}
        value={editing?.[key] ?? ""}
        onChange={(event) =>
          setEditing({ ...editing!, [key]: event.target.value })
        }
        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-blue-500"
      />
    </label>
  );
  const insertArticleMarkup = (before: string, after = before, placeholder = "text") => {
    if (!editing) return;
    const editor = articleTextareaRef.current;
    const content = String(editing.content || "");
    const start = editor?.selectionStart ?? content.length;
    const end = editor?.selectionEnd ?? start;
    const selected = content.slice(start, end) || placeholder;
    const next = `${content.slice(0, start)}${before}${selected}${after}${content.slice(end)}`;
    setEditing({ ...editing, content: next });
    window.setTimeout(() => {
      if (!editor) return;
      const selectionStart = start + before.length;
      editor.focus();
      editor.setSelectionRange(selectionStart, selectionStart + selected.length);
    }, 0);
  };
  const insertArticleLink = () => {
    const href = window.prompt("Link URL (https://…)");
    if (!href) return;
    if (!/^https?:\/\//i.test(href)) {
      reportError("Use a full http(s) link URL.");
      return;
    }
    insertArticleMarkup(`<a href="${href.replace(/"/g, "&quot;")}">`, "</a>", "Link text");
  };
  const uploadImage = async (key: string, file?: File) => {
    if (!editing || uploadingField) return;
    const sourceUrl = String(editing[key] || "").trim();
    if (!file && !/^https?:\/\//i.test(sourceUrl)) {
      const message = "Paste a valid image URL before importing it to Cloudinary.";
      setEditorError(message);
      reportError(message);
      return;
    }
    setUploadingField(key);
    setEditorError("");
    try {
      const form = new FormData();
      form.append("kind", view === "blogs" ? "blogs" : "products");
      if (file) form.append("file", file);
      else form.append("sourceUrl", sourceUrl);
      const response = await api<{ item: { url: string } }>("/api/admin/uploads/images", {
        method: "POST",
        body: form,
      });
      setEditing({ ...editing, [key]: response.item.url });
      announce("Image saved to Cloudinary.");
    } catch (error: any) {
      const message = error.message || "Image upload failed.";
      setEditorError(message);
      reportError(message);
    } finally {
      setUploadingField("");
    }
  };
  const galleryItems = () => Array.isArray(editing?.galleryImages) ? editing!.galleryImages.filter(Boolean) : (listify(editing?.galleryImages || "") as string[]);
  const uploadGalleryImages = async (files: File[]) => {
    if (!editing || !files.length || uploadingField) return;
    const current = galleryItems();
    if (current.length + files.length > 5) {
      const message = `A gallery can contain up to 5 images. Remove an image or choose at most ${Math.max(0, 5 - current.length)} more.`;
      setEditorError(message);
      reportError(message);
      return;
    }
    setUploadingField("galleryImages");
    setEditorError("");
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const form = new FormData();
        form.append("kind", "products");
        form.append("file", file);
        const response = await api<{ item: { url: string } }>("/api/admin/uploads/images", { method: "POST", body: form });
        uploaded.push(response.item.url);
      }
      setEditing({ ...editing, galleryImages: [...current, ...uploaded].join(", ") });
      announce(`${uploaded.length} gallery image${uploaded.length === 1 ? "" : "s"} saved to Cloudinary.`);
    } catch (error: any) {
      const message = error.message || "Gallery upload failed.";
      setEditorError(message);
      reportError(message);
    } finally {
      setUploadingField("");
    }
  };
  const importGalleryUrls = async () => {
    if (!editing || uploadingField) return;
    const current = galleryItems();
    if (current.length > 5) {
      const message = "A gallery can contain up to 5 images.";
      setEditorError(message);
      reportError(message);
      return;
    }
    const remoteUrls = current.filter((url) => /^https?:\/\//i.test(url) && !/^https:\/\/res\.cloudinary\.com\//i.test(url));
    if (!remoteUrls.length) {
      reportError("Paste one or more external image URLs first.");
      return;
    }
    setUploadingField("galleryImages");
    setEditorError("");
    try {
      const stored = current.filter((url) => /^https:\/\/res\.cloudinary\.com\//i.test(url));
      for (const sourceUrl of remoteUrls) {
        const form = new FormData();
        form.append("kind", "products");
        form.append("sourceUrl", sourceUrl);
        const response = await api<{ item: { url: string } }>("/api/admin/uploads/images", { method: "POST", body: form });
        stored.push(response.item.url);
      }
      setEditing({ ...editing, galleryImages: stored.join(", ") });
      announce(`${remoteUrls.length} gallery image${remoteUrls.length === 1 ? "" : "s"} imported to Cloudinary.`);
    } catch (error: any) {
      const message = error.message || "Could not import the gallery image URLs.";
      setEditorError(message);
      reportError(message);
    } finally {
      setUploadingField("");
    }
  };
  const galleryField = () => {
    const images = galleryItems();
    return <div className="md:col-span-2 rounded-xl border border-slate-700 bg-slate-950/40 p-3">
      <label className="block text-sm font-medium text-slate-300">Gallery images <span className="text-slate-500">(up to 5)</span>
        <textarea value={editing?.galleryImages ?? ""} onChange={(event) => setEditing({ ...editing!, galleryImages: event.target.value })} placeholder="Paste image URLs separated by commas or new lines, then import them" className="mt-1.5 min-h-20 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-blue-500" />
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className={`cursor-pointer rounded-lg border border-slate-600 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-blue-400 hover:text-white ${uploadingField === "galleryImages" ? "pointer-events-none opacity-50" : ""}`}>
          {uploadingField === "galleryImages" ? "Uploading…" : "Upload images from computer"}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="sr-only" onChange={(event) => { const files = Array.from(event.target.files || []) as File[]; if (files.length) uploadGalleryImages(files); event.currentTarget.value = ""; }} />
        </label>
        <button type="button" disabled={uploadingField === "galleryImages"} onClick={importGalleryUrls} className="rounded-lg border border-blue-500/50 px-3 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10 disabled:opacity-50">Import pasted URLs to Cloudinary</button>
        <span className="text-xs text-slate-500">{images.length}/5 images</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">Use local uploads or pasted URLs. Each saved image is stored in Cloudinary and shown publicly only after the product is unhidden.</p>
      {images.length > 0 && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">{images.map((url, index) => <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-lg border border-slate-700"><img src={url} alt={`Gallery image ${index + 1}`} className="h-20 w-full object-cover" /><button type="button" onClick={() => setEditing({ ...editing!, galleryImages: images.filter((_: string, itemIndex: number) => itemIndex !== index).join(", ") })} className="absolute right-1 top-1 rounded bg-slate-950/85 px-1.5 py-1 text-xs text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Remove gallery image ${index + 1}`}>×</button></div>)}</div>}
    </div>;
  };
  const imageField = (key: string, label: string, required = false) => (
    <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
      <label className="block text-sm font-medium text-slate-300">
        {label}{required && <span className="ml-1 text-red-400">*</span>}
        <input
          required={required}
          type="url"
          value={editing?.[key] ?? ""}
          placeholder="Paste an image URL, then import it"
          onChange={(event) => setEditing({ ...editing!, [key]: event.target.value })}
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-blue-500"
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className={`cursor-pointer rounded-lg border border-slate-600 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-blue-400 hover:text-white ${uploadingField === key ? "pointer-events-none opacity-50" : ""}`}>
          {uploadingField === key ? "Uploading…" : "Upload from computer"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadImage(key, file);
              event.currentTarget.value = "";
            }}
          />
        </label>
        <button type="button" disabled={uploadingField === key} onClick={() => uploadImage(key)} className="rounded-lg border border-blue-500/50 px-3 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10 disabled:opacity-50">
          Import URL to Cloudinary
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">Choose a local image or import a pasted URL. The saved value is Cloudinary’s secure URL.</p>
      {editing?.[key] && <img src={editing[key]} alt="Image preview" className="mt-3 h-24 w-36 rounded-lg border border-slate-700 object-cover" />}
    </div>
  );

  if (!admin)
    return (
      <main className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-5">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl"
        >
          <p className="text-blue-400 font-bold text-sm">CODERSVOICE ADMIN</p>
          <h1 className="mt-2 text-3xl font-black">
            {needsSetup ? "Create first admin" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {needsSetup
              ? "Use the bootstrap email and password from the server environment."
              : "Sign in to manage your store and blog."}
          </p>
          {needsSetup && (
            <label className="mt-6 block text-sm">
              Name
              <input
                value={credentials.name}
                onChange={(event) =>
                  setCredentials({ ...credentials, name: event.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3"
              />
            </label>
          )}
          <label className="mt-5 block text-sm">
            Email
            <input
              required
              type="email"
              value={credentials.email}
              onChange={(event) =>
                setCredentials({ ...credentials, email: event.target.value })
              }
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3"
            />
          </label>
          <label className="mt-5 block text-sm">
            Password
            <div className="relative mt-1.5">
              <input
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(event) =>
                  setCredentials({ ...credentials, password: event.target.value })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>
                <Icon name={showPassword ? "eyeOff" : "eye"} />
              </button>
            </div>
          </label>
          <button disabled={authLoading} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
            {authLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {authLoading ? (needsSetup ? "Creating admin…" : "Signing in…") : (needsSetup ? "Create admin" : "Sign in")}
          </button>
        </form>
      </main>
    );

  const recordView = view === "products" || view === "blogs";
  const dashboardTrend = Array.isArray(stats.salesTrend) ? stats.salesTrend : [];
  const dashboardRecentOrders = Array.isArray(stats.recentOrders) ? stats.recentOrders : [];
  const maxTrendRevenue = Math.max(1, ...dashboardTrend.map((day: Item) => Number(day.revenue || 0)));
  const delivery = stats.fulfillment || {};
  const deliveryTotal = Number(delivery.delivered || 0) + Number(delivery.failed || 0) + Number(delivery.processing || 0) + Number(delivery.pending || 0);
  const deliveryRate = deliveryTotal ? Math.round((Number(delivery.delivered || 0) / deliveryTotal) * 100) : 0;
  const dashboardCards = [
    { label: "Paid revenue", value: formatINR(stats.revenue), note: "Confirmed payments", icon: "receipt", tone: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20" },
    { label: "Paid orders", value: String(stats.paidOrders || 0), note: `${stats.orders || 0} total orders`, icon: "check", tone: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20" },
    { label: "Delivery health", value: `${deliveryRate}%`, note: `${delivery.failed || 0} delivery issue${Number(delivery.failed || 0) === 1 ? "" : "s"}`, icon: "clock", tone: "text-amber-300 bg-amber-400/10 border-amber-400/20" },
    { label: "Visible products", value: String(stats.productVisibility?.published || 0), note: `${stats.productVisibility?.hidden || 0} hidden in admin`, icon: "box", tone: "text-blue-300 bg-blue-400/10 border-blue-400/20" },
  ];
  const activeRetentionSummary = dataSummary.find((item) => item.target === retentionTarget);
  const retentionCutoffDate = activeRetentionSummary?.retentionBoundary ? new Date(activeRetentionSummary.retentionBoundary).toISOString().slice(0, 10) : undefined;
  const revenueSummary = revenue?.summary || {};
  const revenueTrend = Array.isArray(revenue?.trend) ? revenue.trend : [];
  const maxRevenueTrend = Math.max(1, ...revenueTrend.map((point: Item) => Number(point.ownerRevenue || 0)));
  const selectedRevenueProducts = new Set(revenueProductIds);
  const filteredRevenueProducts = revenueProducts.filter((product) => {
    const search = revenueProductSearch.trim().toLowerCase();
    return !search || `${product.name} ${product.slug || ""}`.toLowerCase().includes(search);
  });
  const selectedRevenueProductItems = revenueProducts.filter((product) => selectedRevenueProducts.has(product.id));
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 md:flex">
      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-5 md:flex md:flex-col">
        <div>
          <p className="text-2xl font-black">
            Coders<span className="text-blue-400">Voice</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Store administration</p>
        </div>
        <nav className="mt-9 space-y-1">
          {nav.map((entry) => (
            <button
              key={entry.id}
              onClick={() => changeView(entry.id as View)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${view === entry.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
            >
              <Icon name={entry.icon} size={17} />
              {entry.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-cyan-300 transition hover:bg-cyan-400/10 hover:text-cyan-100"
          >
            <Icon name="eye" size={17} />
            View store
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            <Icon name="logout" size={17} />
            Sign out
          </button>
        </div>
      </aside>
      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#020617]/95 px-5 py-4 backdrop-blur md:px-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">
                Signed in as {admin.email}
              </p>
              <h1 className="mt-1 text-2xl font-black capitalize">
                {view === "audit" ? "Audit logs" : view === "payments" ? "Payment activity" : view === "revenue" ? "Revenue analytics" : view === "data" ? "Data management" : view}
              </h1>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {(["dashboard", "products", "orders", "payments", "revenue"] as View[]).includes(view) && (
                <>
                  <button type="button" disabled={Boolean(downloadingReport)} onClick={() => downloadReport(view as "dashboard" | "products" | "orders" | "payments" | "revenue", "pdf")} className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-red-400 hover:text-white disabled:opacity-50">{downloadingReport === `${view}:pdf` ? "Preparing…" : "Export PDF"}</button>
                  <button type="button" disabled={Boolean(downloadingReport)} onClick={() => downloadReport(view as "dashboard" | "products" | "orders" | "payments" | "revenue", "xlsx")} className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-emerald-400 hover:text-white disabled:opacity-50">{downloadingReport === `${view}:xlsx` ? "Preparing…" : "Export Excel"}</button>
                </>
              )}
              {recordView && (
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold shadow-lg shadow-blue-900/30 hover:bg-blue-500"
                >
                  <Icon name="plus" size={17} />
                  New {view === "products" ? "product" : "article"}
                </button>
              )}
            </div>
          </div>
          <select
            value={view}
            onChange={(event) => changeView(event.target.value as View)}
            className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm md:hidden"
          >
            {nav.map((entry) => (
              <option value={entry.id} key={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </header>
        <div className="p-5 md:p-9">
          {view === "dashboard" && (
            <div className="space-y-6">
              <section className="overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-6 md:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Store command centre</p>
                    <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Everything important, at a glance.</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Track revenue, product visibility, payment delivery and recent customer orders from one place.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => changeView("products")} className="rounded-xl border border-blue-300/25 bg-slate-950/50 px-4 py-2.5 text-sm font-bold text-blue-200 transition hover:bg-blue-500 hover:text-white">Manage products</button>
                    <button type="button" onClick={() => changeView("orders")} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500">Review orders</button>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashboardCards.map((card) => (
                  <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/20">
                    <div className="flex items-start justify-between gap-4">
                      <div><p className="text-sm font-medium text-slate-400">{card.label}</p><p className="mt-3 text-2xl font-black text-white md:text-3xl">{card.value}</p></div>
                      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${card.tone}`}><Icon name={card.icon} size={18} /></span>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">{card.note}</p>
                  </div>
                ))}
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4"><div><h2 className="font-bold text-white">Paid revenue</h2><p className="mt-1 text-sm text-slate-500">Last 7 days</p></div><p className="text-right text-lg font-black text-cyan-300">{formatINR(dashboardTrend.reduce((sum: number, day: Item) => sum + Number(day.revenue || 0), 0))}</p></div>
                  <div className="mt-8 flex h-48 items-end gap-2 sm:gap-4">
                    {dashboardTrend.map((day: Item) => <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col justify-end"><div className="group relative rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 transition hover:from-blue-500 hover:to-cyan-300" style={{ height: `${Math.max(5, Math.round((Number(day.revenue || 0) / maxTrendRevenue) * 100))}%` }} title={`${day.label}: ${formatINR(day.revenue)}`}><span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-950 px-2 py-1 text-[10px] font-bold text-white shadow-lg group-hover:block">{formatINR(day.revenue)}</span></div><p className="mt-3 text-center text-xs text-slate-500">{day.label}</p></div>)}
                    {!dashboardTrend.length && <p className="m-auto text-sm text-slate-500">No paid sales recorded in the last 7 days.</p>}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6">
                  <div className="flex items-start justify-between"><div><h2 className="font-bold text-white">Fulfilment health</h2><p className="mt-1 text-sm text-slate-500">Delivery email status</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${Number(delivery.failed || 0) ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"}`}>{Number(delivery.failed || 0) ? "Needs attention" : "Healthy"}</span></div>
                  <div className="mt-7"><div className="flex items-end justify-between"><p className="text-4xl font-black text-white">{deliveryRate}%</p><p className="text-xs text-slate-500">delivered</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${deliveryRate}%` }} /></div></div>
                  <div className="mt-7 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-950/70 p-3"><p className="text-slate-500">Delivered</p><p className="mt-1 font-bold text-emerald-300">{delivery.delivered || 0}</p></div><div className="rounded-xl bg-slate-950/70 p-3"><p className="text-slate-500">Failed</p><p className="mt-1 font-bold text-red-300">{delivery.failed || 0}</p></div><div className="rounded-xl bg-slate-950/70 p-3"><p className="text-slate-500">Pending</p><p className="mt-1 font-bold text-amber-300">{delivery.pending || 0}</p></div><div className="rounded-xl bg-slate-950/70 p-3"><p className="text-slate-500">Processing</p><p className="mt-1 font-bold text-blue-300">{delivery.processing || 0}</p></div></div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"><div className="flex items-center justify-between border-b border-slate-800 px-5 py-4"><div><h2 className="font-bold text-white">Recent orders</h2><p className="mt-1 text-sm text-slate-500">Latest checkout activity</p></div><button type="button" onClick={() => changeView("orders")} className="text-sm font-bold text-blue-300 hover:text-blue-200">View all</button></div><div className="divide-y divide-slate-800">{dashboardRecentOrders.map((order: Item) => <div key={order._id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-semibold text-slate-100">{order.productName}</p><p className="mt-1 truncate text-xs text-slate-500">{order.email}</p></div><div className="flex items-center justify-between gap-4 sm:justify-end"><p className="font-bold text-slate-100">{formatINR(order.amount)}</p><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${order.status === "paid" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"}`}>{order.status}</span></div></div>)}{!dashboardRecentOrders.length && <p className="p-8 text-center text-sm text-slate-500">No orders have been recorded yet.</p>}</div></div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="font-bold text-white">Store content</h2><p className="mt-1 text-sm text-slate-500">Public catalogue readiness</p><div className="mt-6 space-y-4"><div><div className="flex justify-between text-sm"><span className="text-slate-400">Products</span><span className="font-bold text-white">{stats.products || 0}</span></div><div className="mt-2 h-2 rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${stats.products ? Math.round(((stats.productVisibility?.published || 0) / stats.products) * 100) : 0}%` }} /></div><p className="mt-2 text-xs text-slate-500">{stats.productVisibility?.published || 0} visible, {stats.productVisibility?.hidden || 0} hidden</p></div><div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><p className="text-sm text-slate-400">Blog articles</p><p className="mt-2 text-2xl font-black text-white">{stats.blogs || 0}</p><button type="button" onClick={() => changeView("blogs")} className="mt-3 text-sm font-bold text-blue-300 hover:text-blue-200">Manage blog</button></div></div></div>
              </section>
            </div>
          )}
          {tableView && (
            <>
              <div className="mb-5 grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 lg:grid-cols-6">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-3 text-slate-500">
                    <Icon name="search" size={17} />
                  </span>
                  <input
                    value={query}
                    onChange={(event) => setTableFilter(setQuery, event.target.value)}
                    placeholder={view === "audit" ? "Search action, summary, record ID…" : `Search ${view}…`}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                {view !== "audit" && <select
                  value={statusFilter}
                  onChange={(event) => setTableFilter(setStatusFilter, event.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm"
                >
                  <option value="">All statuses</option>
                  {(["products", "blogs"] as View[]).includes(view) && <><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></>}
                  {view === "products" && <option value="hidden">Hidden</option>}
                  {(["orders", "payments"] as View[]).includes(view) && <><option value="created">Created</option><option value="paid">Paid</option><option value="failed">Failed</option></>}
                </select>}
                {(view === "products" || view === "blogs") && <input value={categoryFilter} onChange={(event) => setTableFilter(setCategoryFilter, event.target.value)} placeholder="Exact category" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />}
                {view === "audit" && <input value={auditActionFilter} onChange={(event) => setTableFilter(setAuditActionFilter, event.target.value)} placeholder="Exact action, e.g. PRODUCT_UPDATED" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-blue-500 lg:col-span-2" />}
                {view === "payments" && <select value={paymentMethodFilter} onChange={(event) => setTableFilter(setPaymentMethodFilter, event.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm"><option value="">All payment modes</option><option value="upi">UPI</option><option value="card">Card</option><option value="netbanking">Net banking</option><option value="wallet">Wallet</option><option value="emi">EMI</option></select>}
                {view === "payments" && <select value={sortFilter} onChange={(event) => setTableFilter(setSortFilter, event.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm"><option value="newest">Newest payment</option><option value="oldest">Oldest payment</option><option value="amount-high">Amount: high to low</option><option value="amount-low">Amount: low to high</option></select>}
                <input aria-label="From date" type="date" value={dateFrom} onChange={(event) => setTableFilter(setDateFrom, event.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm" />
                <input aria-label="To date" type="date" value={dateTo} onChange={(event) => setTableFilter(setDateTo, event.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm" />
                <button type="button" onClick={resetTableFilters} className="rounded-xl px-3 py-2.5 text-sm font-bold text-blue-300 hover:bg-blue-500/10">Clear</button>
              </div>
            </>
          )}
          {loading && tableView && <div role="status" className="mb-4 inline-flex items-center gap-2 text-sm text-blue-300"><span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300/30 border-t-blue-300" />Loading {view}…</div>}
          {pendingAction && <div role="status" className="mb-4 inline-flex items-center gap-2 text-sm text-amber-300"><span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300/30 border-t-amber-300" />Updating record…</div>}
          {recordView && (
            <>
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
                <table className="min-w-[850px] w-full text-left text-sm">
                  <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="p-4">
                        {view === "products" ? "Product" : "Article"}
                      </th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Updated</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-slate-800/80 last:border-0"
                      >
                        <td className="p-4">
                          <p className="font-semibold text-slate-100">
                            {item.name || item.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.slug}
                          </p>
                        </td>
                        <td className="p-4 text-slate-300">
                          {item.category || "—"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${item.status === "published" ? "bg-emerald-500/15 text-emerald-300" : item.status === "hidden" || item.status === "archived" ? "bg-slate-700 text-slate-300" : "bg-amber-400/15 text-amber-300"}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <IconButton
                              label="Edit"
                              icon="edit"
                              disabled={Boolean(pendingAction)}
                              onClick={() => openEdit(item)}
                            />
                            <IconButton
                              label={view === "products" ? "Duplicate as hidden" : "Duplicate as draft"}
                              icon="copy"
                              disabled={Boolean(pendingAction)}
                              onClick={() => action(item._id, "duplicate")}
                            />
                            {view === "blogs" && (
                              <IconButton
                                label={item.status === "published" ? "Unpublish to draft" : "Publish"}
                                icon={item.status === "published" ? "eyeOff" : "eye"}
                                tone="active"
                                disabled={Boolean(pendingAction)}
                                onClick={() => action(item._id, item.status === "published" ? "draft" : "publish")}
                              />
                            )}
                            {view === "products" && (
                              <IconButton
                                label={
                                  item.status === "hidden" || item.status === "draft"
                                    ? "Unhide to Store"
                                    : "Hide completely"
                                }
                                icon={item.status === "hidden" || item.status === "draft" ? "eye" : "eyeOff"}
                                tone="active"
                                disabled={Boolean(pendingAction)}
                                onClick={() =>
                                  action(
                                    item._id,
                                    item.status === "hidden" || item.status === "draft"
                                      ? "publish"
                                      : "hidden",
                                  )
                                }
                              />
                            )}
                            <IconButton
                              label="Archive"
                              icon="trash"
                              tone="danger"
                              disabled={Boolean(pendingAction)}
                              onClick={() => action(item._id, "archive")}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && items.length === 0 && (
                  <p className="p-10 text-center text-slate-400">
                    No records match these filters.
                  </p>
                )}
              </div>
            </>
          )}
          {view === "orders" && (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Delivery</th>
                    <th className="p-4">Created</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-b border-slate-800/80">
                      <td className="p-4 font-medium">{item.productName}</td>
                      <td className="p-4 text-slate-400"><p>{item.customerName || "—"}</p><p className="mt-1 text-xs text-slate-500">{item.email}{item.phone ? ` · ${item.phone}` : ""}</p></td>
                      <td className="p-4">{item.paymentMethod === "free" ? <span className="font-bold text-emerald-300">Free gift</span> : `₹${item.amount}`}</td>
                      <td className="p-4 capitalize">{item.status}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${item.fulfillmentStatus === "delivered" ? "bg-emerald-500/15 text-emerald-300" : item.fulfillmentStatus === "failed" ? "bg-red-500/15 text-red-300" : "bg-amber-400/15 text-amber-300"}`}>{item.fulfillmentStatus || "not tracked"}</span>
                        {item.fulfillmentError && <p className="mt-1 max-w-52 truncate text-xs text-red-300" title={item.fulfillmentError}>{item.fulfillmentError}</p>}
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        {item.status === "paid" && <button type="button" disabled={Boolean(pendingAction)} onClick={() => resendDeliveryEmail(item._id)} className="rounded-lg border border-blue-500/35 px-3 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-40">Resend email</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && items.length === 0 && <p className="p-10 text-center text-slate-400">No orders match these filters.</p>}
            </div>
          )}
          {view === "payments" && (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
              <table className="min-w-[1320px] w-full text-left text-sm">
                <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Product / customer</th>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Gateway order</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Payment mode</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Captured at</th>
                    <th className="p-4">Delivery</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-b border-slate-800/80 last:border-0">
                      <td className="p-4"><p className="font-semibold text-slate-100">{item.productName}</p><p className="mt-1 text-xs text-slate-400">{item.customerName ? `${item.customerName} · ` : ""}{item.email}{item.phone ? ` · ${item.phone}` : ""}</p></td>
                      <td className="p-4 font-mono text-xs text-cyan-200">{item.paymentMethod === "free" ? "Gift claim" : (item.razorpayPaymentId || "Not captured")}</td>
                      <td className="p-4 font-mono text-xs text-slate-400">{item.razorpayOrderId || "—"}</td>
                      <td className="p-4 font-bold text-slate-100">{formatINR(item.amount)}</td>
                      <td className="p-4 capitalize text-slate-300">{item.paymentMethod || "Not captured"}</td>
                      <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${item.status === "paid" ? "bg-emerald-500/15 text-emerald-300" : item.status === "failed" ? "bg-red-500/15 text-red-300" : "bg-amber-400/15 text-amber-300"}`}>{item.status}</span></td>
                      <td className="p-4 text-slate-400">{new Date(item.paymentCapturedAt || item.createdAt).toLocaleString()}</td>
                      <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${item.fulfillmentStatus === "delivered" ? "bg-emerald-500/15 text-emerald-300" : item.fulfillmentStatus === "failed" ? "bg-red-500/15 text-red-300" : "bg-amber-400/15 text-amber-300"}`}>{item.fulfillmentStatus || "pending"}</span></td>
                      <td className="p-4 text-right">{item.status === "paid" && <button type="button" disabled={Boolean(pendingAction)} onClick={() => resendDeliveryEmail(item._id)} className="rounded-lg border border-blue-500/35 px-3 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-40">Resend email</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && items.length === 0 && <p className="p-10 text-center text-slate-400">No payment records match these filters.</p>}
              <p className="border-t border-slate-800 px-4 py-3 text-xs text-slate-500">Payment mode is captured for new verified payments. Existing transactions may show “Not captured” because Razorpay did not provide that historical data to this application.</p>
            </div>
          )}
          {view === "audit" && (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                >
                  <p className="font-semibold">{item.action}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {!loading && items.length === 0 && <p className="rounded-xl border border-slate-800 bg-slate-900/50 p-10 text-center text-slate-400">No audit records match these filters.</p>}
            </div>
          )}
          {view === "revenue" && (
            <div className="space-y-6">
              <section className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-slate-900 p-6 md:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Paid-order intelligence</p>
                <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Revenue, ownership split, and partner payout tracking.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Only verified, paid orders are calculated. Each new order stores its product revenue-share percentage at checkout, so later product edits do not rewrite history.</p>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end"><div><h2 className="font-bold text-white">Reporting controls</h2><p className="mt-1 text-sm text-slate-500">Choose all products or select one or more products, then calculate an exact period.</p></div><div className="flex flex-wrap gap-2">{[7, 30, 60, 90].map((days) => <button key={days} type="button" onClick={() => applyRevenuePreset(days)} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${revenuePreset === days ? "border-cyan-300 bg-cyan-400/15 text-cyan-100" : "border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-200"}`}>{days} days</button>)}</div></div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <label className="text-sm font-medium text-slate-300">From date<input type="date" value={revenueFrom} max={revenueTo || undefined} onChange={(event) => { setRevenuePreset(null); setRevenueFrom(event.target.value); }} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label>
                  <label className="text-sm font-medium text-slate-300">To date<input type="date" value={revenueTo} min={revenueFrom || undefined} max={dateDaysAgo(0)} onChange={(event) => { setRevenuePreset(null); setRevenueTo(event.target.value); }} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label>
                  <label className="text-sm font-medium text-slate-300">Fallback: your share %<input type="number" min="0" max="100" step="0.01" value={revenueFallbackShare} onChange={(event) => setRevenueFallbackShare(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /><span className="mt-1 block text-xs font-normal text-slate-500">Used only for old orders with no saved product split.</span></label>
                  <div className="flex items-end"><button type="button" disabled={revenueLoading} onClick={() => loadRevenue()} className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50">{revenueLoading ? "Calculating…" : "Calculate live revenue"}</button></div>
                </div>
                <div className="relative mt-5">
                  <p className="text-sm font-medium text-slate-300">Products <span className="font-normal text-slate-500">(all products is selected by default)</span></p>
                  <button type="button" aria-expanded={revenueProductPickerOpen} onClick={() => setRevenueProductPickerOpen((open) => !open)} className="mt-1.5 flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-left text-sm transition hover:border-cyan-400 focus:border-cyan-400 focus:outline-none"><span className={revenueProductIds.length ? "text-white" : "text-slate-300"}>{revenueProductIds.length ? `${revenueProductIds.length} product${revenueProductIds.length === 1 ? "" : "s"} selected` : "All products"}</span><span className="text-lg leading-none text-slate-400">{revenueProductPickerOpen ? "⌃" : "⌄"}</span></button>
                  {revenueProductPickerOpen && <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950/80"><div className="border-b border-slate-800 p-3"><div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3"><Icon name="search" size={15} /><input autoFocus value={revenueProductSearch} onChange={(event) => setRevenueProductSearch(event.target.value)} placeholder="Search products…" className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-500" /></div></div><div className="max-h-64 overflow-y-auto p-2"><button type="button" onClick={() => { setRevenueProductIds([]); setRevenueProductSearch(""); setRevenueProductPickerOpen(false); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${revenueProductIds.length === 0 ? "bg-cyan-400/15 text-cyan-200" : "text-slate-200 hover:bg-slate-900"}`}><span className="font-bold">All products</span><span className="text-xs">{revenueProductIds.length === 0 ? "Selected" : "Show every product"}</span></button>{filteredRevenueProducts.map((product) => { const selected = selectedRevenueProducts.has(product.id); return <button key={product.id} type="button" onClick={() => setRevenueProductIds((ids) => selected ? ids.filter((id) => id !== product.id) : [...ids, product.id])} className={`mt-1 flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${selected ? "bg-blue-600/25 text-blue-100" : "text-slate-200 hover:bg-slate-900"}`}><span className="min-w-0"><span className="block truncate font-semibold">{product.name}</span><span className="mt-0.5 block text-xs text-slate-500">Your share {Number(product.ownerSharePercent ?? 100)}%{product.status !== "published" ? ` · ${product.status}` : ""}</span></span><span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${selected ? "border-blue-300/30 bg-blue-400/20 text-blue-100" : "border-slate-700 text-slate-500"}`}>{selected ? "Selected" : "Select"}</span></button>; })}{!filteredRevenueProducts.length && <p className="px-3 py-6 text-center text-sm text-slate-500">No products match this search.</p>}</div></div>}
                  <div className="mt-3 flex flex-wrap gap-2">{revenueProductIds.length === 0 ? <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-200">All products</span> : selectedRevenueProductItems.map((product) => <span key={product.id} className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-100"><span className="truncate">{product.name}</span><button type="button" onClick={() => setRevenueProductIds((ids) => ids.filter((id) => id !== product.id))} className="rounded-full text-blue-200 transition hover:text-white" aria-label={`Remove ${product.name}`} title={`Remove ${product.name}`}><Icon name="close" size={13} /></button></span>)}</div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={() => { setRevenueProductIds([]); setRevenueProductSearch(""); }} className="text-sm font-bold text-blue-300 hover:text-blue-200">Select all products</button><button type="button" onClick={() => changeView("products")} className="text-sm font-bold text-blue-300 hover:text-blue-200">Set per-product revenue share →</button></div>
              </section>

              {revenue && <>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[{ label: "Gross revenue", value: formatINR(revenueSummary.grossRevenue), tone: "text-cyan-300" }, { label: "Your revenue", value: formatINR(revenueSummary.ownerRevenue), tone: "text-emerald-300" }, { label: "Partner payout", value: formatINR(revenueSummary.partnerRevenue), tone: "text-amber-300" }, { label: "Paid orders", value: String(revenueSummary.paidOrders || 0), tone: "text-blue-300" }].map((card) => <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><p className="text-sm text-slate-400">{card.label}</p><p className={`mt-3 text-2xl font-black ${card.tone}`}>{card.value}</p></div>)}
                </section>
                <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold text-white">Your revenue trend</h2><p className="mt-1 text-sm text-slate-500">Daily paid revenue after partner share.</p></div><p className="text-right text-sm font-bold text-cyan-300">Avg order {formatINR(revenueSummary.averageOrderValue)}</p></div><div className="mt-8 flex h-52 items-end gap-2 sm:gap-3">{revenueTrend.slice(-30).map((point: Item) => <div key={point.date} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"><div className="rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-300 transition hover:from-blue-500 hover:to-cyan-200" style={{ height: `${Math.max(4, Math.round((Number(point.ownerRevenue || 0) / maxRevenueTrend) * 100))}%` }} title={`${point.date}: ${formatINR(point.ownerRevenue)}`} /><span className="mt-2 truncate text-center text-[10px] text-slate-500">{String(point.date).slice(5)}</span></div>)}{!revenueTrend.length && <p className="m-auto text-sm text-slate-500">No paid revenue matches these filters.</p>}</div></div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="font-bold text-white">Calculation notes</h2><dl className="mt-5 space-y-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-400">Your effective margin</dt><dd className="font-black text-emerald-300">{Number(revenueSummary.ownerMarginPercent || 0).toFixed(2)}%</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-400">Products selected</dt><dd className="font-bold text-white">{selectedRevenueProducts.size || "All"}</dd></div><div className="border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">A product’s “Your revenue share %” is the share retained by CodersVoice. The remainder is partner revenue. New sales keep a permanent sale-time snapshot; legacy sales use the current product share or the fallback above.</div></dl></div>
                </section>
                <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"><div className="flex items-center justify-between border-b border-slate-800 px-5 py-4"><div><h2 className="font-bold text-white">Revenue by product</h2><p className="mt-1 text-sm text-slate-500">Sorted by gross paid revenue.</p></div>{revenue.truncated && <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300">First 5,000 paid orders</span>}</div><div className="overflow-x-auto"><table className="min-w-[780px] w-full text-left text-sm"><thead className="border-b border-slate-800 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Product</th><th className="px-4 py-3">Paid orders</th><th className="px-4 py-3">Gross</th><th className="px-4 py-3">Your share</th><th className="px-4 py-3">Your revenue</th><th className="px-4 py-3">Partner payout</th></tr></thead><tbody className="divide-y divide-slate-800">{(revenue.products || []).map((item: Item) => <tr key={item.productId}><td className="px-5 py-4 font-semibold text-white"><p>{item.productName}</p><p className="mt-1 text-xs font-normal text-slate-500">{item.shareSource}</p></td><td className="px-4 py-4 text-slate-300">{item.orders}</td><td className="px-4 py-4 text-cyan-200">{formatINR(item.grossRevenue)}</td><td className="px-4 py-4 text-slate-300">{Number(item.ownerSharePercent)}%</td><td className="px-4 py-4 font-bold text-emerald-300">{formatINR(item.ownerRevenue)}</td><td className="px-4 py-4 text-amber-300">{formatINR(item.partnerRevenue)}</td></tr>)}{!(revenue.products || []).length && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">No paid product revenue in this period.</td></tr>}</tbody></table></div></section>
              </>}
            </div>
          )}
          {view === "data" && (
            <div className="max-w-5xl space-y-6">
              <section className="overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-400/10 via-slate-900 to-slate-900 p-6 md:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Retention workspace</p>
                <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Keep operational data lean without risking the store.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Only audit logs and orders can be removed here. Products, blog articles, settings, and payment configuration cannot be deleted from this workspace. Always export your monthly report before cleanup.</p>
              </section>
              {databaseStorage && <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{databaseStorage.source === "atlas-api" ? "Atlas capacity tracking · automatic" : "Application database footprint"}</p><h2 className="mt-2 text-xl font-black text-white">{databaseStorage.available ? (databaseStorage.source === "atlas-api" ? `${Number(databaseStorage.freeMb || 0).toLocaleString()} MB estimated free` : `${Number(databaseStorage.calculatedUsedMb || 0).toLocaleString()} MB used by app data`) : "Storage estimate unavailable"}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{databaseStorage.message}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${Number(databaseStorage.percentUsed || 0) >= 90 ? "bg-red-500/15 text-red-300" : Number(databaseStorage.percentUsed || 0) >= 75 ? "bg-amber-400/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"}`}>{databaseStorage.available ? (databaseStorage.source === "atlas-api" ? `${Number(databaseStorage.percentUsed || 0).toFixed(2)}% Atlas used` : `${Number(databaseStorage.percentUsed || 0).toFixed(2)}% app footprint`) : "Check Atlas"}</span></div>{databaseStorage.available && <><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full transition-all ${Number(databaseStorage.percentUsed || 0) >= 90 ? "bg-red-500" : Number(databaseStorage.percentUsed || 0) >= 75 ? "bg-amber-400" : "bg-cyan-400"}`} style={{ width: `${Math.min(100, Math.max(0, Number(databaseStorage.percentUsed || 0)))}%` }} /></div><div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500"><span>{databaseStorage.source === "atlas-api" ? "Atlas used" : "App footprint"}: {Number(databaseStorage.usedMb || 0).toLocaleString()} MB</span><span>Collection allocation: {Number(databaseStorage.collectionAllocationMb || 0).toLocaleString()} MB</span><span>Indexes: {Number(databaseStorage.indexMb || 0).toLocaleString()} MB</span><span>Configured limit: {Number(databaseStorage.configuredLimitMb || 512).toLocaleString()} MB</span></div>{databaseStorage.source === "atlas-api" && databaseStorage.observedAt && <p className="mt-3 text-xs leading-5 text-emerald-200/85">Latest Atlas sample: {new Date(databaseStorage.observedAt).toLocaleString()}.</p>}{databaseStorage.source === "database-stats" && <p className="mt-3 text-xs leading-5 text-amber-200/85">Your Atlas service account is connected. This free/shared cluster does not expose sampled capacity values through the Atlas API, so this card intentionally shows only app data. No manual values are required.</p>}</>}</section>}
              <section className="grid gap-4 md:grid-cols-2">
                {dataSummary.map((item) => <div key={item.target} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold capitalize text-slate-200">{item.label}</p><p className="mt-2 text-3xl font-black text-white">{Number(item.total || 0).toLocaleString()}</p><p className="mt-1 text-xs text-slate-500">Total records</p></div><span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300">Retain latest {item.retentionDays} days</span></div><div className="mt-5 rounded-xl bg-slate-950/70 p-3"><p className="text-xs text-slate-500">Eligible by retention rule</p><p className="mt-1 font-bold text-slate-200">{Number(item.eligible || 0).toLocaleString()} records older than {new Date(item.retentionBoundary).toLocaleDateString()}</p></div></div>)}
                {!dataManagementLoading && !dataSummary.length && <p className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-sm text-slate-400">No data-retention summary is available yet.</p>}
              </section>
              <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6">
                <div className="flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-bold text-white">Preview a cleanup batch</h2><p className="mt-1 text-sm text-slate-500">The server enforces retention again when the batch is deleted, even if dates are changed in the browser.</p></div><button type="button" onClick={() => changeView(retentionTarget === "orders" ? "orders" : "audit")} className="text-sm font-bold text-blue-300 hover:text-blue-200">Review records first</button></div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <label className="text-sm font-medium text-slate-300">Data category<select value={retentionTarget} onChange={(event) => { setRetentionTarget(event.target.value); setRetentionPreview(null); setRetentionConfirmation(""); setRetentionBackupDownloaded(false); }} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white"><option value="audit_logs">Audit logs — retain last 7 days</option><option value="orders">Orders — retain last 30 days</option></select></label>
                  <label className="text-sm font-medium text-slate-300">Batch start<input type="date" value={retentionFrom} max={retentionCutoffDate} onChange={(event) => { setRetentionFrom(event.target.value); setRetentionPreview(null); setRetentionConfirmation(""); setRetentionBackupDownloaded(false); }} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label>
                  <label className="text-sm font-medium text-slate-300">Batch end<input type="date" value={retentionTo} max={retentionCutoffDate} onChange={(event) => { setRetentionTo(event.target.value); setRetentionPreview(null); setRetentionConfirmation(""); setRetentionBackupDownloaded(false); }} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" disabled={dataManagementLoading || purgingData} onClick={previewRetentionPurge} className="rounded-xl border border-blue-500/50 px-4 py-2.5 text-sm font-bold text-blue-300 transition hover:bg-blue-500/10 disabled:opacity-50">{dataManagementLoading ? "Checking…" : "Preview eligible records"}</button><p className="text-xs text-slate-500">Maximum deletion batch: 10,000 records. Use smaller date ranges for larger history.</p></div>
                {retentionPreview && <div className={`mt-6 rounded-2xl border p-5 ${retentionPreview.requiresSmallerBatch ? "border-amber-400/30 bg-amber-400/10" : "border-red-500/30 bg-red-500/10"}`}><h3 className="font-bold text-white">Deletion preview</h3><p className="mt-2 text-sm text-slate-300"><b>{Number(retentionPreview.count || 0).toLocaleString()}</b> {retentionPreview.label} are eligible. The server will retain every record from the most recent {retentionPreview.retentionDays} days, regardless of the selected end date.</p><p className="mt-2 text-xs text-slate-400">Effective final date: {new Date(retentionPreview.effectiveTo).toLocaleDateString()} · Retention boundary: {new Date(retentionPreview.retentionBoundary).toLocaleDateString()}</p>{retentionPreview.requiresSmallerBatch ? <p className="mt-4 text-sm font-semibold text-amber-200">This is larger than the 10,000-record safety limit. Narrow the date range and preview again.</p> : retentionPreview.count > 0 ? <div className="mt-5 space-y-5"><div className={`rounded-xl border p-4 ${retentionBackupDownloaded ? "border-emerald-400/25 bg-emerald-400/10" : "border-amber-400/25 bg-amber-400/10"}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-bold text-white">Step 1 — Download this cleanup batch first</p><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-300">Export the exact server-validated records before deleting them. NDJSON is analysis-friendly for MongoDB tools or ChatGPT; Excel is easier to review manually. Both contain customer and transaction data—store them securely and only upload data where you have permission.</p></div>{retentionBackupDownloaded && <span className="shrink-0 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-bold text-emerald-200">Backup downloaded</span>}</div><div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={Boolean(downloadingRetentionBackup)} onClick={() => downloadRetentionBackup("ndjson")} className="rounded-lg border border-cyan-400/40 px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-400/10 disabled:opacity-50">{downloadingRetentionBackup === "retention:ndjson" ? "Preparing…" : "Download NDJSON backup"}</button><button type="button" disabled={Boolean(downloadingRetentionBackup)} onClick={() => downloadRetentionBackup("xlsx")} className="rounded-lg border border-emerald-400/40 px-3 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-400/10 disabled:opacity-50">{downloadingRetentionBackup === "retention:xlsx" ? "Preparing…" : "Download Excel backup"}</button></div></div><label className="block text-sm font-medium text-slate-200">Step 2 — Type <code className="rounded bg-slate-950 px-1.5 py-1 text-red-200">{retentionPreview.confirmationText}</code> to enable deletion<input value={retentionConfirmation} onChange={(event) => setRetentionConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-red-500/30 bg-slate-950 px-3 py-2.5 font-mono text-sm text-white" /></label><button type="button" disabled={purgingData || !retentionBackupDownloaded || retentionConfirmation !== retentionPreview.confirmationText} onClick={purgeRetainedData} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40">{purgingData ? "Deleting batch…" : retentionBackupDownloaded ? `Permanently delete ${retentionPreview.count} records` : "Download backup to enable deletion"}</button></div> : <p className="mt-4 text-sm text-emerald-200">Nothing can be deleted for this range; the protected retention window is intact.</p>}</div>}
              </section>
            </div>
          )}
          {tableView && pagination.total > 0 && (
            <nav aria-label={`${view} pagination`} className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))} disabled={loading || pagination.page === 1} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                {pageNumbers.map((number) => <button key={number} type="button" aria-current={number === pagination.page ? "page" : undefined} onClick={() => setPagination((current) => ({ ...current, page: number }))} disabled={loading} className={`h-9 min-w-9 rounded-lg px-2 text-sm font-bold disabled:opacity-40 ${number === pagination.page ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>{number}</button>)}
                <button type="button" onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))} disabled={loading || pagination.page === pagination.pages} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
              </div>
            </nav>
          )}
          {view === "settings" && (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setSaving(true);
                try {
                  await api("/api/admin/settings", {
                    method: "PUT",
                    body: JSON.stringify(settings),
                  });
                  announce("Settings saved successfully.");
                } catch (error: any) {
                  announce(error.message);
                } finally {
                  setSaving(false);
                }
              }}
              className="max-w-2xl space-y-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <h2 className="text-lg font-bold">Store settings</h2>
              <label className="block text-sm">
                Store name
                <input
                  value={settings.storeName || ""}
                  onChange={(event) =>
                    setSettings({ ...settings, storeName: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
                />
              </label>
              <label className="block text-sm">
                Default author
                <input
                  value={settings.defaultAuthor || ""}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      defaultAuthor: event.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
                />
              </label>
              <label className="block text-sm">
                Default SEO description
                <textarea
                  value={settings.defaultDescription || ""}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      defaultDescription: event.target.value,
                    })
                  }
                  className="mt-1.5 min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
                />
              </label>
              <button
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 font-bold disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save settings"}
              </button>
            </form>
          )}
        </div>
      </section>
      {editing && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-sm">
          <form
            onSubmit={save}
            className="mx-auto my-4 max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {view}
                </p>
                <h2 className="text-xl font-black">
                  {editing._id
                    ? "Edit record"
                    : `New ${view === "products" ? "product" : "article"}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => !saving && setEditing(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close editor"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="grid gap-5 p-6 md:grid-cols-2">
              {view === "products" ? (
                <>
                  <>
                    {field("name", "Product name", "text", true)}
                    {field("slug", "URL slug", "text", true)}
                    {field("category", "Category", "text", true)}
                    <label className="block text-sm font-medium text-slate-300">
                      Price (INR){!editing.isFree && <span className="ml-1 text-red-400">*</span>}
                      <input
                        type="number"
                        min={editing.isFree ? 0 : 1}
                        step="0.01"
                        required={!editing.isFree}
                        disabled={editing.isFree}
                        value={editing.isFree ? 0 : (editing.price ?? "")}
                        onChange={(event) => setEditing({ ...editing, price: event.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <span className="mt-1 block text-xs font-normal text-slate-500">Paid products must have a price above zero.</span>
                    </label>
                    <label className="mt-7 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={editing.isFree === true}
                        onChange={(event) => setEditing({ ...editing, isFree: event.target.checked, price: event.target.checked ? 0 : editing.price })}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-blue-500 focus:ring-blue-500"
                      />
                      <span><span className="font-bold text-emerald-300">Free product</span><span className="block text-xs text-slate-500">No payment; delivered as a CodersVoice gift.</span></span>
                    </label>
                    {field("ownerSharePercent", "Your revenue share %", "number", false)}
                  </>
                  <div className="md:col-span-2">
                    {field("shortDescription", "Short description", "text", true)}
                  </div>
                  <label className="md:col-span-2 block text-sm font-medium text-slate-300">
                    Description<span className="ml-1 text-red-400">*</span>
                    <textarea
                      required
                      value={editing.description || ""}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          description: event.target.value,
                        })
                      }
                      className="mt-1.5 min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
                    />
                  </label>
                  {imageField("thumbnail", "Product thumbnail", true)}
                  {field("downloadUrl", "Private download URL", "url", true)}
                  {field("demoUrl", "Demo URL")}
                  {field("tags", "Tags (comma separated)")}
                  {field("techStack", "Tech stack (comma separated)")}
                  {galleryField()}
                </>
              ) : (
                <>
                  <>
                    {field("title", "Article title")}
                    {field("slug", "URL slug")}
                    {field("author", "Author")}
                    {field("category", "Category")}
                  </>
                  <div className="md:col-span-2">
                    {field("excerpt", "Excerpt")}
                  </div>
                  <div className="md:col-span-2 rounded-xl border border-slate-700 bg-slate-950/40 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="text-sm font-medium text-slate-200">Article content <span className="text-red-400">*</span></label>
                      <span className="text-xs text-slate-500">Formatting is sanitised before publishing.</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 border-y border-slate-700/80 py-2">
                      <button type="button" onClick={() => insertArticleMarkup("<h2>", "</h2>", "Section heading")} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-blue-400">Heading</button>
                      <button type="button" onClick={() => insertArticleMarkup("<strong>", "</strong>", "Bold text")} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-blue-400"><b>Bold</b></button>
                      <button type="button" onClick={() => insertArticleMarkup("<em>", "</em>", "Italic text")} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-blue-400"><i>Italic</i></button>
                      <button type="button" onClick={() => insertArticleMarkup("<blockquote>", "</blockquote>", "Important quote")} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-blue-400">Quote</button>
                      <button type="button" onClick={() => insertArticleMarkup("<ul>\n  <li>", "</li>\n</ul>", "List item")} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-blue-400">List</button>
                      <button type="button" onClick={() => insertArticleMarkup("<code>", "</code>", "code")} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-blue-400">Code</button>
                      <button type="button" onClick={insertArticleLink} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-blue-400">Link</button>
                    </div>
                    <textarea
                      ref={articleTextareaRef}
                      required
                      value={editing.content || ""}
                      placeholder="Write your article, then select text and use the formatting toolbar."
                      onChange={(event) => setEditing({ ...editing, content: event.target.value })}
                      className="mt-3 min-h-64 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-sm leading-6"
                    />
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-700 bg-white">
                      <p className="border-b border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">Safe preview</p>
                      <iframe title="Article preview" sandbox="" srcDoc={editing.content || "<p>Start writing to preview your article.</p>"} className="h-64 w-full bg-white text-slate-900" />
                    </div>
                  </div>
                  {imageField("featuredImage", "Featured image")}
                  {field("tags", "Tags (comma separated)")}
                </>
              )}
              <div>{field("seoTitle", "SEO title")}</div>
              <div>
                {field(
                  view === "products" ? "seoDescription" : "metaDescription",
                  "Meta description",
                )}
              </div>
              {view === "blogs" ? <label className="block text-sm font-medium text-slate-300">Status<select value={editing.status || "draft"} onChange={(event) => setEditing({ ...editing, status: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5"><option value="draft">Draft</option><option value="published">Published</option></select></label> : <p className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-400"><b className="text-red-300">*</b> Required fields must be complete before saving. New products are hidden by default; after saving, use <b className="text-slate-200">Unhide to Store</b>. <b className="text-slate-200">Your revenue share %</b> is the amount CodersVoice keeps; the remaining percentage is allocated to the partner and is snapshotted on every new paid order.</p>}
            </div>
            {editorError && <div role="alert" className="mx-6 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{editorError}</div>}
            <div className="flex items-center justify-end gap-3 border-t border-slate-700 bg-slate-900 px-6 py-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold hover:bg-blue-500 disabled:opacity-50"
              >
                <Icon name="check" size={16} />
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default Admin;
