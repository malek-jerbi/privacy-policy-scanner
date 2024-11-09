chrome.action.onClicked.addListener((tab) => {
    // Inject content script into the active tab when the extension icon is clicked
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['contentScript.js']
    });
  });
  
  // Listen for messages from the content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'processPrivacyPolicy' && message.text) {
      // Send the privacy policy text to the local LLM API
      fetch('http://127.0.0.1:8000/summarize_privacy_policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ privacy_policy: message.text })
      })
        .then(response => response.json())
        .then(data => {
          console.log('Received summary from LLM:', data);
  
          // Send the summary back to the content script
          chrome.tabs.sendMessage(sender.tab.id, { action: 'displaySummary', summary: data });
        })
        .catch(error => {
          console.error('Error communicating with LLM API:', error);
          // Send an error message back to content script
          chrome.tabs.sendMessage(sender.tab.id, { action: 'displayError', error: 'Failed to get summary from LLM.' });
        });
    }
  });
  