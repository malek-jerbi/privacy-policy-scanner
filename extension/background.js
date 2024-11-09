// background.js

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
      // Inject content script into the active tab
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['contentScript.js']
      });
    }
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.privacyPolicyUrl) {
      // Fetch the privacy policy page
      fetch(message.privacyPolicyUrl)
        .then(response => response.text())
        .then(html => {
          // Strip HTML tags to get text content
          const textContent = stripHTML(html);
  
          // Send the privacy policy text to the local LLM API
          fetch('http://127.0.0.1:8000/summarize_privacy_policy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ privacy_policy: textContent })
          })
            .then(response => response.json())
            .then(data => {
              console.log('Received summary from LLM:', data);
              // Store the summary using chrome.storage
              chrome.storage.local.set({ privacyPolicySummary: data }, () => {
                console.log('Summary saved.');
              });
            })
            .catch(error => {
              console.error('Error communicating with LLM API:', error);
            });
        })
        .catch(error => {
          console.error('Error fetching privacy policy:', error);
        });
    }
  });
  
  // Function to strip HTML tags
  function stripHTML(html) {
    return html.replace(/<\/?[^>]+(>|$)/g, "");
  }
  
  