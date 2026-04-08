import { Helmet } from 'react-helmet-async';
import { FileText, UserCheck, Database, ShieldX, Clock, AlertCircle, Gavel, RefreshCw } from 'lucide-react';
import landingPageMetadata from '../config/metadata';

const termsSections = [
  {
    icon: UserCheck,
    title: 'System Access & Usage',
    description: 'Access to the ERP system is provided only to authorized users assigned by the company owner or system administrator. Users must use the system strictly for legitimate business purposes.',
    items: [],
  },
  {
    icon: Database,
    title: 'User Accounts & Security',
    description: 'To maintain account security:',
    items: [
      'Users are responsible for safeguarding their login credentials',
      'Account sharing is strictly prohibited',
      'Any unauthorized access must be reported immediately',
    ],
  },
  {
    icon: FileText,
    title: 'Data Ownership',
    description: 'All business data entered into the ERP system remains the property of the respective organization. Kira ERP does not claim ownership over customer or company data.',
    items: [],
  },
  {
    icon: ShieldX,
    title: 'Prohibited Activities',
    description: 'The following activities are strictly prohibited:',
    items: [
      'Attempting to bypass security or access restricted modules',
      'Uploading malicious code or harmful data',
      'Misusing ERP data for non-business or illegal purposes',
    ],
  },
  {
    icon: Clock,
    title: 'System Availability',
    description: 'While we strive for high availability (99.9% uptime), Kira ERP does not guarantee uninterrupted access. Scheduled maintenance or unforeseen issues may result in temporary downtime.',
    items: [],
  },
  {
    icon: AlertCircle,
    title: 'Limitation of Liability',
    description: 'Kira ERP shall not be held liable for any direct, indirect, or incidental damages resulting from the use or inability to use the ERP system.',
    items: [],
  },
  {
    icon: Gavel,
    title: 'Termination',
    description: 'We reserve the right to suspend or terminate access to the ERP system if these terms are violated or if misuse is detected.',
    items: [],
  },
  {
    icon: RefreshCw,
    title: 'Changes to Terms',
    description: 'Kira ERP may update these Terms & Conditions at any time. Continued use of the ERP system after changes constitutes acceptance of the updated terms.',
    items: [],
  },
];

export default function Terms() {
  const metadata = landingPageMetadata.terms;

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords.join(', ')} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://kiraerp.com/terms" />
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
              <FileText className="size-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] leading-tight font-normal text-[#0A0A0A] mb-4 font-serif">
            <span className="text-(--color-brand)">Terms</span> & Conditions
          </h1>
          <p className="text-gray-500 max-w-[700px] mx-auto text-base md:text-lg leading-relaxed px-4">
            These Terms & Conditions govern the use of the <strong>Kira ERP</strong> platform.
            By accessing or using this system, you agree to comply with these terms.
          </p>
          <p className="text-gray-400 max-w-[700px] mx-auto text-sm mt-4 px-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="space-y-8">
            {termsSections.map((section, index) => {
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

          {/* Agreement Notice */}
          <div className="mt-12 rounded-2xl bg-linear-to-br from-[#0F172B] to-[#1e293b] p-8 md:p-10 text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
              By Using Kira ERP, You Agree to These Terms
            </h3>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              If you do not agree with these Terms & Conditions, please do not use our ERP system.
              For questions or clarifications, feel free to reach out to us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#AD46FF] px-6 py-3 text-white font-medium hover:bg-[#9333EA] transition-colors"
              >
                Contact Us
              </a>
              <a
                href="/privacy"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600 px-6 py-3 text-white font-medium hover:bg-white/10 transition-colors"
              >
                View Privacy Policy
              </a>
            </div>
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
