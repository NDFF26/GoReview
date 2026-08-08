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
      m: user.mapUrl || '',
      d: user.description || '',
      h: user.operatingHours || '',
      lg: user.logoUrl || '',
      cv: user.coverUrl || '',
      ig: user.instagram || '',
      fb: user.facebook || '',
      wb: user.website || '',
      yt: user.youtube || '',
      tw: user.twitter || '',
      li: user.linkedin || '',
      tp: user.topics || [],
      lan: user.languages || [],
      ro: user.reviewOptions || [],
      pf: !!user.enablePrivateFeedback,
      pfe: user.privateFeedbackEmail || '',
      pfp: user.privateFeedbackPhone || '',
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
      mapUrl: compact.m || '',
      description: compact.d || '',
      operatingHours: compact.h || '',
      logoUrl: compact.lg || '',
      coverUrl: compact.cv || '',
      instagram: compact.ig || '',
      facebook: compact.fb || '',
      website: compact.wb || '',
      youtube: compact.yt || '',
      twitter: compact.tw || '',
      linkedin: compact.li || '',
      topics: compact.tp || [],
      languages: compact.lan || ['English'],
      reviewOptions: compact.ro || [],
      enablePrivateFeedback: !!compact.pf,
      privateFeedbackEmail: compact.pfe || '',
      privateFeedbackPhone: compact.pfp || '',
      pageViews: 0,
      reviewClicks: 0,
      contactClicks: 0,
      isDisabled: !!compact.dis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (e) {
    console.error('Failed to decode user param from URL:', e);
    return null;
  }
}

export function getUserFullUrls(userOrUsername: BusinessUser | string) {
  const baseUrl = getAppBaseUrl();
  const isObject = typeof userOrUsername === 'object' && userOrUsername !== null;
  const usernameStr = isObject ? userOrUsername.username : (userOrUsername as string);
  const clean = (usernameStr || '').trim().toLowerCase();

  let encodedQuery = '';
  if (isObject) {
    const encoded = encodeUserParam(userOrUsername);
    if (encoded) {
      encodedQuery = `?p=${encoded}`;
    }
  }

  // Hash-based routes guarantee instant loading on GitHub Pages static hosting
  // e.g. https://ndff26.github.io/GoReview/#/user/rectos-pizza-nikol?p=...
  const reviewUrlHash = `${baseUrl}/#/user/${clean}${encodedQuery}`;
  const contactUrlHash = `${baseUrl}/#/user/${clean}/contact${encodedQuery}`;

  // Standard path-based routes
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

