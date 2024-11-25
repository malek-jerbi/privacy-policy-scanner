const formDiv = document.getElementById("form");
const appDiv = document.getElementById("app");
const container = document.getElementById("privacy-summary-container");

document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveKey");
  const keyField = document.getElementById("key");
  const findPolicyButton = document.getElementById("findPolicyButton");

  saveButton.addEventListener("click", async () => {
    const apiKey = keyField.value.trim();

    if (await isValidApiKey(apiKey)) {
      localStorage.setItem("apiKey", apiKey);
      formDiv.classList.add("hidden");
      appDiv.classList.remove("hidden");
    } else {
      console.error("Invalid API Key.");
      const statusMessage = document.getElementById("keyStatus");
      statusMessage.textContent = "Please enter a valid API Key.";
    }
  });

  const apiKey = localStorage.getItem("apiKey");
  if (apiKey) {
    formDiv.classList.add("hidden");
    appDiv.classList.remove("hidden");
  }

  // Find Privacy Policy Button
  findPolicyButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "findPrivacyPolicy" },
        (response) => {
          if (response && response.link) {
            alert(`Privacy Policy Found: ${response.link}`);
            chrome.tabs.update(tabs[0].id, { url: response.link });
            listenForPageLoad(apiKey, tabs[0].id); // Start analysis after page load
          } else {
            alert("Privacy Policy not found on this page.");
          }
        }
      );
    });
  });
});

// Listen for page load after redirection
function listenForPageLoad(apiKey, tabId) {
  chrome.tabs.onUpdated.addListener(function listener(tabIdUpdated, changeInfo) {
    if (tabIdUpdated === tabId && changeInfo.status === "complete") {
      chrome.tabs.onUpdated.removeListener(listener); // Remove listener to avoid repeated calls
      analyzeCurrentPage(apiKey, tabId);
    }
  });
}

// Analyze the current page
function analyzeCurrentPage(apiKey, tabId) {
  chrome.tabs.sendMessage(
    tabId,
    { action: "processPrivacyPolicy" },
    (response) => {
      if (response && response.text) {
        makeApiRequest(apiKey, response.text);
      } else {
        alert("Failed to analyze the page. Please try again.");
      }
    }
  );
}

// Validate API Key
async function isValidApiKey(apiKey) {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return response.ok;
  } catch (error) {
    console.error("Error validating API Key:", error);
    return false;
  }
}

// Make API Request
function makeApiRequest(apiKey, policyContent) {
  chrome.runtime.sendMessage(
    { action: "apiKeySet", apiKey: apiKey, text: policyContent },
    (response) => {
      if (response) {
        console.log("Response from background script:", response.text);
        displaySummaryOnPage(response.text);
      } else {
        console.error("Error: No data received from the background script.");
      }
    }
  );
}

// Display Summary on Page
function displaySummaryOnPage(summaryData) {
  const summaryContainer = document.getElementById("summary");
  summaryContainer.innerHTML = "";

  try {
    const parsedSummaryData = JSON.parse(summaryData);

    if (parsedSummaryData.overall_rating !== undefined) {
      const ratingText = document.createElement("p");
      const stars =
        "⭐️".repeat(parsedSummaryData.overall_rating) +
        "☆".repeat(5 - parsedSummaryData.overall_rating);
      ratingText.textContent = `Overall Rating: ${stars} (${parsedSummaryData.overall_rating} / 5)`;
      ratingText.style.fontWeight = "bold";
      summaryContainer.appendChild(ratingText);
    }

    (parsedSummaryData.analysis || []).forEach((item) => {
      const sectionDiv = document.createElement("div");
      sectionDiv.style.marginBottom = "15px";

      const sectionTitle = document.createElement("h3");
      sectionTitle.textContent = item.section;

      const summaryText = document.createElement("p");
      summaryText.textContent = `Summary: ${item.details.summary}`;

      const scoreText = document.createElement("p");
      scoreText.textContent = `Score: ${item.details.score} / 5`;

      const explanationText = document.createElement("p");
      explanationText.textContent = `Explanation: ${item.details.explanation}`;

      sectionDiv.appendChild(sectionTitle);
      sectionDiv.appendChild(summaryText);
      sectionDiv.appendChild(scoreText);
      sectionDiv.appendChild(explanationText);

      summaryContainer.appendChild(sectionDiv);
    });
  } catch (error) {
    console.error("Error parsing summary data:", error);
  }
}
