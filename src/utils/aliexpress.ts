export const aliexpressSearchUrl = (query: string): string =>
  `https://vi.aliexpress.com/wholesale?SearchText=${encodeURIComponent(query.trim())}`;

export const openAliexpressSearch = (query: string): void => {
  if (!query?.trim()) return;
  window.open(aliexpressSearchUrl(query), '_blank', 'noopener,noreferrer');
};
