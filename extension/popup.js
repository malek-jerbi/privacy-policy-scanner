document.addEventListener('DOMContentLoaded', () => {
    const summaryDiv = document.getElementById('summary');
  
    function displaySummary(data) {
      summaryDiv.innerHTML = ''; // Clear previous content
      data.privacyPolicySummary.summary.forEach((item, index) => {
        const p = document.createElement('p');
        p.className = 'summary-item';
  
        const textSpan = document.createElement('span');
        textSpan.textContent = `${index + 1}. ${item.text}`;
  
        if (item.risky) {
          textSpan.classList.add('risky');
        } else {
          textSpan.classList.add('not-risky');
        }
  
        p.appendChild(textSpan);
        summaryDiv.appendChild(p);
      });
    }
  
    // Initial attempt to load summary
    chrome.storage.local.get(['privacyPolicySummary'], (data) => {
      console.log('Data retrieved from chrome.storage.local:', data);
  
      if (data.privacyPolicySummary && data.privacyPolicySummary.summary) {
        displaySummary(data);
      } else {
        summaryDiv.textContent = 'No summary available yet.';
      }
    });
  
    // Listen for changes in chrome.storage.local
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.privacyPolicySummary) {
        console.log('Storage changed:', changes);
  
        if (changes.privacyPolicySummary.newValue) {
          displaySummary({ privacyPolicySummary: changes.privacyPolicySummary.newValue });
        }
      }
    });
  });
  