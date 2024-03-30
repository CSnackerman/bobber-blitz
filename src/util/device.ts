export function isMobile() {
  const ua = navigator.userAgent;
  return ua.search(/android|mobile|iphone/i) !== -1;
}

export type DeviceType = 'mobile' | 'desktop';

export function getDeviceType(): DeviceType {
  return isMobile() ? 'mobile' : 'desktop';
}

export function getDeviceOrientation() {
  return screen.orientation.type;
}
