import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ootomonaiso blog',
  tagline: '大友内装(粒)の技術ブログ',
  favicon: 'img/favicon.ico',
  url: 'https://ootomonaiso.github.io',
  baseUrl: '/',

  organizationName: 'ootomonaiso',
  projectName: 'ootomonaiso_strage',  

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/ootomonaiso/DevDojo/tree/main/pro/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/ootomonaiso/DevDojo/tree/main/pro/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  // plugins: [],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        defaultMode: 'dark'
      },
      navbar: {
        title: 'ootomonaiso blog',
        logo: {
          alt: 'logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: '/docs/intro',
            position: 'left',
            label: '自己紹介',
          },
          {
            to: '/blog',
            label: 'Blog', 
            position: 'left'
          },
          {
            to: '/NetWork/intro',
            position: 'left',
            label: 'NetWork',
          },
          {
            to: '/IT_gyoumu/intro',
            position: 'left',
            label: '業務用ITソフトウェア',
          },
          {
            to: '/yoshinashi/intro',
            position: 'left',
            label: 'よしなしこと',
          },
          {
            href: 'https://github.com/ootomonaiso',
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
                label: '自己紹介',
                to: '/docs/intro',
              },
              {
                label: 'NetWork',
                to: '/NetWork/intro',
              },
              {
                label: '業務用ITソフトウェア',
                to: '/IT_gyoumu/intro',
              },
            ],
          },
          {
            title: 'SNSアカウント',
            items: [
              {
                label: 'Twitter',
                href: 'https://x.com/ootomonaiso',
              },
              {
                label: 'Bluesky',
                href: 'https://bsky.app/profile/ootomonaiso.bsky.social',
              },
            ],
          },
          {
            title: 'その他',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/ootomonaiso',
              },
            ],
          },
        ],
        copyright: ` © ${new Date().getFullYear()} 大友内装(粒)`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
  // customFields: {},
  // clientModules: [],
};

export default config;
