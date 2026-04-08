import { Helmet } from 'react-helmet-async';
import { Shield, Eye, Lock, Share2, UserCog, Calendar } from 'lucide-react';
import landingPageMetadata from '../config/metadata';

const privacySections = [
  {
    icon: Eye,
    title: 'Information We Collect',
    description: 'We may collect the following types of information:',
    items: [
      'User account details (name, email, role, permissions)',
      'Company and organizational data',
      'Operational and transactional ERP data',
      'System logs, activity history, and usage data',
    ],
  },
  {
    icon: Shield,
    title: 'How We Use Your Information',
    description: 'Your information helps us deliver better ERP services:',
    items: [
      'To operate and manage ERP features and modules',
      'To control access based on roles and permissions',
      'To improve system performance and user experience',
      'To maintain security, auditing, and compliance',
    ],
  },
  {
    icon: Lock,
    title: 'Data Security',
    description: 'We implement industry-standard security measures to protect your data, including access control, authentication, encryption, and monitoring. Only authorized users can access sensitive ERP data based on assigned roles.',
    items: [],
  },
  {
    icon: Share2,
    title: 'Data Sharing',
    description: 'We do not sell or share your data with third parties except when required by law or necessary for system operation (such as hosting, security, or compliance services).',
    items: [],
  },
  {
    icon: UserCog,
    title: 'User Responsibilities',
    description: 'Users are responsible for maintaining the confidentiality of their login credentials and ensuring that ERP data is used only for authorized business purposes.',
    items: [],
  },
  {
    icon: Calendar,
    title: 'Changes to This Policy',
    description: 'Kira ERP reserves the right to update this Privacy Policy at any time. Any changes will be reflected within the ERP system and on this page.',
    items: [],
  },
];

export default function Privacy() {
  const metadata = landingPageMetadata.privacy;

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords.join(', ')} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://kiraerp.com/privacy" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-linear-to-b from-[#F9F5FF] via-white to-white text-center">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-[-10%] w-[400px] h-[400px] bg-[#AD46FF]/10 blur-[100px] rounded-full"></div>
          <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#AD46FF]/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="container relative z-10">
          <div className="flex justify-center mb-6">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#AD46FF]">
              <Shield className="size-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] leading-tight font-normal text-[#0A0A0A] mb-4 font-serif">
            <span className="text-(--color-brand)">Privacy</span> Policy
          </h1>
          <p className="text-gray-500 max-w-[700px] mx-auto text-base md:text-lg leading-relaxed px-4">
            Your privacy is our priority. This policy explains how <strong>Kira ERP</strong> collects,
            uses, stores, and protects your information when you use our platform.
          </p>
          <p className="text-gray-400 max-w-[700px] mx-auto text-sm mt-4 px-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="space-y-8">
            {privacySections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className="group rounded-2xl bg-white border border-gray-100 p-6 md:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-[#AD46FF]/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#F9F5FF] text-[#AD46FF] group-hover:bg-[#AD46FF] group-hover:text-white transition-all duration-300">
                      <Icon className="size-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-semibold text-[#0A0A0A] mb-3">
                        {index + 1}. {section.title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-3">
                        {section.description}
                      </p>
                      {section.items.length > 0 && (
                        <ul className="space-y-2">
                          {section.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-3 text-gray-600">
                              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#F9F5FF] text-[#AD46FF] text-xs font-semibold mt-0.5">
                                {itemIndex + 1}
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Section */}
          <div className="mt-12 rounded-2xl bg-linear-to-br from-[#0F172B] to-[#1e293b] p-8 md:p-10 text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
              Questions About Your Privacy?
            </h3>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              If you have any questions or concerns about this Privacy Policy or how we handle your data,
              please don't hesitate to contact us.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[#AD46FF] px-6 py-3 text-white font-medium hover:bg-[#9333EA] transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-100 py-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Kira ERP. All rights reserved.</p>
      </div>
    </>
  );
}
