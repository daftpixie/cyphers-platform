'use client';

/**
 * The Cyphers (punks.24hrmvp.xyz) - Analytics Hook
 * 
 * Provides type-safe event tracking for the NFT minting platform.
 * Uses Plausible Analytics self-hosted at analytics.24hrmvp.xyz
 */

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { usePlausible } from 'next-plausible';
import type { 
  CyphersEvent, 
  PropsForEvent,
  WalletEventProps,
  MintEventProps,
  GalleryEventProps,
  CypherViewProps,
  PortfolioEventProps,
  CTAClickProps,
  SocialLinkProps,
  ScrollDepthProps,
  CopyEventProps,
  ShareEventProps,
  MintStatus,
  RarityTier,
  MINT_STATUS_TO_EVENT,
} from '@/types/analytics';

// ============================================================================
// MAIN ANALYTICS HOOK
// ============================================================================

/**
 * Analytics hook for the Cyphers NFT platform
 * 
 * @example
 * ```tsx
 * const { trackWallet, trackMint, trackGallery } = useAnalytics();
 * 
 * // Track wallet connection
 * trackWallet('connected', { provider: 'dogelabs' });
 * 
 * // Track mint funnel
 * trackMint('AWAITING_PAYMENT', { sessionId: 'abc', paymentAmount: 100 });
 * ```
 */
export function useAnalytics() {
  const plausible = usePlausible();
  const pathname = usePathname();
  
  // Track scroll depth milestones
  const scrollMilestones = useRef<Set<number>>(new Set());
  
  // Track mint session timing
  const mintStartTime = useRef<number | null>(null);

  /**
   * Track any event with type-safe props
   */
  const trackEvent = useCallback(<E extends CyphersEvent>(
    eventName: E,
    props?: PropsForEvent<E>
  ) => {
    plausible(eventName, { props: props as Record<string, unknown> });
  }, [plausible]);

  // ===========================================================================
  // WALLET TRACKING
  // ===========================================================================

  /**
   * Track wallet connection events
   */
  const trackWallet = useCallback((
    action: 'started' | 'connected' | 'failed' | 'disconnected',
    props?: WalletEventProps
  ) => {
    const eventMap = {
      started: 'Wallet Connect Started',
      connected: 'Wallet Connected',
      failed: 'Wallet Connect Failed',
      disconnected: 'Wallet Disconnected',
    } as const;
    
    trackEvent(eventMap[action], props);
  }, [trackEvent]);

  // ===========================================================================
  // MINT FUNNEL TRACKING
  // ===========================================================================

  /**
   * Track mint funnel progression
   * Automatically calculates time spent in each stage
   */
  const trackMint = useCallback((
    status: MintStatus,
    props?: Omit<MintEventProps, 'duration'>
  ) => {
    // Calculate duration since mint started
    let duration: number | undefined;
    if (status === 'PENDING') {
      mintStartTime.current = Date.now();
    } else if (mintStartTime.current) {
      duration = Math.round((Date.now() - mintStartTime.current) / 1000);
    }
    
    // Reset timer on terminal states
    if (['CONFIRMED', 'FAILED', 'CANCELLED'].includes(status)) {
      mintStartTime.current = null;
    }

    const eventName = {
      PENDING: 'Mint Started',
      GENERATING: 'Mint Generating',
      AWAITING_PAYMENT: 'Mint Awaiting Payment',
      PAYMENT_RECEIVED: 'Mint Payment Submitted',
      INSCRIBING: 'Mint Inscribing',
      CONFIRMED: 'Mint Completed',
      FAILED: 'Mint Failed',
      CANCELLED: 'Mint Cancelled',
    }[status] as CyphersEvent;

    trackEvent(eventName, { ...props, duration });
  }, [trackEvent]);

  /**
   * Track mint page view
   */
  const trackMintPageView = useCallback(() => {
    trackEvent('Mint Page Viewed');
  }, [trackEvent]);

  // ===========================================================================
  // GALLERY TRACKING
  // ===========================================================================

  /**
   * Track gallery interactions
   */
  const trackGallery = useCallback((
    action: 'viewed' | 'filtered' | 'sorted' | 'search',
    props?: GalleryEventProps
  ) => {
    const eventMap = {
      viewed: 'Gallery Viewed',
      filtered: 'Gallery Filtered',
      sorted: 'Gallery Sorted',
      search: 'Gallery Search',
    } as const;
    
    trackEvent(eventMap[action], props);
  }, [trackEvent]);

  /**
   * Track Cypher card/detail views
   */
  const trackCypherView = useCallback((
    action: 'card' | 'detail',
    props: CypherViewProps
  ) => {
    const eventName = action === 'detail' ? 'Cypher Detail Opened' : 'Cypher Card Viewed';
    trackEvent(eventName, props);
  }, [trackEvent]);

  // ===========================================================================
  // PORTFOLIO TRACKING
  // ===========================================================================

  /**
   * Track portfolio views
   */
  const trackPortfolio = useCallback((props: PortfolioEventProps) => {
    if (props.ownedCount === 0) {
      trackEvent('Portfolio Empty State');
    } else {
      trackEvent('Portfolio Viewed', props);
    }
  }, [trackEvent]);

  // ===========================================================================
  // NAVIGATION TRACKING
  // ===========================================================================

  /**
   * Track CTA button clicks
   */
  const trackCTA = useCallback((
    button: string,
    location: CTAClickProps['location'],
    destination?: string
  ) => {
    trackEvent('CTA Clicked', { button, location, destination });
  }, [trackEvent]);

  /**
   * Track navigation link clicks
   */
  const trackNavLink = useCallback((
    target: string,
    source: 'header' | 'footer' | 'page' | 'cta'
  ) => {
    trackEvent('Nav Link Clicked', { target, source });
  }, [trackEvent]);

  /**
   * Track social link clicks
   */
  const trackSocial = useCallback((
    platform: SocialLinkProps['platform'],
    url: string
  ) => {
    trackEvent('Social Link Clicked', { platform, url });
  }, [trackEvent]);

  // ===========================================================================
  // ENGAGEMENT TRACKING
  // ===========================================================================

  /**
   * Track scroll depth milestones
   */
  const trackScrollDepth = useCallback((depth: ScrollDepthProps['depth']) => {
    if (!scrollMilestones.current.has(depth)) {
      scrollMilestones.current.add(depth);
      trackEvent('Scroll Depth', { depth, page: pathname });
    }
  }, [trackEvent, pathname]);

  /**
   * Track copy actions
   */
  const trackCopy = useCallback((
    type: CopyEventProps['type'],
    context: CopyEventProps['context']
  ) => {
    const eventName = type === 'inscription_id' ? 'Copy Inscription ID' : 'Copy Address';
    trackEvent(eventName, { type, context });
  }, [trackEvent]);

  /**
   * Track share actions
   */
  const trackShare = useCallback((
    cypherId: string,
    method: ShareEventProps['method']
  ) => {
    trackEvent('Share Cypher', { cypherId, method });
  }, [trackEvent]);

  // Reset scroll tracking on page change
  useEffect(() => {
    scrollMilestones.current.clear();
  }, [pathname]);

  return {
    // Core
    trackEvent,
    
    // Wallet
    trackWallet,
    
    // Mint funnel
    trackMint,
    trackMintPageView,
    
    // Gallery
    trackGallery,
    trackCypherView,
    
    // Portfolio
    trackPortfolio,
    
    // Navigation
    trackCTA,
    trackNavLink,
    trackSocial,
    
    // Engagement
    trackScrollDepth,
    trackCopy,
    trackShare,
  };
}

