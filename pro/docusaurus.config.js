import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '大友情報道場(仮)',
  tagline: 'インフラからアプリ制作まで幅広く学べる部員用技術勉強会のポータルページ',
  favicon: 'img/favicon.ico',
  url: 'https://ootomonaiso.github.io',
  baseUrl: '/',

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
