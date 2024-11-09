// contentScript.js

(async () => {
    try {
      // Search for links that might be the privacy policy
      const links = Array.from(document.querySelectorAll('a[href]'));
      let privacyPolicyUrl = null;
  
      for (const link of links) {
        const href = link.getAttribute('href');
        const linkText = link.textContent.toLowerCase();
  
        if (
          linkText.includes('privacy policy') ||
          linkText.includes('privacy') ||
          linkText.includes('policy') ||
          href.toLowerCase().includes('privacy')
        ) {
          if (href.startsWith('http')) {
            privacyPolicyUrl = href;
          } else {
            // Handle relative URLs
            privacyPolicyUrl = new URL(href, window.location.origin).href;
          }
          break;
        }
      }
  
      if (privacyPolicyUrl) {
        // Send the URL to the background script
        chrome.runtime.sendMessage({ privacyPolicyUrl: privacyPolicyUrl });
      } else {
        console.log('Privacy policy not found on this site.');
      }
    } catch (error) {
      console.error('Error in content script:', error);
    }
  })();
  