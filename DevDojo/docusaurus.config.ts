import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'DevDojo',
  tagline: '開発するために必要な知識を身に着けるための資料',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://ootomonaiso.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/DevDojo/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'ootomonaiso', // Usually your GitHub org/user name.
  projectName: 'DevDojo', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/ootomonaiso/DevDojo/tree/main/DevDojo/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/ootomonaiso/DevDojo/tree/main/DevDojo/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'network',
        path: 'network-docs',
        routeBasePath: 'network',
        sidebarPath: require.resolve('./sidebars-network.ts'),
        editUrl: 'https://github.com/ootomonaiso/DevDojo/tree/main/DevDojo/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'linux',
        path: 'linux-docs',
        routeBasePath: 'linux',
        sidebarPath: require.resolve('./sidebars-linux.ts'),
        editUrl: 'https://github.com/ootomonaiso/DevDojo/tree/main/DevDojo/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'development',
        path: 'development-docs',
        routeBasePath: 'development',
        sidebarPath: require.resolve('./sidebars-development.ts'),
        editUrl: 'https://github.com/ootomonaiso/DevDojo/tree/main/DevDojo/',
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'DevDojo',
      logo: {
        alt: 'DevDojo Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'ドキュメント',
        },
        {
          type: 'dropdown',
          label: '学習コンテンツ',
          position: 'left',
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'networkSidebar',
              docsPluginId: 'network',
              label: 'ネットワーク',
            },
            {
              type: 'docSidebar',
              sidebarId: 'linuxSidebar',
              docsPluginId: 'linux',
              label: 'Linux',
            },
            {
              type: 'docSidebar',
              sidebarId: 'developmentSidebar',
              docsPluginId: 'development',
              label: '開発基礎',
            },
          ],
        },
        {to: '/blog', label: 'ブログ', position: 'left'},
        {
          href: 'https://github.com/ootomonaiso/DevDojo',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'ドキュメント',
          items: [
            {
              label: 'はじめに',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: '学習コンテンツ',
          items: [
            {
              label: 'ネットワーク',
              to: '/network/introduction',
            },
            {
              label: 'Linux',
              to: '/linux/introduction',
            },
            {
              label: '開発基礎',
              to: '/development/introduction',
            },
          ],
        },
        {
          title: 'リンク',
          items: [
            {
              label: 'ブログ',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/ootomonaiso/DevDojo',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} DevDojo. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
