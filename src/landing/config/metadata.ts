/**
 * Landing Page Metadata Configuration
 *
 * SEO metadata for all landing pages
 */

interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export const landingPageMetadata: Record<string, PageMetadata> = {
  home: {
    title: 'Kira ERP - Complete Business Management Solution',
    description: 'Comprehensive ERP system for growing businesses. Manage inventory, sales, purchase, accounting, HR, and more - all in one powerful platform. Start your free trial today.',
    keywords: ['ERP', 'business management', 'inventory management', 'accounting', 'HR software', 'sales management', 'purchase management', 'cloud ERP', 'SaaS ERP'],
    ogImage: '/assets/img/kira-logo.png'
  },
  features: {
    title: 'Features - Kira ERP | Powerful Business Tools',
    description: 'Explore powerful features of Kira ERP including dashboard, HR, accounting, inventory, sales, purchase, manufacturing, POS, and more. Everything you need to manage your business.',
    keywords: ['ERP features', 'business tools', 'dashboard', 'inventory management', 'accounting software', 'HR management', 'sales tracking', 'purchase order'],
    ogImage: '/assets/img/kira-logo.png'
  },
  pricing: {
    title: 'Pricing - Kira ERP | Simple & Transparent Plans',
    description: 'Choose the perfect plan for your business. Starter, Professional, and Enterprise plans with flexible monthly or annual billing. 14-day free trial available.',
    keywords: ['ERP pricing', 'business software pricing', 'ERP plans', 'subscription plans', 'affordable ERP', 'enterprise ERP pricing'],
    ogImage: '/assets/img/kira-logo.png'
  },
  about: {
    title: 'About Us - Kira ERP | Our Story & Mission',
    description: 'Learn about Kira ERP - our mission, values, and team. We\'re empowering businesses with comprehensive, intuitive, and powerful ERP software since 2025.',
    keywords: ['about Kira ERP', 'ERP company', 'our story', 'company values', 'ERP team', 'business software company'],
    ogImage: '/assets/img/kira-logo.png'
  },
  contact: {
    title: 'Contact Us - Kira ERP | Get in Touch',
    description: 'Have questions? Contact the Kira ERP team. We\'re here to help you find the perfect solution for your business. Call, email, or visit our office.',
    keywords: ['contact Kira ERP', 'ERP support', 'customer service', 'sales inquiry', 'technical support', 'business hours'],
    ogImage: '/assets/img/kira-logo.png'
  },
  'module-page': {
    title: 'Modules - Kira ERP | Comprehensive Business Modules',
    description: 'Discover Kira ERP\'s comprehensive modules - Dashboard, HR, Accounting, Inventory, Sales, Purchase, Manufacturing, Reports, POS, Fixed Assets, and Project Management.',
    keywords: ['ERP modules', 'business modules', 'dashboard module', 'HR module', 'accounting module', 'inventory module', 'sales module'],
    ogImage: '/assets/img/kira-logo.png'
  },
  privacy: {
    title: 'Privacy Policy - Kira ERP',
    description: 'Read Kira ERP\'s privacy policy to understand how we collect, use, and protect your data. Your privacy is our priority.',
    keywords: ['privacy policy', 'data protection', 'GDPR', 'user privacy', 'data security'],
  },
  terms: {
    title: 'Terms of Service - Kira ERP',
    description: 'Read Kira ERP\'s terms of service to understand your rights and responsibilities when using our platform.',
    keywords: ['terms of service', 'terms and conditions', 'legal terms', 'user agreement'],
  }
};

export default landingPageMetadata;
