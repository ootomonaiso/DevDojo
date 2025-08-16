import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'My Site',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'Linux',
        path: 'Linux',
        routeBasePath: 'Linux',
        sidebarPath: undefined, // 自動生成
        editUrl: 'https://github.com/ootomonaiso/ootomonaiso_strage',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'NetWork',
        path: 'NetWork',
        routeBasePath: 'NetWork',
        sidebarPath: undefined,
        editUrl: 'https://github.com/ootomonaiso/ootomonaiso_strage',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'SoftwareDesign',
        path: 'SoftwareDesign',
        routeBasePath: 'SoftwareDesign',
        sidebarPath: undefined,
        editUrl: 'https://github.com/ootomonaiso/ootomonaiso_strage',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'AICoding',
        path: 'AICoding',
        routeBasePath: 'AICoding',
        sidebarPath: undefined,
        editUrl: 'https://github.com/ootomonaiso/ootomonaiso_strage',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'AdvancedTech',
        path: 'AdvancedTech',
        routeBasePath: 'AdvancedTech',
        sidebarPath: undefined,
        editUrl: 'https://github.com/ootomonaiso/ootomonaiso_strage',
      },
    ],
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'My Site',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {to: '/Linux', label: 'Linux', position: 'left'},
        {to: '/NetWork', label: 'NetWork', position: 'left'},
        {to: '/SoftwareDesign', label: 'ソフトウェア設計', position: 'left'},
        {to: '/AICoding', label: 'AIコーディング', position: 'left'},
        {to: '/AdvancedTech', label: '応用技術', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/ootomonaiso/ootomonaiso_strage',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'カテゴリ',
          items: [
            {label: 'Linux', to: '/Linux'},
            {label: 'NetWork', to: '/NetWork'},
            {label: 'ソフトウェア設計', to: '/SoftwareDesign'},
            {label: 'AIコーディング', to: '/AICoding'},
            {label: '応用技術', to: '/AdvancedTech'},
          ],
        },
        {
          title: 'コミュニティ',
          items: [
            {label: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/docusaurus'},
            {label: 'Discord', href: 'https://discordapp.com/invite/docusaurus'},
            {label: 'X', href: 'https://x.com/docusaurus'},
          ],
        },
        {
          title: 'その他',
          items: [
            {label: 'Blog', to: '/blog'},
            {label: 'GitHub', href: 'https://github.com/ootomonaiso/ootomonaiso_strage'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
