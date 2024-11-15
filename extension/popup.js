const openaiApiKey =
  "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";

const formDiv = document.getElementById("form");
const appDiv = document.getElementById("app");

/* check if API key is already stored in localStorage. 
  If it is, skip the form and make API call right away. 
  If it's not, proceed as usual. */
document.addEventListener("DOMContentLoaded", () => {
  localStorage.setItem("apiKey", openaiApiKey);
  const apiKey = localStorage.getItem("apiKey");
  if (apiKey) {
    formDiv.classList.add("hidden");
    appDiv.classList.remove("hidden");

    makeApiRequest(apiKey);
  }
});

// Check if API key is valid
async function isValidApiKey(apiKey) {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Save API Key to localStorage and make API call
saveKey.addEventListener("click", () => {
  const apiKey = apiKeyInput.value.trim();

  if (isValidApiKey(apiKey)) {
    localStorage.setItem("apiKey", apiKey);

    formDiv.classList.add("hidden");
    appDiv.classList.remove("hidden");

    makeApiRequest(apiKey);
  } else {
    statusMessage.textContent = "Please enter a valid API Key.";
  }
});

function makeApiRequest(apiKey) {
  chrome.runtime.sendMessage({ action: "apiKeySet", apiKey: apiKey });

  const summaryDiv = document.getElementById("summary");

  function displaySummary(data) {
    summaryDiv.innerHTML = ""; // Clear previous content
    data.privacyPolicySummary.summary.forEach((item, index) => {
      const p = document.createElement("p");
      p.className = "summary-item";

      const textSpan = document.createElement("span");
      textSpan.textContent = `${index + 1}. ${item.text}`;

      if (item.risky) {
        textSpan.classList.add("risky");
      } else {
        textSpan.classList.add("not-risky");
      }

      p.appendChild(textSpan);
      summaryDiv.appendChild(p);
    });
  }

  // Initial attempt to load summary
  chrome.storage.local.get(["privacyPolicySummary"], (data) => {
    console.log("Data retrieved from chrome.storage.local:", data);

    if (data.privacyPolicySummary && data.privacyPolicySummary.summary) {
      displaySummary(data);
    } else {
      summaryDiv.textContent = "No summary available yet.";
    }
  });

  // Listen for changes in chrome.storage.local
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.privacyPolicySummary) {
      console.log("Storage changed:", changes);

      if (changes.privacyPolicySummary.newValue) {
        displaySummary({
          privacyPolicySummary: changes.privacyPolicySummary.newValue,
        });
      }
    }
  });
}
