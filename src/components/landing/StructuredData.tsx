export function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Call Times',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        name: 'Free Plan',
      },
      {
        '@type': 'Offer',
        price: '29',
        priceCurrency: 'EUR',
        name: 'Pro Plan',
      },
      {
        '@type': 'Offer',
        price: '119',
        priceCurrency: 'EUR',
        name: 'Organization Plan',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    description:
      'Call Times is a global production assistant app that helps you manage your shooting faster and smoother. Create call sheets, manage contacts, and collaborate with your team.',
    featureList: [
      'Smart Contact Directory',
      'Collaborative Project Hub',
      'Professional Call Sheet Editor',
      'Real-time Synchronization',
      'Multi-format File Preview',
      'Team Collaboration',
    ],
  }

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Call Times',
    url: 'https://calltimes.app',
    logo: 'https://calltimes.app/logo.png',
    sameAs: [
      'https://twitter.com/calltimes',
      'https://linkedin.com/company/calltimes',
      'https://instagram.com/calltimes',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@calltimes.app',
      contactType: 'Customer Support',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </>
  )
}


