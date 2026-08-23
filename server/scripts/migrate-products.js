/* One-time, idempotent migration from the pre-2.0 product constants. */
require('dotenv').config();
const connectDB = require('../src/config/db');
const Product = require('../src/models/Product');
const legacyCheckout = require('../src/config/products');

const details = {
  'modern-ecommerce-dashboard': { category: 'Web Dev Projects', shortDescription: 'A full-featured admin panel for e-commerce sites.', description: 'Manage orders, inventory, and users with this high-performance MERN stack dashboard. Includes charts, data tables, and user authentication.', thumbnail: 'https://picsum.photos/seed/dash/800/600', galleryImages: ['https://picsum.photos/seed/dash1/800/600', 'https://picsum.photos/seed/dash2/800/600', 'https://picsum.photos/seed/dash3/800/600'], demoUrl: 'https://demo.codersvoice.store/dashboard', tags: ['MERN', 'Admin', 'Trending'], techStack: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Recharts'] },
  'saas-startup-landing': { category: 'Landing Pages', shortDescription: 'High-converting landing page for modern SaaS products.', description: 'Perfect for startups looking to launch their product with a sleek, modern look. Optimized for conversion and mobile responsiveness.', thumbnail: 'https://picsum.photos/seed/saas/800/600', galleryImages: ['https://picsum.photos/seed/saas1/800/600', 'https://picsum.photos/seed/saas2/800/600'], demoUrl: 'https://demo.codersvoice.store/saas', tags: ['Tailwind', 'Next.js', 'Clean'], techStack: ['Next.js', 'Framer Motion', 'Tailwind CSS'] },
  'send-to-crush-proposal': { category: 'Fun Websites', shortDescription: 'A cute interactive way to ask someone out.', description: 'A viral-style interactive website that lets you propose to your crush in a creative way. Features confetti, animations, and sound effects.', thumbnail: 'https://picsum.photos/seed/crush/800/600', galleryImages: ['https://picsum.photos/seed/crush1/800/600', 'https://picsum.photos/seed/crush2/800/600'], demoUrl: 'https://demo.codersvoice.store/crush', tags: ['Fun', 'Frontend', 'Interactive'], techStack: ['HTML5', 'CSS3', 'JavaScript', 'GSAP'] },
  'reels-master-bundle': { category: 'Creator Bundles', shortDescription: '500+ templates and presets for tech creators.', description: 'Everything you need to grow your tech community on Instagram. Includes high-quality transitions, captions packs, and sound effects.', thumbnail: 'https://picsum.photos/seed/reels/800/600', galleryImages: ['https://picsum.photos/seed/reels1/800/600'], demoUrl: 'https://www.instagram.com/codersvoice', tags: ['Editing', 'Viral', 'Presets'], techStack: ['Premiere Pro', 'After Effects', 'CapCut'] },
  'dev-portfolio-template': { category: 'Landing Pages', shortDescription: 'A clean and fast portfolio for developers.', description: 'Land your dream job with a portfolio that stands out. Minimalist design with dark mode support and project showcase section.', thumbnail: 'https://picsum.photos/seed/port/800/600', galleryImages: ['https://picsum.photos/seed/port1/800/600', 'https://picsum.photos/seed/port2/800/600'], demoUrl: 'https://demo.codersvoice.store/portfolio', tags: ['Portfolio', 'Minimal', 'SEO'], techStack: ['React', 'Vite', 'Tailwind CSS'] },
  'solar-system-journey': { category: 'Web Dev Projects', shortDescription: 'A very awesome Space UI animated website.', description: 'Solar System Journey is an interactive web application that lets users explore planets through visuals, animations, and detailed facts.', thumbnail: 'https://res.cloudinary.com/duuw8pdvy/image/upload/v1768981846/SolarSystemJourney_nmrvjc.jpg', galleryImages: ['https://res.cloudinary.com/duuw8pdvy/image/upload/v1768981846/SolarSystemJourney1_qmpsss.jpg', 'https://res.cloudinary.com/duuw8pdvy/image/upload/v1768981846/SolarSystemJourney2_ldqm2e.jpg', 'https://res.cloudinary.com/duuw8pdvy/image/upload/v1768981846/SolarSystemJourney3_cnwkk2.jpg'], demoUrl: 'https://nixjourney.onrender.com/', tags: ['Solar System', 'Awesome UI', 'Animated Website'], techStack: ['HAML', 'HTML', 'SCSS'] }
};

(async () => {
  await connectDB();
  for (const [slug, checkout] of Object.entries(legacyCheckout)) {
    const data = details[slug];
    if (!data) throw new Error(`No public metadata found for ${slug}`);
    await Product.updateOne({ slug }, { $setOnInsert: { name: checkout.name, slug, price: checkout.price, downloadUrl: checkout.downloadUrl, ...data, status: 'published', featured: slug === 'modern-ecommerce-dashboard', publishedAt: new Date() } }, { upsert: true });
    console.log(`Migrated or retained ${slug}`);
  }
  await Product.syncIndexes();
  console.log('Product migration complete. Verify each product, then retire the legacy constants.');
  process.exit(0);
})().catch((error) => { console.error('Migration failed:', error.message); process.exit(1); });