// ============================================================================
// SCROLL DEPTH TRACKER HOOK
// ============================================================================

/**
 * Hook that automatically tracks scroll depth milestones
 */
export function useScrollDepthTracker() {
  const { trackScrollDepth } = useAnalytics();
  const tracked = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      
      const scrollPercent = (window.scrollY / scrollHeight) * 100;
      const milestones = [25, 50, 75, 100] as const;
      
      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !tracked.current.has(milestone)) {
          tracked.current.add(milestone);
          trackScrollDepth(milestone);
        }
      }
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [trackScrollDepth]);
}

// ============================================================================
// PAGE VIEW TRACKER HOOK
// ============================================================================

/**
 * Hook that tracks page views with pathname
 */
export function usePageViewTracker() {
  const { trackEvent } = useAnalytics();
  const pathname = usePathname();
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== lastPathname.current) {
      lastPathname.current = pathname;
      trackEvent('Page Viewed', { page: pathname });
    }
  }, [pathname, trackEvent]);
}

// ============================================================================
// MINT SESSION TRACKER HOOK
// ============================================================================

/**
 * Hook that automatically tracks mint session status changes
 * 
 * @param status - Current mint session status
 * @param sessionData - Additional session data
 */
export function useMintTracker(
  status: MintStatus | null,
  sessionData?: {
    sessionId?: string;
    tokenId?: number;
    rarity?: RarityTier;
    paymentAmount?: number;
    progress?: number;
  }
) {
  const { trackMint } = useAnalytics();
  const lastStatus = useRef<MintStatus | null>(null);

  useEffect(() => {
    if (status && status !== lastStatus.current) {
      lastStatus.current = status;
      trackMint(status, sessionData);
    }
  }, [status, sessionData, trackMint]);
}

export default useAnalytics;
