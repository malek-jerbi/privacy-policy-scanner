chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "processPrivacyPolicy") {
    const bodyText = document.body.innerText || "";
    if (bodyText.trim().length === 0) {
      alert("No text found on this page.");
      sendResponse({ error: "No text found on this page." });
      return;
    }
    sendResponse({ text: bodyText });
  }

  if (message.action === "findPrivacyPolicy") {
    console.log("Searching for privacy policy link...");

    const links = Array.from(document.querySelectorAll("a"));

    const keywords = /privacy|policy|legal|data|terms|rights/i;

    const matchedLinks = links
      .filter((link) =>
        keywords.test(link.textContent) || keywords.test(link.href)
      )
      .sort((a, b) => {
        const aPriority = /privacy/i.test(a.href) ? 1 : 0;
        const bPriority = /privacy/i.test(b.href) ? 1 : 0;
        return bPriority - aPriority;
      });

    if (matchedLinks.length > 0) {
      const bestMatch = matchedLinks[0];
      console.log("Privacy Policy Found:", bestMatch.href);
      sendResponse({ link: bestMatch.href });
    } else {
      console.warn("Privacy Policy Not Found");
      sendResponse({ error: "Privacy Policy Not Found" });
    }
  }
});
