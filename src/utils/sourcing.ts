export type SourcingPlatform = {
  id: 'aliexpress' | 'taobao' | '1688';
  name: string;
  short: string;
  logo: string;
  color: string;
  buildUrl: (query: string) => string;
};

export const SOURCING_PLATFORMS: SourcingPlatform[] = [
  {
    id: 'aliexpress',
    name: 'AliExpress',
    short: 'AE',
    logo: '/logo_aliexpress.png',
    color: '#ff4747',
    buildUrl: (q) => `https://vi.aliexpress.com/wholesale?SearchText=${encodeURIComponent(q.trim())}`,
  },
  {
    id: 'taobao',
    name: 'Taobao',
    short: '淘',
    logo: '/logo-taobao-512.png',
    color: '#ff4400',
    buildUrl: (q) => `https://s.taobao.com/search?q=${encodeURIComponent(q.trim())}`,
  },
  {
    id: '1688',
    name: '1688',
    short: '1688',
    logo: '/logo-1688-512.png',
    color: '#ff7300',
    buildUrl: (q) => `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(q.trim())}`,
  },
];

export const openSourcing = (platform: SourcingPlatform, query: string): void => {
  if (!query?.trim()) return;
  window.open(platform.buildUrl(query), '_blank', 'noopener,noreferrer');
};

export const openAllSourcing = (query: string): void => {
  SOURCING_PLATFORMS.forEach((p) => openSourcing(p, query));
};
