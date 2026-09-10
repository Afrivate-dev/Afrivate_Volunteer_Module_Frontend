/**
 * Load Google Analytics only after cookie consent.
 * Called when user accepts cookies (analytics is compulsory).
 */
const GA_ID = 'G-XDX60DZTG4';

let loaded = false;

export function loadGtagScript() {
  if (typeof window === 'undefined' || loaded) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
  loaded = true;
}
