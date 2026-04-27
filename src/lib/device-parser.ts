// Utility to parse user agent and extract device information
export const parseUserAgent = (userAgent: string) => {
  let device = 'Unknown';
  let browser = 'Unknown';
  let os = 'Unknown';

  // Parse Device Type
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    device = 'Mobile';
  } else if (/tablet|ipad|playbook|silk|kindle/i.test(userAgent)) {
    device = 'Tablet';
  } else if (/windows|macos|linux|x11/i.test(userAgent)) {
    device = 'Desktop';
  }

  // Parse Browser
  if (/edge|edg/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/chrome|crios/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/firefox|fxios/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/opr|opera/i.test(userAgent)) {
    browser = 'Opera';
  } else if (/msie|trident/i.test(userAgent)) {
    browser = 'Internet Explorer';
  }

  // Parse OS
  if (/windows nt 10.0/i.test(userAgent)) {
    os = 'Windows 10';
  } else if (/windows nt 11/i.test(userAgent)) {
    os = 'Windows 11';
  } else if (/windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/mac os x/i.test(userAgent)) {
    os = 'macOS';
  } else if (/android/i.test(userAgent)) {
    os = 'Android';
  } else if (/iphone|ios/i.test(userAgent)) {
    os = 'iOS';
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux';
  }

  return { device, browser, os };
};

// Extract IP address from request headers
export const getClientIp = (request: any): string => {
  const forwarded = request.headers?.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers?.get('x-real-ip') || 'Unknown';
  return ip;
};

// Extract user agent
export const getUserAgent = (request: any): string => {
  return request.headers?.get('user-agent') || 'Unknown';
};
