chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "processPrivacyPolicy") {
    // Extract the text content of the page
    const bodyText = document.body.innerText || "";

    if (bodyText.trim().length === 0) {
      alert("No text found on this page.");
      return;
    }

    // Send the text to the background script
    sendResponse({ text: bodyText });
  }
});
