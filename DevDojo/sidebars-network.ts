import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * ネットワーク学習用のサイドバー設定
 */
const sidebars: SidebarsConfig = {
  networkSidebar: [
    'introduction',
    {
      type: 'category',
      label: 'プロトコル',
      items: [
        'protocols/tcp-ip',
        'protocols/http-https',
        'protocols/dns',
      ],
    },
    {
      type: 'category',
      label: '機器',
      items: [
        'equipment/router',
        'equipment/switch',
        'equipment/firewall',
      ],
    },
    {
      type: 'category',
      label: 'セキュリティ',
      items: [
        'security/basics',
        'security/encryption',
        'security/vpn',
      ],
    },
  ],
};

export default sidebars;