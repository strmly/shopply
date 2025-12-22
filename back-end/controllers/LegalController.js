import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Legal Controller
 * Handles all legal document requests (Terms, Privacy, Community Guidelines, Licenses)
 * 
 * Note: Legal text content should be reviewed and approved by legal counsel before launch.
 * This content is product-accurate and UX-ready, aligned with hyperlocal H3 system,
 * WhatsApp integration, escrow payments, and seller marketplace model.
 */

const LAST_UPDATED = '2026-03-12';

// Terms of Service Content
const TERMS_OF_SERVICE = {
  title: 'Terms of Service',
  lastUpdated: LAST_UPDATED,
  version: '1.0.0',
  tableOfContents: [
    'Introduction',
    'Definitions',
    'Eligibility',
    'Buyer Terms',
    'Seller Terms',
    'Payments & Escrow',
    'Hyperlocal Services & Location Accuracy',
    'Orders, Cancellations & Refunds',
    'Reviews & User Content',
    'WhatsApp & Third-Party Channels',
    'Prohibited Conduct',
    'Disclaimers & Limitation of Liability',
    'Termination',
    'Governing Law',
    'Contact',
  ],
  sections: [
    {
      id: 'introduction',
      heading: '1. Introduction',
      content: [
        'Welcome to **Str3mly ShopLocal** ("Str3mly", "we", "us", "our").',
        'Str3mly is a hyperlocal marketplace that connects buyers with nearby independent sellers for the purchase, pickup, and delivery of goods.',
        '',
        'By accessing or using Str3mly through:',
        '',
        '• our mobile applications,',
        '• our website,',
        '• or our WhatsApp channel,',
        '',
        'you agree to be bound by these **Terms of Service** ("Terms").',
        '',
        'If you do not agree, you may not use the platform.',
      ],
    },
    {
      id: 'definitions',
      heading: '2. Definitions',
      content: [
        '• **Buyer**: a user purchasing goods on Str3mly',
        '• **Seller**: a merchant listing and selling goods',
        '• **Order**: a confirmed purchase made by a Buyer',
        '• **Escrow**: payment held securely until order completion',
        '• **Hyperlocal Services**: features that rely on your location to show nearby availability',
        '• **WhatsApp Channel**: interactions conducted via WhatsApp Business API',
      ],
    },
    {
      id: 'eligibility',
      heading: '3. Eligibility',
      content: [
        'You must:',
        '',
        '• be at least 18 years old',
        '• provide accurate account information',
        '• comply with applicable laws',
        '',
        'Sellers must:',
        '',
        '• be legally permitted to sell listed goods',
        '• maintain accurate inventory and pricing',
        '• complete identity and banking verification',
      ],
    },
    {
      id: 'buyer-terms',
      heading: '4. Buyer Terms',
      content: [
        'As a Buyer, you agree to:',
        '',
        '• provide accurate delivery or pickup information',
        '• review orders carefully before checkout',
        '• communicate respectfully with sellers and support',
        '• not abuse refund, return, or dispute mechanisms',
        '',
        'Str3mly does not manufacture or own products sold on the platform.',
      ],
    },
    {
      id: 'seller-terms',
      heading: '5. Seller Terms',
      content: [
        'As a Seller, you agree to:',
        '',
        '• maintain accurate stock levels',
        '• prepare orders within stated timelines',
        '• honor prices and promotions',
        '• communicate honestly with buyers',
        '',
        'Misrepresentation of:',
        '',
        '• location',
        '• availability',
        '• pricing',
        '',
        'may result in reduced visibility, suspension, or removal.',
      ],
    },
    {
      id: 'payments-escrow',
      heading: '6. Payments & Escrow',
      content: [
        '• Buyer payments are held in escrow',
        '• Funds are released to sellers after successful delivery or pickup',
        '• Fees may be deducted as disclosed',
        '',
        'Str3mly is **not a bank** and does not store full card details.',
      ],
    },
    {
      id: 'hyperlocal-services',
      heading: '7. Hyperlocal Services & Location Accuracy',
      content: [
        'Str3mly uses your provided location to:',
        '',
        '• display nearby sellers and products',
        '• estimate delivery times',
        '• expand search radius automatically when nearby availability is limited',
        '',
        'Search results may expand beyond your immediate area to find the **nearest available option**, similar to ride-hailing platforms.',
        '',
        'You are responsible for ensuring your address and pin location are accurate.',
      ],
      highlight: true,
    },
    {
      id: 'orders-cancellations',
      heading: '8. Orders, Cancellations & Refunds',
      content: [
        '• Cancellation policies vary by seller and order status',
        '• Refunds may be partial or full depending on circumstances',
        '• Abuse of refund systems may result in restrictions',
      ],
    },
    {
      id: 'reviews-content',
      heading: '9. Reviews & User Content',
      content: [
        'You retain ownership of content you submit but grant Str3mly a license to display it.',
        '',
        'Prohibited content includes:',
        '',
        '• false or misleading reviews',
        '• harassment or hate speech',
        '• attempts to manipulate ratings',
      ],
    },
    {
      id: 'whatsapp-channels',
      heading: '10. WhatsApp & Third-Party Channels',
      content: [
        'When using Str3mly via WhatsApp:',
        '',
        '• your messages are processed through WhatsApp\'s platform',
        '• WhatsApp\'s own terms and policies also apply',
        '',
        'We do not control WhatsApp\'s data practices.',
      ],
      highlight: true,
    },
    {
      id: 'prohibited-conduct',
      heading: '11. Prohibited Conduct',
      content: [
        'You may not:',
        '',
        '• attempt fraud',
        '• interfere with platform integrity',
        '• solicit off-platform payments',
        '• impersonate others',
      ],
    },
    {
      id: 'disclaimers',
      heading: '12. Disclaimers & Limitation of Liability',
      content: [
        'Str3mly provides the platform "as is".',
        'We are not liable for indirect or consequential damages to the fullest extent permitted by law.',
      ],
    },
    {
      id: 'termination',
      heading: '13. Termination',
      content: [
        'We may suspend or terminate access for violations of these Terms.',
      ],
    },
    {
      id: 'governing-law',
      heading: '14. Governing Law',
      content: [
        'These Terms are governed by the laws of **[Jurisdiction]**.',
      ],
    },
    {
      id: 'contact',
      heading: '15. Contact',
      content: [
        'Email: **legal@str3mly.com**',
      ],
    },
  ],
};

