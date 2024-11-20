import { MAIN_PROMPT_TEMPLATE } from "./constants.js";

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "apiKeySet" && message.apiKey) {
    console.log("API Key received");

    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];

      if (!activeTab) {
        sendResponse({ error: "No active tab found." });
        return;
      }

      // Inject the content script
      chrome.scripting.executeScript(
        { target: { tabId: activeTab.id }, files: ["contentScript.js"] },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error injecting content script:",
              chrome.runtime.lastError.message
            );
            sendResponse({ error: chrome.runtime.lastError.message });
            return;
          }

          console.log("Content script injected successfully.");

          // Send message to content script to process privacy policy
          chrome.tabs.sendMessage(
            activeTab.id,
            { action: "processPrivacyPolicy" },
            (response) => {
              if (response?.error) {
                console.error("Content script error:", response.error);
                sendResponse({ error: response.error });
              } else {
                console.log("Received response from content script:", response);

                const prompt = MAIN_PROMPT_TEMPLATE.replace(
                  "{{privacy_policy}}",
                  response.text
                );

                // Make API call
                fetch("https://api.openai.com/v1/chat/completions", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${message.apiKey}`,
                  },
                  body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0,
                    response_format: { type: "json_object" },
                  }),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    let content = data.choices[0].message.content;

                    console.log("Received summary from LLM:", content);

                    // // Send the summary back to popup
                    sendResponse({ text: content || "No text found." });
                  });
              }
            }
          );
        }
      );
    });
  }

  return true; // asynchronous response
});
