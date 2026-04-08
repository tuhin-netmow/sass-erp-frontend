/**
 * Features Page
 * Public marketing page showing ERP features
 */

import { Helmet } from 'react-helmet-async';
import landingPageMetadata from '../config/metadata';

export default function Features() {
  const metadata = landingPageMetadata.features;

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords.join(', ')} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <link rel="canonical" href="https://kiraerp.com/features" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Powerful Features</h1>
        <p className="text-xl text-muted-foreground">
          Everything you need to manage your business efficiently
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Feature cards will be added here */}
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
          <p className="text-muted-foreground">Get a complete overview of your business</p>
        </div>
      </div>
    </div>
    </>
  );
}
