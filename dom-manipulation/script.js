// Quote data
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Stay hungry, stay foolish.", category: "inspiration" },
  {
    text: "Code is like humor. When you have to explain it, it’s bad.",
    category: "programming",
  },
];

// Load last selected filter
let lastFilter = localStorage.getItem("selectedCategory") || "all";

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const importFileInput = document.getElementById("importFile");

// Show random quote
function showRandomQuote() {
  const filteredQuotes = quotes.filter((q) =>
    lastFilter === "all" ? true : q.category === lastFilter
  );
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available in this category.</p>";
    return;
  }
  const quote =
    filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.innerHTML = `<p>${quote.text}</p><small>${quote.category}</small>`;
}

// Add quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Please enter both quote and category.");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate filter dropdown
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map((q) => q.category))];
  categoryFilter.innerHTML = "";
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    if (cat === lastFilter) opt.selected = true;
    categoryFilter.appendChild(opt);
  });
}

// Filter quotes
function filterQuotes() {
  lastFilter = categoryFilter.value;
  localStorage.setItem("selectedCategory", lastFilter);
  showRandomQuote();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");

      let added = 0;
      imported.forEach((q) => {
        if (!quotes.find((local) => local.text === q.text)) {
          quotes.push(q);
          added++;
        }
      });
      saveQuotes();
      populateCategories();
      alert(`${added} quotes imported successfully.`);
    } catch (err) {
      alert("Failed to import quotes.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Export quotes as JSON file
function exportToJson() {
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

// Show notification
function showNotification(msg) {
  const note = document.createElement("div");
  note.textContent = msg;
  note.style.position = "fixed";
  note.style.top = "10px";
  note.style.right = "10px";
  note.style.background = "#4caf50";
  note.style.color = "#fff";
  note.style.padding = "10px 20px";
  note.style.borderRadius = "5px";
  note.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  document.body.appendChild(note);
  setTimeout(() => document.body.removeChild(note), 3000);
}

// Fetch from mock server (simulated sync)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    const newQuotes = serverData.slice(0, 5).map((post) => ({
      text: post.title,
      category: "server",
    }));

    let added = 0;
    newQuotes.forEach((q) => {
      if (!quotes.find((local) => local.text === q.text)) {
        quotes.push(q);
        added++;
      }
    });

    if (added > 0) {
      saveQuotes();
      populateCategories();
      showNotification(`${added} new quotes synced from server.`);
    }
  } catch (error) {
    console.error("Error fetching from server:", error);
  }
}

// Set up event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);
importFileInput.addEventListener("change", importFromJsonFile);
document.getElementById("exportBtn")?.addEventListener("click", exportToJson);

// Init
populateCategories();
showRandomQuote();
fetchQuotesFromServer();
setInterval(fetchQuotesFromServer, 30000);
