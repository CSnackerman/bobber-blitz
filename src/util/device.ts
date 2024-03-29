export function isMobile() {
  const ua = navigator.userAgent;
  return ua.search(/android|mobile|iphone/i) !== -1;
}

export function getDeviceType() {
  return isMobile() ? 'mobile' : 'desktop';
}
