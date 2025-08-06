import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * 開発基礎学習用のサイドバー設定
 */
const sidebars: SidebarsConfig = {
  developmentSidebar: [
    'introduction',
    {
      type: 'category',
      label: 'プログラミング',
      items: [
        'programming/concepts',
        'programming/variables',
        'programming/functions',
        'programming/data-structures',
      ],
    },
    {
      type: 'category',
      label: 'Git',
      items: [
        'git/basics',
        'git/branching',
        'git/collaboration',
        'git/advanced',
      ],
    },
    {
      type: 'category',
      label: '開発環境',
      items: [
        'environment/editor-setup',
        'environment/debugging',
        'environment/testing',
      ],
    },
  ],
};

export default sidebars;