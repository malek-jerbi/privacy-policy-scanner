const formDiv = document.getElementById("form");
const appDiv = document.getElementById("app");
const container = document.getElementById("privacy-summary-container");

document.addEventListener("DOMContentLoaded", () => {
  // Save API Key to localStorage and make API call
  const saveButton = document.getElementById("saveKey");
  const keyField = document.getElementById("key");

  saveButton.addEventListener("click", () => {
    const apiKey = keyField.value.trim();

    if (isValidApiKey(apiKey)) {
      localStorage.setItem("apiKey", apiKey);

      formDiv.classList.add("hidden");
      appDiv.classList.remove("hidden");

      makeApiRequest(apiKey);
    } else {
      console.error("Invalid API Key.");
      statusMessage.textContent = "Please enter a valid API Key.";
    }
  });

  /* check if API key is already stored in localStorage. 
  If it is, skip the form and make API call right away. 
  If it's not, proceed as usual. */
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
    console.error("Error validating API Key:", error);
    return false;
  }
}

// Updated makeApiRequest with proper response handling
function makeApiRequest(apiKey) {
  chrome.runtime.sendMessage(
    { action: "apiKeySet", apiKey: apiKey },
    (response) => {
      if (response) {
        console.log("Response from background script:", response.text);
        displaySummaryOnPage(response.text);
      } else {
        console.log("Error. No data came background script");
      }
    }
  );
}

// Function to display the summary on the page
function displaySummaryOnPage(summaryData) {
  const summaryContainer = document.getElementById("summary");

  summaryContainer.innerHTML = "";

  const parsedSummaryData = JSON.parse(summaryData);

  // Add Overall Rating with star emojis at the top
  if (parsedSummaryData.overall_rating !== undefined) {
    const ratingText = document.createElement("p");
  
    // Create star emojis based on the rating
    const stars = "⭐️".repeat(parsedSummaryData.overall_rating) + "☆".repeat(5 - parsedSummaryData.overall_rating);
    ratingText.textContent = `Overall Rating: ${stars} (${parsedSummaryData.overall_rating} / 5)`;
  
    ratingText.style.fontWeight = "bold";
    ratingText.style.marginTop = "10px";
    ratingText.style.color = getColorFromScore(parsedSummaryData.overall_rating);
    
    // Prepend the rating to the summary container
    summaryContainer.appendChild(ratingText);
  }

  // Add the analysis sections
  const analysis = parsedSummaryData.analysis;

  if (analysis && Array.isArray(analysis)) {
    analysis.forEach((item) => {
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

      // Color-code the explanation based on the score
      const score = item.details.score;
      explanationText.style.color = getColorFromScore(score);

      // Append elements
      sectionDiv.appendChild(sectionTitle);
      sectionDiv.appendChild(summaryText);
      sectionDiv.appendChild(scoreText);
      sectionDiv.appendChild(explanationText);

      summaryContainer.appendChild(sectionDiv);
    });
  }

  // Add the overall summary
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

  // Add Pros and Cons
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
}

// Helper function to get color based on score
function getColorFromScore(score) {
  // Map score to color: 1 (red) to 5 (green)
  const colors = {
    1: "#FF0000", // Red
    2: "#FF6347", // Tomato
    3: "#FFA500", // Orange
    4: "#9ACD32", // YellowGreen
    5: "#008000", // Green
  };
  return colors[score] || "#000000"; // Default to black if score is out of range
}