// Privacy Policy Content
const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  lastUpdated: LAST_UPDATED,
  version: '1.0.0',
  plainLanguageSummary: {
    title: 'In short:',
    points: [
      'We collect location to show nearby sellers',
      'We do **not sell your personal data**',
      'You control notifications and marketing',
      'Payments are handled securely by trusted providers',
    ],
  },
  tableOfContents: [
    'Information We Collect',
    'How We Use Information',
    'Location & Hyperlocal Data',
    'WhatsApp & Messaging Data',
    'Payments & Financial Data',
    'Sharing & Third Parties',
    'Data Retention',
    'Your Rights',
    'Security',
    'Contact',
  ],
  sections: [
    {
      id: 'information-collected',
      heading: '1. Information We Collect',
      content: [
        '### Personal Information',
        '',
        '• name',
        '• phone number',
        '• email address',
        '',
        '### Location Information',
        '',
        '• delivery addresses',
        '• GPS or shared pin locations',
        '',
        '### Usage Information',
        '',
        '• searches',
        '• orders',
        '• interactions with sellers',
      ],
    },
    {
      id: 'how-we-use',
      heading: '2. How We Use Information',
      content: [
        'We use your information to:',
        '',
        '• operate the marketplace',
        '• show hyperlocal availability',
        '• process payments',
        '• provide support',
        '• improve platform quality',
      ],
    },
    {
      id: 'location-hyperlocal',
      heading: '3. Location & Hyperlocal Data',
      content: [
        'Location data allows us to:',
        '',
        '• show nearby products',
        '• calculate delivery distances',
        '• expand search radius when needed',
        '',
        'We use **aggregated geographic indexing techniques** to improve performance and privacy.',
      ],
      highlight: true,
    },
    {
      id: 'whatsapp-messaging',
      heading: '4. WhatsApp & Messaging Data',
      content: [
        'When you interact via WhatsApp:',
        '',
        '• messages are processed to fulfill requests',
        '• metadata may be received from WhatsApp',
        '',
        'You can stop WhatsApp interactions at any time by messaging **STOP**.',
      ],
      highlight: true,
    },
    {
      id: 'payments-financial',
      heading: '5. Payments & Financial Data',
      content: [
        '• payment processing is handled by third-party providers',
        '• Str3mly does not store full card numbers',
      ],
    },
    {
      id: 'sharing-third-parties',
      heading: '6. Sharing & Third Parties',
      content: [
        'We share data only with:',
        '',
        '• sellers (for order fulfillment)',
        '• delivery partners',
        '• payment processors',
        '• analytics providers',
      ],
    },
    {
      id: 'data-retention',
      heading: '7. Data Retention',
      content: [
        'We retain data only as long as necessary for:',
        '',
        '• legal obligations',
        '• dispute resolution',
        '• platform operation',
      ],
    },
    {
      id: 'your-rights',
      heading: '8. Your Rights',
      content: [
        'You may:',
        '',
        '• request access to your data',
        '• request deletion',
        '• update preferences',
        '• opt out of marketing',
      ],
    },
    {
      id: 'security',
      heading: '9. Security',
      content: [
        'We use:',
        '',
        '• encryption',
        '• access controls',
        '• secure infrastructure',
      ],
    },
    {
      id: 'contact-privacy',
      heading: '10. Contact',
      content: [
        'Email: **privacy@str3mly.com**',
      ],
    },
  ],
};

