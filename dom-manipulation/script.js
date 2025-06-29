let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "The only limit is the one you set yourself.",
    category: "inspiration",
  },
  {
    text: "Code is like humor. When you have to explain it, it’s bad.",
    category: "tech",
  },
  { text: "Stay hungry, stay foolish.", category: "motivation" },
];

// Load last category filter
const lastCategory = localStorage.getItem("lastCategory") || "all";
window.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  document.getElementById("categoryFilter").value = lastCategory;
  filterQuotes();
  setInterval(syncQuotes, 60000); // Sync every 60s
});

// === Event Listeners ===
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document
  .getElementById("categoryFilter")
  .addEventListener("change", filterQuotes);
document.getElementById("exportBtn").addEventListener("click", exportQuotes);
document
  .getElementById("importFile")
  .addEventListener("change", importFromJsonFile);

// === Display random quote ===
function showRandomQuote() {
  const quotesToDisplay = getFilteredQuotes();
  if (quotesToDisplay.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "No quotes found.";
    return;
  }
  const index = Math.floor(Math.random() * quotesToDisplay.length);
  document.getElementById("quoteDisplay").innerHTML =
    quotesToDisplay[index].text;
}

// === Add new quote from input ===
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document
    .getElementById("newQuoteCategory")
    .value.trim()
    .toLowerCase();

  if (!text || !category) return;

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  postQuoteToServer(newQuote);
}

// === Save to local storage ===
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// === Populate dropdown ===
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const prev = select.value;
  select.innerHTML = '<option value="all">All Categories</option>';
  const unique = [...new Set(quotes.map((q) => q.category))];
  unique.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
  select.value = prev;
}

// === Filter quotes by category ===
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastCategory", selected);
  showRandomQuote();
}

// === Export as JSON ===
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

// === Import from JSON ===
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch {
      alert("Import failed. Invalid JSON.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// === Get filtered quotes array ===
function getFilteredQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  return selected === "all"
    ? quotes
    : quotes.filter((q) => q.category === selected);
}

// === Server Sync: fetch new quotes ===
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=5"
    );
    const serverQuotes = (await res.json()).map((post) => ({
      text: post.title,
      category: "server",
    }));
    quotes.push(...serverQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    showSyncNotification("Quotes synced with server!");
  } catch (error) {
    console.error("Error syncing:", error);
  }
}

// === Sync quotes wrapper ===
function syncQuotes() {
  fetchQuotesFromServer();
}

// === POST new quote to server ===
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quote),
    });
  } catch (err) {
    console.error("Failed to POST quote:", err);
  }
}

// === UI alert ===
function showSyncNotification(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #28a745; color: white; padding: 10px 20px;
    border-radius: 5px; z-index: 1000;
  `;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 3000);
}
