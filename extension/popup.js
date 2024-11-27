const formDiv = document.getElementById("form");
const appDiv = document.getElementById("app");
const container = document.getElementById("privacy-summary-container");

document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveKey");
  const keyField = document.getElementById("key");
  const findPolicyButton = document.getElementById("findPolicyButton");
  const analyzeCurrentButton = document.getElementById("analyzeCurrentButton");

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
    const summaryContainer = document.getElementById("summary");
    summaryContainer.innerHTML = "Searching for privacy policy...";
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "findPrivacyPolicy" },
        (response) => {
          if (response && response.link) {
            summaryContainer.innerHTML = "Analyzing privacy policy...";
            chrome.tabs.update(tabs[0].id, { url: response.link });
            listenForPageLoad(apiKey, tabs[0].id);
          } else {
            summaryContainer.innerHTML = "Privacy Policy not found on this page.";
          }
        }
      );
    });
  });

  // Analyze Current Page Button
  analyzeCurrentButton.addEventListener("click", () => {
    const summaryContainer = document.getElementById("summary");
    summaryContainer.innerHTML = "Analyzing current page...";
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      analyzeCurrentPage(apiKey, tabs[0].id);
    });
  });
});

function listenForPageLoad(apiKey, tabId) {
  chrome.tabs.onUpdated.addListener(function listener(tabIdUpdated, changeInfo) {
    if (tabIdUpdated === tabId && changeInfo.status === "complete") {
      chrome.tabs.onUpdated.removeListener(listener);
      analyzeCurrentPage(apiKey, tabId);
    }
  });
}

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

// Helper function to get color based on score
function getColorFromScore(score) {
  const colors = {
    0: "#FF0000", // Red
    1: "#FF0000", // Red
    2: "#FF6347", // Tomato
    3: "#FFA500", // Orange
    4: "#9ACD32", // YellowGreen
    5: "#008000", // Green
  };
  return colors[score] || "#000000"; // Default to black if score is out of range
}

function displaySummaryOnPage(summaryData) {
  const summaryContainer = document.getElementById("summary");
  summaryContainer.innerHTML = "";

  try {
    const parsedSummaryData = JSON.parse(summaryData);

    // Overall Rating with stars and color
    if (parsedSummaryData.overall_rating !== undefined) {
      const ratingText = document.createElement("p");
      const stars = "⭐️".repeat(parsedSummaryData.overall_rating) + 
                   "☆".repeat(5 - parsedSummaryData.overall_rating);
      ratingText.textContent = `Overall Rating: ${stars} (${parsedSummaryData.overall_rating} / 5)`;
      ratingText.style.fontWeight = "bold";
      ratingText.style.marginTop = "10px";
      ratingText.style.color = getColorFromScore(parsedSummaryData.overall_rating);
      summaryContainer.appendChild(ratingText);
    }

    // Analysis sections
    (parsedSummaryData.analysis || []).forEach((item) => {
      const sectionDiv = document.createElement("div");
      sectionDiv.style.marginBottom = "15px";

      const sectionTitle = document.createElement("h3");
      sectionTitle.textContent = item.section;
      sectionTitle.style.fontSize = "15px";
      sectionTitle.style.margin = "0 0 5px 0";

      const summaryText = document.createElement("p");
      summaryText.textContent = `Summary: ${item.details.summary}`;
      summaryText.style.margin = "5px 0";

      const scoreText = document.createElement("p");
      scoreText.textContent = `Score: ${item.details.score} / 5`;
      scoreText.style.margin = "5px 0";

      const explanationText = document.createElement("p");
      explanationText.textContent = `Explanation: ${item.details.explanation}`;
      explanationText.style.margin = "5px 0";
      explanationText.style.color = getColorFromScore(item.details.score);

      sectionDiv.appendChild(sectionTitle);
      sectionDiv.appendChild(summaryText);
      sectionDiv.appendChild(scoreText);
      sectionDiv.appendChild(explanationText);

      summaryContainer.appendChild(sectionDiv);
    });

    // Overall Summary
    if (parsedSummaryData.summary) {
      const overallSummaryTitle = document.createElement("h3");
      overallSummaryTitle.textContent = "Overall Summary";
      overallSummaryTitle.style.fontSize = "15px";
      overallSummaryTitle.style.margin = "10px 0 5px 0";

      const overallSummaryText = document.createElement("p");
      overallSummaryText.textContent = parsedSummaryData.summary;
      overallSummaryText.style.margin = "5px 0";

      summaryContainer.appendChild(overallSummaryTitle);
      summaryContainer.appendChild(overallSummaryText);
    }

    // Pros and Cons
    if (parsedSummaryData.pros_and_cons) {
      const prosConsDiv = document.createElement("div");
      prosConsDiv.style.marginTop = "10px";

      const prosTitle = document.createElement("h3");
      prosTitle.textContent = "Pros";
      prosTitle.style.fontSize = "15px";
      prosTitle.style.margin = "0 0 5px 0";

      const prosList = document.createElement("ul");
      prosList.style.margin = "0 0 10px 20px";

      parsedSummaryData.pros_and_cons.pros.forEach((pro) => {
        const proItem = document.createElement("li");
        proItem.textContent = pro;
        prosList.appendChild(proItem);
      });

      const consTitle = document.createElement("h3");
      consTitle.textContent = "Cons";
      consTitle.style.fontSize = "15px";
      consTitle.style.margin = "10px 0 5px 0";

      const consList = document.createElement("ul");
      consList.style.margin = "0 0 10px 20px";

      parsedSummaryData.pros_and_cons.cons.forEach((con) => {
        const conItem = document.createElement("li");
        conItem.textContent = con;
        consList.appendChild(conItem);
      });

      prosConsDiv.appendChild(prosTitle);
      prosConsDiv.appendChild(prosList);
      prosConsDiv.appendChild(consTitle);
      prosConsDiv.appendChild(consList);

      summaryContainer.appendChild(prosConsDiv);
    }
  } catch (error) {
    console.error("Error parsing summary data:", error);
  }
}