// Community Guidelines Content
const COMMUNITY_GUIDELINES = {
  title: 'Community Guidelines',
  lastUpdated: LAST_UPDATED,
  version: '1.0.0',
  openingStatement: 'Str3mly is built on **trust between neighbors**. These guidelines help keep our community safe, fair, and respectful.',
  sections: [
    {
      id: 'our-promise',
      heading: 'Our Promise',
      content: [
        'Str3mly is built on **trust between neighbors**.',
        '',
        'These guidelines help keep our community safe, fair, and respectful.',
      ],
    },
    {
      id: 'what-we-encourage',
      heading: 'What We Encourage',
      content: [
        '• honest reviews',
        '• accurate listings',
        '• respectful communication',
        '• timely order preparation',
      ],
    },
    {
      id: 'whats-not-allowed',
      heading: 'What\'s Not Allowed',
      content: [
        '### Reviews',
        '',
        '• fake or incentivized reviews',
        '• review manipulation',
        '',
        '### Sellers',
        '',
        '• false stock levels',
        '• misleading location claims',
        '• requesting off-platform payments',
        '',
        '### Buyers',
        '',
        '• harassment',
        '• fraudulent refunds',
        '• repeated no-shows',
        '',
        '### Messaging (including WhatsApp)',
        '',
        '• spam',
        '• threats',
        '• solicitation',
      ],
    },
    {
      id: 'enforcement',
      heading: 'Enforcement',
      content: [
        'Violations may result in:',
        '',
        '• warnings',
        '• temporary restrictions',
        '• permanent removal',
        '',
        'You may appeal decisions through support.',
      ],
    },
    {
      id: 'reporting',
      heading: 'Reporting',
      content: [
        'If something feels wrong:',
        '',
        '• report directly in the app',
        '• report via WhatsApp',
        '• contact support',
      ],
    },
  ],
};

// Licenses Content
const LICENSES = {
  title: 'Licenses',
  lastUpdated: LAST_UPDATED,
  version: '1.0.0',
  introduction: 'Str3mly uses open-source and third-party software. Below is a non-exhaustive list:',
  licenses: [
    {
      name: 'Uber H3',
      version: '^4.0.0',
      license: 'Apache 2.0',
      description: 'Used for geographic indexing and hyperlocal discovery.',
      licenseText: `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright (c) 2018 Uber Technologies, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`,
    },
    {
      name: 'React Native',
      version: '^18.0.0',
      license: 'MIT',
      description: 'Used for mobile application development.',
      licenseText: `MIT License

Copyright (c) Facebook, Inc. and its affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    },
    {
      name: 'OpenStreetMap',
      version: 'N/A',
      license: 'Open Database License (ODbL)',
      description: 'Used for mapping and location visualization.',
      licenseText: `Open Database License (ODbL)

You are free to:
- Share: copy, distribute and use the database
- Create: produce works from the database
- Adapt: modify, transform and build upon the database

As long as you:
- Attribute: You must attribute any public use of the database, or works produced from the database
- Share-Alike: If you publicly use any adapted version of this database, or works produced from an adapted database, you must also offer that adapted database under the ODbL
- Keep open: If you redistribute the database, or an adapted version of it, then you may use technological measures that restrict the work (such as DRM) as long as you also redistribute a version without such measures

For full license text, visit: https://opendatacommons.org/licenses/odbl/`,
    },
    {
      name: 'Stripe SDK',
      version: '^2.0.0',
      license: 'MIT',
      description: 'Used for secure payment processing.',
      licenseText: `MIT License

Copyright (c) Stripe, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    },
    {
      name: 'Firebase',
      version: '^10.0.0',
      license: 'Apache 2.0',
      description: 'Used for messaging and infrastructure services.',
      licenseText: `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright (c) Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`,
    },
    {
      name: 'WhatsApp Business API',
      version: 'N/A',
      license: 'Meta Platforms Terms',
      description: 'Used for conversational commerce and notifications.',
      licenseText: `WhatsApp Business API is provided by Meta Platforms, Inc. and is subject to WhatsApp's Terms of Service and Privacy Policy.

For more information, visit: https://developers.facebook.com/docs/whatsapp/cloud-api`,
    },
  ],
};

