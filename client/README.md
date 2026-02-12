# 🚀 CodersVoice Store — Digital Products Marketplace

A premium **dark-themed digital products storefront** for **CodersVoice**, built to showcase and sell downloadable resources like:

✅ Web Dev Projects
✅ Landing Pages
✅ Fun Websites (Send to Crush / Birthday / Wishes etc.)
✅ Creator Bundles (Reels bundles, templates, packs)

⚡ Payments and product delivery are handled externally through **SuperProfile** — this website works as a fast, modern marketplace frontend.

---

## ✨ Features

### 🛍️ Store / Marketplace

* Category based product listing
* Product card UI with:

  * **Live Demo** button
  * **Buy Now** button (redirects to SuperProfile)
* Responsive marketplace grid layout (desktop/tablet/mobile)
* Product detail pages (preview + details + gallery + tech stack)
* Search + filter + sort system *(if enabled in build)*

### 🌐 Pages

* Home (Hero + Featured Categories + Featured Products)
* Store page
* Product detail page
* About page
* Services page
* Contact page
* Terms / Privacy / Refund policy pages

### 📩 Forms

* ✅ **Newsletter subscription** via **Beehiiv embed form**
* ✅ **Contact form** integrated with Getform/Forminit *(based on configuration)*

### ⚡ UI / UX

* Premium SaaS style UI
* Dark theme + neon accents
* Glassmorphism cards + hover animations
* Fully mobile responsive
* Optimized for speed & performance

---

## 🧠 Tech Stack

* **React + TypeScript**
* **Vite**
* **Tailwind CSS**
* Component-based UI structure
* Data driven store using structured constants

---

## 📂 Project Structure

```
codersvoice-store/
├─ public/
│  ├─ images/
│  └─ ...
├─ src/
│  ├─ components/
│  ├─ pages/
│  ├─ constants.tsx
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ index.html
├─ package.json
├─ tailwind.config.js
└─ README.md
```

---

## 🛒 Adding / Updating Products

All products are managed from one place:

📌 `src/constants.tsx`

You’ll find something like:

```ts
export const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Admin Dashboard Project",
    slug: "admin-dashboard-project",
    category: "Web Dev Projects",
    price: 299,
    thumbnail: "/images/products/thumb.png",
    demoUrl: "https://your-demo-link.com",
    buyUrl: "https://superprofile.link/your-product",
    tags: ["MERN", "Full Stack", "Admin Panel"],
    shortDescription: "A full admin dashboard with auth and charts.",
    fullDescription: "Detailed product description goes here...",
    galleryImages: ["/img1.png", "/img2.png"],
    techStack: ["React", "Node", "MongoDB"],
    createdAt: "2026-01-19",
  },
];
```

### ✅ Required fields

* `thumbnail` → product preview image
* `demoUrl` → live demo link
* `buyUrl` → SuperProfile buy link
* `price` → display price

---

## 🖼️ Images (Thumbnails + Gallery)

You can store images in 2 ways:

### ✅ Option A (Recommended): Cloudinary

Use hosted optimized URLs like:

```ts
thumbnail: "https://res.cloudinary.com/.../thumbnail.png"
```

### ✅ Option B: Local assets

Add images into `public/` and use:

```ts
thumbnail: "/images/products/thumbnail.png"
```

---

## 📩 Newsletter Subscription (Beehiiv)

Beehiiv subscription is implemented using an **embed iframe** in the newsletter section.

To update the form:

* Create/Update Beehiiv subscribe form
* Replace iframe `src` inside Home newsletter section.

---

## 📞 Contact Form

The contact page supports external form providers like:

✅ Getform
✅ Forminit

To configure:

* Replace the endpoint URL in `Contact.tsx`
* Ensure fields include `name`, `email`, `message`

---

## ⚙️ Installation & Setup

### 1) Clone the repository

```bash
git clone https://github.com/your-username/codersvoice-store.git
cd codersvoice-store
```

### 2) Install dependencies

```bash
npm install
```

### 3) Run locally

```bash
npm run dev
```

App runs on:

```
http://localhost:5173
```

---

## 🚀 Build for Production

```bash
npm run build
npm run preview
```

---

## 🌍 Deployment

### ✅ Deploy on Vercel

1. Push code to GitHub
2. Import project on Vercel
3. Deploy ✅

### ✅ Deploy on Netlify

1. Push code to GitHub
2. Import project on Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

---

## 🔥 CodersVoice Branding

This project follows CodersVoice premium UI theme:

* Dark theme + neon highlights
* Glassmorphism UI
* Marketplace feel

> **CodersVoice — Build. Learn. Stay Relevant.**

---

## 📌 Author

**Hrithik Kumar Singh**
Founder @ **CodersVoice**

📷 Instagram: [https://instagram.com/codersvoice](https://instagram.com/codersvoice)
🌐 Store: CodersVoice Store
📩 Email: [support@codersvoice.store](mailto:support@codersvoice.store)

---

## 📄 License

This project is for CodersVoice store usage.
All rights reserved © CodersVoice.
