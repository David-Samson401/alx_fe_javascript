let quotes = [];

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote
function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  let filteredQuotes =
    category === "all" ? quotes : quotes.filter((q) => q.category === category);

  if (filteredQuotes.length === 0) return;

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>${filteredQuotes[randomIndex].text}</p><em>(${filteredQuotes[randomIndex].category})</em>`;

  sessionStorage.setItem("lastQuote", quoteDisplay.innerHTML);
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Please enter both quote and category.");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  postQuoteToServer(newQuote); // ✅ post to mock API
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

// Populate categories in the filter dropdown
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const selected = localStorage.getItem("selectedCategory") || "all";
  const categories = ["all", ...new Set(quotes.map((q) => q.category))];

  filter.innerHTML = categories
    .map(
      (cat) =>
        `<option value="${cat}" ${
          cat === selected ? "selected" : ""
        }>${cat}</option>`
    )
    .join("");
}

// Filter quotes by category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

// Export quotes as JSON
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error();
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON format.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ✅ Simulate fetching quotes from mock server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    const serverQuotes = data.slice(0, 5).map((post) => ({
      text: post.title,
      category: "server",
    }));

    quotes.push(...serverQuotes);
    saveQuotes();
    populateCategories();
    showNotification("Quotes synced from server!");
  } catch (err) {
    console.error("Fetch failed", err);
  }
}

// ✅ Simulate posting a quote to the server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: quote.text,
        body: quote.category,
        userId: 1,
      }),
    });

    const data = await response.json();
    console.log("Posted to server:", data);
    showNotification("Quote synced to server!");
  } catch (err) {
    console.error("Error posting quote:", err);
  }
}

// UI notification message
function showNotification(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.position = "fixed";
  note.style.bottom = "20px";
  note.style.right = "20px";
  note.style.background = "#444";
  note.style.color = "#fff";
  note.style.padding = "10px 20px";
  note.style.borderRadius = "5px";
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 3000);
}

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  showRandomQuote();

  // Restore last session quote
  const last = sessionStorage.getItem("lastQuote");
  if (last) document.getElementById("quoteDisplay").innerHTML = last;

  // Event listeners
  document
    .getElementById("newQuote")
    .addEventListener("click", showRandomQuote);
  document
    .getElementById("categoryFilter")
    .addEventListener("change", filterQuotes);
  document.getElementById("exportBtn").addEventListener("click", exportQuotes);
  document
    .getElementById("importFile")
    .addEventListener("change", importFromJsonFile);

  // Simulate fetch on load
  fetchQuotesFromServer();
});
