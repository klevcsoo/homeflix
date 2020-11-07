export function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds / 60) - (h * 60);
  const s = seconds % m || 0;
  return `${ !h ? '' : `${ h }:` }${ m < 10 ? `0${ m }` : m }:${ s < 10 ? `0${ s }` : s }`;
};
