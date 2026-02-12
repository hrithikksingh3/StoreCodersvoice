
export type Category = 'Web Dev Projects' | 'Landing Pages' | 'Fun Websites' | 'Creator Bundles';

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: Category;
  price: number;
  thumbnail: string;
  demoUrl: string;
  tags: string[];
  shortDescription: string;
  fullDescription: string;
  galleryImages: string[];
  techStack: string[];
  createdAt: string;
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
