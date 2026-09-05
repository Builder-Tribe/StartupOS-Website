/**
 * DupeScout Content Script
 * Injects subtle "✨ Find Dupe" badges onto product images across e-commerce websites.
 */

(function () {
  const PROCESSED_ATTR = 'data-dupescout-processed';

  // Do not automatically clutter social feeds or work tools (e.g. LinkedIn, Twitter, GitHub)
  const EXCLUDED_HOSTS = ['linkedin.com', 'twitter.com', 'x.com', 'github.com', 'youtube.com', 'facebook.com', 'mail.google.com'];
  const currentHost = window.location.hostname.toLowerCase();
  if (EXCLUDED_HOSTS.some(host => currentHost.includes(host))) {
    return; // Right-click context menu still works everywhere
  }

  function attachHoverBadges() {
    const images = Array.from(document.querySelectorAll('img')).filter(img => {
      if (img.hasAttribute(PROCESSED_ATTR)) return false;
      const rect = img.getBoundingClientRect();
      return rect.width >= 160 && rect.height >= 160; // Only target substantial product images
    });

    if (images.length === 0) return;

    // Batching DOM updates using requestAnimationFrame (Rule 6)
    const BATCH_SIZE = 10;
    let index = 0;

    function processBatch() {
      const end = Math.min(index + BATCH_SIZE, images.length);
      for (let i = index; i < end; i++) {
        const img = images[i];
        img.setAttribute(PROCESSED_ATTR, 'true');

        const parent = img.parentElement;
        if (!parent) continue;

        // Ensure relative positioning container
        const computedStyle = window.getComputedStyle(parent);
        if (computedStyle.position === 'static') {
          parent.style.position = 'relative';
        }
        parent.classList.add('dupescout-img-container');

        // Create Badge
        const badge = document.createElement('div');
        badge.className = 'dupescout-hover-badge';
        badge.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <circle cx="11" cy="11" r="3" fill="#f43f5e"></circle>
          </svg>
          <span>Find Dupe</span>
        `;

        badge.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const imageUrl = img.currentSrc || img.src;
          chrome.runtime.sendMessage({
            type: 'TRIGGER_VISUAL_SEARCH',
            payload: {
              imageUrl,
              pageUrl: window.location.href,
              sourceTitle: document.title
            }
          });
        });

        parent.appendChild(badge);
      }

      index = end;
      if (index < images.length) {
        requestAnimationFrame(processBatch);
      }
    }

    requestAnimationFrame(processBatch);
  }

  // Initial scan
  attachHoverBadges();

  // Re-scan dynamically on scroll / DOM changes (debounced)
  let timer;
  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(attachHoverBadges, 800);
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
