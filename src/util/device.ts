export function isMobile() {
  const ua = navigator.userAgent;
  return ua.search(/[Aa]ndroid|[Mm]obile|[Ii][Oo][Ss]/g) !== -1;
}

export function getDeviceType() {
  return isMobile() ? 'mobile' : 'desktop';
}
