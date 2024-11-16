import { MAIN_PROMPT_TEMPLATE } from "./constants.js";

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "apiKeySet" && message.apiKey) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        chrome.tabs.sendMessage(
          activeTab.id,
          { action: "processPrivacyPolicy" },
          async (response) => {
            if (response && response.text) {
              const prompt = MAIN_PROMPT_TEMPLATE.replace(
                "{{privacy_policy}}",
                response.text
              );
              fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${message.apiKey}`,
                },
                body: JSON.stringify({
                  model: "gpt-4",
                  messages: [{ role: "user", content: prompt }],
                  max_completion_tokens: 800,
                  temperature: 0.2,
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  console.log("Received summary from LLM:", data);
                  // Send the summary back to the content script
                  chrome.tabs.sendMessage(activeTab.id, {
                    action: "displaySummary",
                    summary: data,
                  });
                })
                .catch((error) => {
                  console.error("Error communicating with LLM API:", error);
                  // Send an error message back to content script
                  // chrome.tabs.sendMessage(sender.tab.id, {
                  //   action: "displayError",
                  //   error: "Failed to get summary from LLM.",
                  // });
                });
            } else {
              console.error("No response from content script.");
            }
          }
        );
      }
    });
  }
});
