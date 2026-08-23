
import { Product, Testimonial, Service } from './types';

export interface FAQItem {
  question: string;
  answer: string;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Modern E-Commerce Dashboard',
    slug: 'modern-ecommerce-dashboard',
    category: 'Web Dev Projects',
    price: 1499,
    thumbnail: 'https://picsum.photos/seed/dash/800/600',
    demoUrl: 'https://demo.codersvoice.store/dashboard',
    tags: ['MERN', 'Admin', 'Trending'],
    shortDescription: 'A full-featured admin panel for e-commerce sites.',
    fullDescription: 'Manage orders, inventory, and users with this high-performance MERN stack dashboard. Includes charts, data tables, and user authentication.',
    galleryImages: [
      'https://picsum.photos/seed/dash1/800/600',
      'https://picsum.photos/seed/dash2/800/600',
      'https://picsum.photos/seed/dash3/800/600'
    ],
    techStack: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Recharts'],
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'SaaS Startup Landing Page',
    slug: 'saas-startup-landing',
    category: 'Landing Pages',
    price: 799,
    thumbnail: 'https://picsum.photos/seed/saas/800/600',
    demoUrl: 'https://demo.codersvoice.store/saas',
    tags: ['Tailwind', 'Next.js', 'Clean'],
    shortDescription: 'High-converting landing page for modern SaaS products.',
    fullDescription: 'Perfect for startups looking to launch their product with a sleek, modern look. Optimized for conversion and mobile responsiveness.',
    galleryImages: [
      'https://picsum.photos/seed/saas1/800/600',
      'https://picsum.photos/seed/saas2/800/600'
    ],
    techStack: ['Next.js', 'Framer Motion', 'Tailwind CSS'],
    createdAt: '2024-02-10'
  },
  {
    id: '3',
    title: 'Send-to-Crush Proposal Site',
    slug: 'send-to-crush-proposal',
    category: 'Fun Websites',
    price: 299,
    thumbnail: 'https://picsum.photos/seed/crush/800/600',
    demoUrl: 'https://demo.codersvoice.store/crush',
    tags: ['Fun', 'Frontend', 'Interactive'],
    shortDescription: 'A cute interactive way to ask someone out.',
    fullDescription: 'A viral-style interactive website that lets you propose to your crush in a creative way. Features confetti, animations, and sound effects.',
    galleryImages: [
      'https://picsum.photos/seed/crush1/800/600',
      'https://picsum.photos/seed/crush2/800/600'
    ],
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'GSAP'],
    createdAt: '2024-03-01'
  },
  {
    id: '4',
    title: 'Instagram Reels Master Bundle',
    slug: 'reels-master-bundle',
    category: 'Creator Bundles',
    price: 1999,
    thumbnail: 'https://picsum.photos/seed/reels/800/600',
    demoUrl: 'https://www.instagram.com/codersvoice',
    tags: ['Editing', 'Viral', 'Presets'],
    shortDescription: '500+ templates and presets for tech creators.',
    fullDescription: 'Everything you need to grow your tech community on Instagram. Includes high-quality transitions, captions packs, and sound effects.',
    galleryImages: [
      'https://picsum.photos/seed/reels1/800/600'
    ],
    techStack: ['Premiere Pro', 'After Effects', 'CapCut'],
    createdAt: '2024-03-15'
  },
  {
    id: '5',
    title: 'Personal Developer Portfolio',
    slug: 'dev-portfolio-template',
    category: 'Landing Pages',
    price: 499,
    thumbnail: 'https://picsum.photos/seed/port/800/600',
    demoUrl: 'https://demo.codersvoice.store/portfolio',
    tags: ['Portfolio', 'Minimal', 'SEO'],
    shortDescription: 'A clean and fast portfolio for developers.',
    fullDescription: 'Land your dream job with a portfolio that stands out. Minimalist design with dark mode support and project showcase section.',
    galleryImages: [
      'https://picsum.photos/seed/port1/800/600',
      'https://picsum.photos/seed/port2/800/600'
    ],
    techStack: ['React', 'Vite', 'Tailwind CSS'],
    createdAt: '2024-02-20'
  },
  {
    id: "7",
    title: "Solar System Journey",
    slug: "solar-system-journey",
    category: "Web Dev Projects",
    price: 299,
    thumbnail: "https://res.cloudinary.com/duuw8pdvy/image/upload/v1768981846/SolarSystemJourney_nmrvjc.jpg",
    demoUrl: "https://nixjourney.onrender.com/",
    tags: ["Solar System", "Awesome UI", "Animated Website"],
    shortDescription: "A very awesome Space UI animated website.",
    fullDescription: "Solar System Journey is an interactive web application that lets users explore planets in our solar system through beautiful visuals, animations, and detailed planet facts. Click on any planet to view its key details, distance from the Sun, and open in-depth fact panels for deeper learning.",
    galleryImages: ["https://res.cloudinary.com/duuw8pdvy/image/upload/v1768981846/SolarSystemJourney1_qmpsss.jpg", "https://res.cloudinary.com/duuw8pdvy/image/upload/v1768981846/SolarSystemJourney2_ldqm2e.jpg",
"https://res.cloudinary.com/duuw8pdvy/image/upload/v1768981846/SolarSystemJourney3_cnwkk2.jpg"],
    techStack: ["HAML", "HTML", "SCSS"],
    createdAt: "2026-01-20",
  },

];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Aryan Khan',
    role: 'Computer Science Student',
    content: 'The MERN projects from CodersVoice helped me land my first internship. The code is clean and easy to understand.',
    avatar: 'https://i.pravatar.cc/150?img=59'
  },
  {
    id: '2',
    name: 'Suraj sharma',
    role: 'Freelance Web Developer',
    content: 'The landing page templates are elite. Saved me at least 20 hours of work on my last client project.',
    avatar: 'https://i.pravatar.cc/150?img=68'
  },
  {
    id: '3',
    name: 'Riya Singh',
    role: 'Content Creator',
    content: 'The reels bundle is a game changer for tech creators. My engagement spiked by 40% after using their presets.',
    avatar: 'https://i.pravatar.cc/150?u=rohan'
  }
];

