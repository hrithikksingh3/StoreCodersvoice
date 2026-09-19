import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { api, setCsrfToken } from "../api";
import { API_BASE_URL } from "../config";
import toast from "react-hot-toast";

type Item = Record<string, any>;
type View =
  "dashboard" | "products" | "blogs" | "orders" | "audit" | "settings";
type Action = "duplicate" | "archive" | "publish" | "draft" | "hidden";
type PaginationState = { page: number; limit: number; total: number; pages: number };

const blankProduct = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: 0,
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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const nav = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: "grid" },
      { id: "products", label: "Products", icon: "box" },
      { id: "blogs", label: "Blog", icon: "book" },
      { id: "orders", label: "Orders", icon: "receipt" },
      { id: "audit", label: "Audit logs", icon: "clock" },
      { id: "settings", label: "Settings", icon: "gear" },
    ],
    [],
  );
  const announce = (message: string) => toast.success(message);
  const reportError = (message: string) => toast.error(message);
  const tableView = ["products", "blogs", "orders", "audit"].includes(view);
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
      else if (["products", "blogs", "orders", "audit"].includes(target)) {
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
  }, [admin, view, query, statusFilter, categoryFilter, auditActionFilter, dateFrom, dateTo, pagination.page, pagination.limit]);
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
    setDateFrom("");
    setDateTo("");
    setPagination((current) => ({ ...current, page: 1, total: 0, pages: 1 }));
    setView(target);
  };
  const resetTableFilters = () => {
    setQuery("");
    setStatusFilter("");
    setCategoryFilter("");
    setAuditActionFilter("");
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
      if (required.length || !Number.isFinite(Number(editing.price)) || Number(editing.price) < 0) {
        const message = required.length ? `Complete required fields: ${required.join(", ")}.` : "Price must be zero or greater.";
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
      price: Number(editing.price),
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
      await load("orders", pagination.page);
    } catch (error: any) {
      reportError(error.message || "Unable to resend the delivery email.");
    } finally {
      setPendingAction("");
    }
  };
  const downloadReport = async (scope: "products" | "orders" | "dashboard", format: "pdf" | "xlsx") => {
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
      if (scope === "orders") {
        if (query) params.set("q", query);
        if (statusFilter) params.set("status", statusFilter);
      }
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
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
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="sr-only" onChange={(event) => { const files = Array.from(event.target.files || []); if (files.length) uploadGalleryImages(files); event.currentTarget.value = ""; }} />
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
        <button
          onClick={logout}
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-900 hover:text-white"
        >
          <Icon name="logout" size={17} />
          Sign out
        </button>
      </aside>
      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#020617]/95 px-5 py-4 backdrop-blur md:px-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">
                Signed in as {admin.email}
              </p>
              <h1 className="mt-1 text-2xl font-black capitalize">
                {view === "audit" ? "Audit logs" : view}
              </h1>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {(["dashboard", "products", "orders"] as View[]).includes(view) && (
                <>
                  <button type="button" disabled={Boolean(downloadingReport)} onClick={() => downloadReport(view as "dashboard" | "products" | "orders", "pdf")} className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-red-400 hover:text-white disabled:opacity-50">{downloadingReport === `${view}:pdf` ? "Preparing…" : "Export PDF"}</button>
                  <button type="button" disabled={Boolean(downloadingReport)} onClick={() => downloadReport(view as "dashboard" | "products" | "orders", "xlsx")} className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-emerald-400 hover:text-white disabled:opacity-50">{downloadingReport === `${view}:xlsx` ? "Preparing…" : "Export Excel"}</button>
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
                  {view !== "orders" && <><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></>}
                  {view === "products" && <option value="hidden">Hidden</option>}
                  {view === "orders" && <><option value="created">Created</option><option value="paid">Paid</option><option value="failed">Failed</option></>}
                </select>}
                {(view === "products" || view === "blogs") && <input value={categoryFilter} onChange={(event) => setTableFilter(setCategoryFilter, event.target.value)} placeholder="Exact category" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />}
                {view === "audit" && <input value={auditActionFilter} onChange={(event) => setTableFilter(setAuditActionFilter, event.target.value)} placeholder="Exact action, e.g. PRODUCT_UPDATED" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-blue-500 lg:col-span-2" />}
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
                      <td className="p-4 text-slate-400">{item.email}</td>
                      <td className="p-4">₹{item.amount}</td>
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
                    {field("price", "Price (INR)", "number", true)}
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
                  <label className="md:col-span-2 block text-sm font-medium text-slate-300">
                    Article content (safe HTML)
                    <textarea
                      value={editing.content || ""}
                      onChange={(event) =>
                        setEditing({ ...editing, content: event.target.value })
                      }
                      className="mt-1.5 min-h-56 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
                    />
                  </label>
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
              {view === "blogs" ? <label className="block text-sm font-medium text-slate-300">Status<select value={editing.status || "draft"} onChange={(event) => setEditing({ ...editing, status: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5"><option value="draft">Draft</option><option value="published">Published</option></select></label> : <p className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-400"><b className="text-red-300">*</b> Required fields must be complete before saving. New products are hidden by default; after saving, use <b className="text-slate-200">Unhide to Store</b>. Use the thumbnail controls to store an uploaded or pasted image in Cloudinary.</p>}
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
