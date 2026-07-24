import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Markham FireBirds Wiki',
  tagline: 'FRC Team 7902 - Knowledge Base',
  favicon: 'img/favicon.ico',

  // Future flags
  future: {
    v4: true,
  },

  // Set the production url of your site here
  url: 'https://FRC7902.github.io',
  baseUrl: '/FireBirds-Wiki/',

  // GitHub pages deployment config
  organizationName: 'FRC7902',
  projectName: 'FireBirds-Wiki',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          path: 'docs',
          routeBasePath: 'docs',
          editUrl: undefined,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/logo.svg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Markham FireBirds',
      logo: {
        alt: 'FireBirds Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'wikiSidebar',
          position: 'left',
          label: 'Wiki',
        },
        {
          href: 'https://github.com/FRC7902/FireBirds-Wiki',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Wiki',
          items: [
            {
              label: 'Engineering',
              to: '/docs/category/engineering',
            },
            {
              label: 'Business',
              to: '/docs/category/business',
            },
            {
              label: 'Strategy',
              to: '/docs/category/strategy',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'FRC 7902',
              href: 'https://frc7902.ca',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/FRC7902/FireBirds-Wiki',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'The Blue Alliance',
              href: 'https://www.thebluealliance.com/team/7902',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Markham FireBirds, FRC Team 7902. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;