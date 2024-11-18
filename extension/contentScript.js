chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "processPrivacyPolicy") {
    const bodyText = document.body.innerText || "";
    if (bodyText.trim().length === 0) {
      alert("No text found on this page.");
      return;
    }
    sendResponse({ text: bodyText });
  }

  // Add functionality to find the privacy policy link
  if (message.action === "findPrivacyPolicy") {
    // Get all links on the page
    const links = Array.from(document.querySelectorAll("a"));

    // Filter links based on keywords
    const privacyPolicyLink = links.find((link) =>
      /privacy|policy|terms/i.test(link.textContent) || // Match link text
      /privacy|policy|terms/i.test(link.href) // Match URL
    );

    if (privacyPolicyLink) {
      console.log("Privacy Policy Found:", privacyPolicyLink.href);
      sendResponse({ link: privacyPolicyLink.href });
    } else {
      console.log("Privacy Policy Not Found");
      sendResponse({ link: null });
    }
  }
});
