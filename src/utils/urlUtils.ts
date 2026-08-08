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

export function getUserFullUrls(username: string) {
  const baseUrl = getAppBaseUrl();
  const clean = username.trim().toLowerCase();

  // Hash-based routes guarantee instant loading on GitHub Pages static hosting
  // e.g. https://ndff26.github.io/GoReview/#/user/velocityi2
  const reviewUrlHash = `${baseUrl}/#/user/${clean}`;
  const contactUrlHash = `${baseUrl}/#/user/${clean}/contact`;

  // Standard path-based routes
  const reviewUrlPath = `${baseUrl}/user/${clean}`;
  const contactUrlPath = `${baseUrl}/user/${clean}/contact`;

  return {
    baseUrl,
    reviewUrl: reviewUrlHash,
    contactUrl: contactUrlHash,
    reviewUrlPath,
    contactUrlPath
  };
}
