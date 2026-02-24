import ReactGA from 'react-ga4';

/**
 * Initialize Google Analytics 4
 * The Measurement ID should be provided via environment variables as VITE_GA_MEASUREMENT_ID
 */
export const initGA = () => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

    if (measurementId && measurementId !== 'G-XXXXXXXXXX') {
        ReactGA.initialize(measurementId);
        console.log('GA4 Initialized');
    } else {
        console.warn('GA4 Measurement ID not found or using placeholder. Analytics disabled.');
    }
};

/**
 * Track a page view
 * useful for SPAs with routing, even if this app is a single page
 */
export const trackPageView = (path: string) => {
    ReactGA.send({ hitType: 'pageview', page: path });
};

/**
 * Track a custom event
 */
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
    ReactGA.event({
        category,
        action,
        label,
        value,
    });
};

/**
 * Track search/filter interaction
 */
export const trackFilterChange = (filterName: string, value: any) => {
    // If value is an array (like features), stringify it or log the count
    const displayValue = Array.isArray(value) ? value.join(',') : String(value);

    trackEvent('Interaction', 'Filter Change', `${filterName}: ${displayValue}`);
};