export class LegalController {
  /**
   * Get Terms of Service
   */
  getTerms(req, res) {
    return sendSuccess(res, TERMS_OF_SERVICE, 'Terms of Service loaded');
  }

  /**
   * Get Privacy Policy
   */
  getPrivacy(req, res) {
    return sendSuccess(res, PRIVACY_POLICY, 'Privacy Policy loaded');
  }

  /**
   * Get Community Guidelines
   */
  getCommunityGuidelines(req, res) {
    return sendSuccess(res, COMMUNITY_GUIDELINES, 'Community Guidelines loaded');
  }

  /**
   * Get Licenses
   */
  getLicenses(req, res) {
    return sendSuccess(res, LICENSES, 'Licenses loaded');
  }

  /**
   * Get all legal documents (for listing page)
   */
  getAllDocuments(req, res) {
    const documents = [
      {
        id: 'terms',
        title: TERMS_OF_SERVICE.title,
        lastUpdated: TERMS_OF_SERVICE.lastUpdated,
        description: 'Rights, responsibilities, and boundaries for buyers, sellers, and the platform',
      },
      {
        id: 'privacy',
        title: PRIVACY_POLICY.title,
        lastUpdated: PRIVACY_POLICY.lastUpdated,
        description: 'How we collect, use, and protect your personal information',
      },
      {
        id: 'community-guidelines',
        title: COMMUNITY_GUIDELINES.title,
        lastUpdated: COMMUNITY_GUIDELINES.lastUpdated,
        description: 'Behavioral expectations to keep the community safe and respectful',
      },
      {
        id: 'licenses',
        title: LICENSES.title,
        lastUpdated: LICENSES.lastUpdated,
        description: 'Open-source libraries and third-party services we use',
      },
    ];

    return sendSuccess(res, documents, 'Legal documents list loaded');
  }

  /**
   * Search within legal documents
   */
  searchDocuments(req, res) {
    const { q, type } = req.query;
    const query = (q || '').toString().toLowerCase().trim();

    if (!query) {
      return sendError(res, 'Search query is required', 400);
    }

    // Determine which document(s) to search
    let documentsToSearch = [];
    if (type) {
      switch (type) {
        case 'terms':
          documentsToSearch = [{ type: 'terms', data: TERMS_OF_SERVICE }];
          break;
        case 'privacy':
          documentsToSearch = [{ type: 'privacy', data: PRIVACY_POLICY }];
          break;
        case 'community-guidelines':
          documentsToSearch = [{ type: 'community-guidelines', data: COMMUNITY_GUIDELINES }];
          break;
        case 'licenses':
          documentsToSearch = [{ type: 'licenses', data: LICENSES }];
          break;
        default:
          documentsToSearch = [
            { type: 'terms', data: TERMS_OF_SERVICE },
            { type: 'privacy', data: PRIVACY_POLICY },
            { type: 'community-guidelines', data: COMMUNITY_GUIDELINES },
          ];
      }
    } else {
      documentsToSearch = [
        { type: 'terms', data: TERMS_OF_SERVICE },
        { type: 'privacy', data: PRIVACY_POLICY },
        { type: 'community-guidelines', data: COMMUNITY_GUIDELINES },
      ];
    }

    const results = [];

    documentsToSearch.forEach(({ type, data }) => {
      if (data.sections) {
        data.sections.forEach((section) => {
          const sectionText = `${section.heading} ${Array.isArray(section.content) ? section.content.join(' ') : section.content}`.toLowerCase();
          if (sectionText.includes(query)) {
            results.push({
              documentType: type,
              documentTitle: data.title,
              sectionId: section.id,
              sectionHeading: section.heading,
              matches: section.content.filter((line) =>
                line.toLowerCase().includes(query)
              ),
            });
          }
        });
      }
    });

    return sendSuccess(res, results, 'Search results loaded');
  }
}
