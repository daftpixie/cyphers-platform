/**
 * The Cyphers (punks.24hrmvp.xyz) - Plausible Analytics Provider
 * 
 * Pre-configured wrapper for self-hosted Plausible Analytics.
 * Tracks to both punks.24hrmvp.xyz and the aggregate all.24hrmvp.xyz dashboard.
 */

import PlausibleProvider from 'next-plausible';

// ============================================================================
// CONFIGURATION
// ============================================================================

const PLAUSIBLE_CONFIG = {
  // Primary domain for this site
  domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'punks.24hrmvp.xyz',
  
  // Self-hosted Plausible instance
  customDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || 'https://analytics.24hrmvp.xyz',
  
  // Track outbound link clicks automatically
  trackOutboundLinks: true,
  
  // Track file downloads automatically  
  trackFileDownloads: true,
  
  // Only track in production
  enabled: process.env.NODE_ENV === 'production',
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Single-domain Plausible Analytics provider
 */
export function PlausibleAnalytics() {
  return (
    <PlausibleProvider
      domain={PLAUSIBLE_CONFIG.domain}
      customDomain={PLAUSIBLE_CONFIG.customDomain}
      selfHosted={true}
      trackOutboundLinks={PLAUSIBLE_CONFIG.trackOutboundLinks}
      trackFileDownloads={PLAUSIBLE_CONFIG.trackFileDownloads}
      enabled={PLAUSIBLE_CONFIG.enabled}
    />
  );
}

/**
 * Multi-domain Plausible Analytics provider
 * 
 * Tracks to both the site-specific dashboard AND the aggregate dashboard.
 */
export function PlausibleMultiDomain({ 
  domains = ['punks.24hrmvp.xyz', 'all.24hrmvp.xyz'] 
}: { 
  domains?: string[] 
}) {
  const multiDomain = domains.join(',');
  
  return (
    <PlausibleProvider
      domain={multiDomain}
      customDomain={PLAUSIBLE_CONFIG.customDomain}
      selfHosted={true}
      trackOutboundLinks={PLAUSIBLE_CONFIG.trackOutboundLinks}
      trackFileDownloads={PLAUSIBLE_CONFIG.trackFileDownloads}
      enabled={PLAUSIBLE_CONFIG.enabled}
    />
  );
}

/**
 * Development-enabled Plausible provider (for testing)
 * ⚠️ Only use for testing - will inflate production metrics!
 */
export function PlausibleDev() {
  return (
    <PlausibleProvider
      domain={PLAUSIBLE_CONFIG.domain}
      customDomain={PLAUSIBLE_CONFIG.customDomain}
      selfHosted={true}
      trackOutboundLinks={true}
      trackFileDownloads={true}
      enabled={true}
    />
  );
}

export default PlausibleAnalytics;
