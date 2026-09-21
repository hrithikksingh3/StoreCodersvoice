
export type Category = string;

export interface Product {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  category: Category;
  price: number;
  ownerSharePercent?: number;
  thumbnail: string;
  demoUrl: string;
  tags: string[];
  shortDescription: string;
  fullDescription: string;
  galleryImages: string[];
  techStack: string[];
  createdAt: string;
  status?: 'draft' | 'published' | 'hidden' | 'archived';
  downloadUrl?: string;
  featured?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: string;
  category: string;
  tags: string[];
  status?: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  seoTitle?: string;
  metaDescription?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}
