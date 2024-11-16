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

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "displaySummary" && message.summary) {
    displaySummaryOnPage(message.summary);
  } else if (message.action === "displayError" && message.error) {
    alert(message.error);
  }
});

// Function to display the summary on the page
function displaySummaryOnPage(summaryData) {
  const summary = document.getElementById("summary");

  // Add the analysis sections
  const analysis = summaryData.analysis;

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
      scoreText.textContent = `Score: ${item.details.score}`;
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

      summary.appendChild(sectionDiv);
    });
  }

  // Add the overall summary
  if (summaryData.summary) {
    const overallSummaryTitle = document.createElement("h3");
    overallSummaryTitle.textContent = "Overall Summary";
    overallSummaryTitle.style.fontSize = "15px";
    overallSummaryTitle.style.margin = "10px 0 5px 0";

    const overallSummaryText = document.createElement("p");
    overallSummaryText.textContent = summaryData.summary;
    overallSummaryText.style.margin = "5px 0";

    summary.appendChild(overallSummaryTitle);
    summary.appendChild(overallSummaryText);
  }

  // Add Pros and Cons
  if (summaryData.pros_and_cons) {
    const prosConsDiv = document.createElement("div");
    prosConsDiv.style.marginTop = "10px";

    const prosTitle = document.createElement("h3");
    prosTitle.textContent = "Pros";
    prosTitle.style.fontSize = "15px";
    prosTitle.style.margin = "0 0 5px 0";

    const prosList = document.createElement("ul");
    prosList.style.margin = "0 0 10px 20px";

    summaryData.pros_and_cons.pros.forEach((pro) => {
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

    summaryData.pros_and_cons.cons.forEach((con) => {
      const conItem = document.createElement("li");
      conItem.textContent = con;
      consList.appendChild(conItem);
    });

    prosConsDiv.appendChild(prosTitle);
    prosConsDiv.appendChild(prosList);
    prosConsDiv.appendChild(consTitle);
    prosConsDiv.appendChild(consList);

    summary.appendChild(prosConsDiv);
  }

  // Add Overall Rating
  if (summaryData.overall_rating !== undefined) {
    const ratingText = document.createElement("p");
    ratingText.textContent = `Overall Rating: ${summaryData.overall_rating} / 5`;
    ratingText.style.fontWeight = "bold";
    ratingText.style.marginTop = "10px";
    ratingText.style.color = getColorFromScore(summaryData.overall_rating);

    summary.appendChild(ratingText);
  }

  // Append the summary to the body
  document.body.appendChild(summary);
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