export const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Custom Web Build',
    description: 'Launch a high-performance custom web app built exactly for your business needs. We deliver modern UI, scalable backend, and conversion-focused features that help you attract users and grow revenue.',
    icon: 'code'
  },
  {
    id: '2',
    title: 'Paid Promotions',
    description: 'Boost your tech product, AI tool, SaaS, or course with high-converting paid promotions. We deliver targeted reach to developers + tech learners with strong CTA campaigns that drive clicks, signups, and sales.',
    icon: 'layout'
  },
  {
    id: '3',
    title: 'Video Editing & Editing Bundles',
    description: 'Professional video editing for reels, shorts, YouTube, and brand content, plus ready-to-use presets, templates, and editing asset bundles.',
    icon: 'video'
  },
  {
    id: '4',
    title: 'AI Automation',
    description: 'Integrating AI workflows into your existing business to save time and scale faster.',
    icon: 'cpu'
  },
  {
    id: '5',
    title: 'Digital Marketing & SEO',
    description: 'Grow discoverability and qualified traffic with practical SEO, content strategy, on-page optimisation, and digital marketing campaigns tailored to your goals.',
    icon: 'marketing'
  },
  {
    id: '6',
    title: 'Custom Brochure & Pamphlet Design',
    description: 'Get clear, brand-aligned brochures, pamphlets, flyers, and promotional designs that make your offer easy to understand and ready to share online or in print.',
    icon: 'design'
  }
];

export const FAQS: FAQItem[] = [
  {
    question: "Do I get lifetime access to the products?",
    answer: "Yes, once you purchase any digital asset from CodersVoice Store, you get lifetime access to the files and any future updates for that specific version."
  },
  {
    question: "Can I customize the source code?",
    answer: "Absolutely! Our projects are built with developers in mind. You get full access to the source code and can customize it as per your requirements for personal or client projects."
  },
  {
    question: "What is your refund policy?",
    answer: "Due to the digital nature of our products, we do not offer refunds once the files have been downloaded. However, we provide 100% technical support if you face any issues during setup."
  },
  {
    question: "How do I receive the files after purchase?",
    answer: "After a successful payment on SuperProfile, you will be automatically redirected to the download link. You will also receive an email with the link to access your files."
  },
  {
    question: "Are these projects beginner-friendly?",
    answer: "Yes, we categorize our products based on difficulty. Most of our templates and web projects come with a detailed documentation guide to help beginners set them up easily."
  }
];
