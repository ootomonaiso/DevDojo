import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Linux学習用のサイドバー設定
 */
const sidebars: SidebarsConfig = {
  linuxSidebar: [
    'introduction',
    {
      type: 'category',
      label: 'コマンドライン',
      items: [
        'command-line/basics',
        'command-line/file-operations',
        'command-line/text-processing',
        'command-line/system-info',
      ],
    },
    {
      type: 'category',
      label: 'システム',
      items: [
        'system/user-management',
        'system/process-management',
        'system/package-management',
        'system/service-management',
      ],
    },
    {
      type: 'category',
      label: 'ネットワーク',
      items: [
        'network/configuration',
        'network/troubleshooting',
        'network/security',
      ],
    },
  ],
};

export default sidebars;