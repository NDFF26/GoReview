import { BusinessUser } from '../types/user';

/**
 * Utility to calculate accurate URLs for live deployments (e.g. GitHub Pages)
 */
export function getAppBaseUrl(): string {
  // Extract base URL from window.location, ignoring hash or query parameters
  const hrefWithoutHash = window.location.href.split('#')[0].split('?')[0];
  
  // Strip route suffixes if user is currently viewing a user or admin route
  const baseUrl = hrefWithoutHash
    .replace(/\/user\/.*$/i, '')
    .replace(/\/admin.*$/i, '')
    .replace(/\/$/, '');

  return baseUrl;
}

export function encodeUserParam(user: BusinessUser): string {
  try {
    // Compact representation to prevent overly long QR URLs
    const compact = {
      id: user.id,
      u: user.username,
      bn: user.businessName,
      t: user.tagline || '',
      g: user.googleReviewUrl || '',
      p: user.phone || '',
      w: user.whatsapp || user.phone || '',
      e: user.email || '',
      a: user.address || '',
      lg: user.logoUrl || '',
      dis: !!user.isDisabled
    };
    const jsonStr = JSON.stringify(compact);
    const base64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
    return base64;
  } catch (e) {
    console.error('Failed to encode user for URL:', e);
    return '';
  }
}

export function decodeUserParam(paramStr: string): Partial<BusinessUser> | null {
  try {
    const jsonStr = decodeURIComponent(atob(paramStr).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const compact = JSON.parse(jsonStr);
    if (!compact || !compact.u) return null;

    return {
      id: compact.id || `user_${Date.now()}`,
      username: compact.u,
      businessName: compact.bn || compact.u,
      tagline: compact.t || '',
      googleReviewUrl: compact.g || '',
      phone: compact.p || '',
      whatsapp: compact.w || compact.p || '',
      email: compact.e || '',
      address: compact.a || '',
      logoUrl: compact.lg || '',
      languages: ['English', 'Gujarati', 'Hindi'],
      reviewOptions: [
        { id: '1', text: 'Outstanding food, fast service, and great experience!', category: 'General' },
        { id: '2', text: 'Highly recommended! Superb quality and friendly staff.', category: 'Service' }
      ],
      enablePrivateFeedback: true,
      isDisabled: !!compact.dis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (e) {
    console.error('Failed to decode user param from URL:', e);
    return null;
  }
}

export function getUserFullUrls(userOrUsername: BusinessUser | string, attachPayload: boolean = false) {
  const baseUrl = getAppBaseUrl();
  const isObject = typeof userOrUsername === 'object' && userOrUsername !== null;
  const usernameStr = isObject ? userOrUsername.username : (userOrUsername as string);
  const clean = (usernameStr || '').trim().toLowerCase();

  let encodedQuery = '';
  if (isObject && attachPayload) {
    const encoded = encodeUserParam(userOrUsername);
    if (encoded) {
      encodedQuery = `?p=${encoded}`;
    }
  }

  // Clean, high-performance hash-based routes for GitHub Pages & QR code scanning
  // e.g. https://ndff26.github.io/GoReview/#/user/rectos-pizza-nikol
  const reviewUrlHash = `${baseUrl}/#/user/${clean}${encodedQuery}`;
  const contactUrlHash = `${baseUrl}/#/user/${clean}/contact${encodedQuery}`;

  const reviewUrlPath = `${baseUrl}/user/${clean}${encodedQuery}`;
  const contactUrlPath = `${baseUrl}/user/${clean}/contact${encodedQuery}`;

  return {
    baseUrl,
    reviewUrl: reviewUrlHash,
    contactUrl: contactUrlHash,
    reviewUrlPath,
    contactUrlPath
  };
}

