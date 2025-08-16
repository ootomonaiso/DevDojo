import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type {Options as PresetOptions, ThemeConfig as PresetThemeConfig} from '@docusaurus/preset-classic';

const config: Config = {
  title: 'DevDojo',
  tagline: 'プログラミング学習プラットフォーム',
  favicon: 'img/favicon.ico',
  url: 'https://ootomonaiso.github.io',
  baseUrl: '/DevDojo/',
  organizationName: 'ootomonaiso',
  projectName: 'DevDojo',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          editUrl:
            'https://github.com/ootomonaiso/ootomonaiso_strage',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/ootomonaiso/ootomonaiso_strage',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } as PresetOptions,
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'Linux',
        path: 'Linux',
        routeBasePath: 'Linux',
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl: 'https://github.com/ootomonaiso/ootomonaiso_strage',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'NetWork',
        path: 'NetWork',
        routeBasePath: 'NetWork',
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl: 'https://github.com/ootomonaiso/ootomonaiso_strage',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'SoftwareDesign',
        path: 'SoftwareDesign',
        routeBasePath: 'SoftwareDesign',
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl: 'https://github.com/ootomonaiso/ootomonaiso_strage',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'AICoding',
        path: 'AICoding',
        routeBasePath: 'AICoding',
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl: 'https://github.com/ootomonaiso/ootomonaiso_strage',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'AdvancedTech',
        path: 'AdvancedTech',
        routeBasePath: 'AdvancedTech',
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl: 'https://github.com/ootomonaiso/ootomonaiso_strage',
      },
    ],
  ],
  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: { defaultMode: 'dark' },
    navbar: {
      title: 'DevDojo',
      logo: { alt: 'logo', src: 'img/logo.svg' },
      items: [
        { to: '/docs/intro', position: 'left', label: 'ドキュメント' },
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/Linux/intro', position: 'left', label: 'Linux' },
        { to: '/NetWork/intro', position: 'left', label: 'NetWork' },
        { to: '/SoftwareDesign/intro', position: 'left', label: 'ソフトウェア設計' },
        { to: '/AICoding/intro', position: 'left', label: 'AIコーディング' },
        { to: '/AdvancedTech/intro', position: 'left', label: '応用技術' },
        { href: 'https://github.com/ootomonaiso', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'カテゴリ',
          items: [
            { label: 'Linux', to: '/Linux/intro' },
            { label: 'NetWork', to: '/NetWork/intro' },
            { label: 'ソフトウェア設計', to: '/SoftwareDesign/intro' },
            { label: 'AIコーディング', to: '/AICoding/intro' },
            { label: '応用技術', to: '/AdvancedTech/intro' },
          ],
        },
        {
          title: 'コミュニティ',
          items: [
            { label: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/docusaurus' },
            { label: 'Discord', href: 'https://discordapp.com/invite/docusaurus' },
            { label: 'X', href: 'https://x.com/docusaurus' },
          ],
        },
        {
          title: 'その他',
          items: [
            { label: 'Blog', to: '/blog' },
            { label: 'GitHub', href: 'https://github.com/ootomonaiso' },
          ],
        },
      ],
      copyright: ` © ${new Date().getFullYear()} DevDojo`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } as PresetThemeConfig,
};

export default config;
