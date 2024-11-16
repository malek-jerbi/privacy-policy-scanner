// import { MAIN_PROMPT_TEMPLATE } from "./constants.js";

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["contentScript.js"],
  });
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message.action === "processPrivacyPolicy" &&
    message.text &&
    message.apiKey
  ) {
    const MAIN_PROMPT_TEMPLATE = `
You are a helpful assistant that reads privacy policies and provides a comprehensive analysis, summarizing the key points a user should be aware of.

**Format Requirements:**

- Return the analysis as a JSON object.
- Structure the JSON object as follows:

{
  "analysis": [
    {
      "section": "Section Title",
      "details": {
        "summary": "Summary of the section.",
        "score": Integer between 1 and 5,
        "explanation": "Brief explanation for the score."
      }
    },
    ...
  ],
  "summary": "Overall summary of the privacy policy.",
  "pros_and_cons": {
    "pros": [
      "Pro 1",
      "Pro 2",
      ...
    ],
    "cons": [
      "Con 1",
      "Con 2",
      ...
    ]
  },
  "overall_rating": Integer between 1 and 5
}

**Instructions:**

- **Analysis Section**: Break down the privacy policy into key sections such as:
  - "Data Collected"
  - "Purpose of Data Collection"
  - "Data Sharing with Third Parties"
  - "Data Sold to Third Parties"
  - "Opt-Out Options"
  - "Data Security"
  - "Data Deletion Rights"
  - "Policy Clarity"

- For each section, provide:
  - **Summary**: A concise summary of the key points.
  - **Score**: An integer between 1 and 5 evaluating the section.
  - **Explanation**: A brief explanation for the score given.

- **Summary**: Provide an overall summary of the privacy policy.
- **Pros and Cons**: List the advantages and disadvantages based on the analysis.
- **Overall Rating**: Provide an integer overall rating out of 5 for the privacy policy.

**Important Notes:**

- Ensure that all score fields are integers only (no decimal points or additional text).
- Place any explanations or comments in the explanation field, not with the score.
- Follow the JSON structure exactly to ensure compatibility with the frontend display.
- Please follow this structure closely to ensure the analysis is detailed and helpful.

**Privacy Policy:**
{{ privacy_policy }}

**JSON Analysis:**
`;

    const prompt = MAIN_PROMPT_TEMPLATE.replace(
      "{{privacy_policy}}",
      message.text
    );

    fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${message.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Received summary from LLM:", data);

        // Send the summary back to the content script
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "displaySummary",
          summary: data,
        });
      })
      .catch((error) => {
        console.error("Error communicating with LLM API:", error);
        // Send an error message back to content script
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "displayError",
          error: "Failed to get summary from LLM.",
        });
      });
  }
});
