let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "The best way to predict the future is to create it.",
    category: "inspiration",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "life",
  },
  { text: "Talk is cheap. Show me the code.", category: "tech" },
];

// Load last category filter from localStorage
const lastFilter = localStorage.getItem("lastCategory") || "all";
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  document.getElementById("categoryFilter").value = lastFilter;
  filterQuotes();
});

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document
  .getElementById("categoryFilter")
  .addEventListener("change", filterQuotes);
document.getElementById("exportBtn").addEventListener("click", exportQuotes);
document
  .getElementById("importFile")
  .addEventListener("change", importFromJsonFile);

// Show a random quote
function showRandomQuote() {
  const filtered = getFilteredQuotes();
  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerHTML =
      "No quotes available for this category.";
    return;
  }
  const index = Math.floor(Math.random() * filtered.length);
  document.getElementById("quoteDisplay").innerHTML = filtered[index].text;
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document
    .getElementById("newQuoteCategory")
    .value.trim()
    .toLowerCase();
  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    postQuoteToServer(newQuote);
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate the category dropdown
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const selected = select.value;
  select.innerHTML = '<option value="all">All Categories</option>';
  const uniqueCategories = [...new Set(quotes.map((q) => q.category))];
  uniqueCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
  select.value = selected;
}

// Filter quotes based on category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastCategory", selected);
  showRandomQuote();
}

// Get quotes by filter
function getFilteredQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  return selected === "all"
    ? quotes
    : quotes.filter((q) => q.category === selected);
}

// Export quotes to JSON file
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
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch {
      alert("Failed to import quotes. Invalid file format.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Fetch from mock server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=5"
    );
    const data = await res.json();
    const serverQuotes = data.map((post) => ({
      text: post.title,
      category: "server",
    }));
    quotes.push(...serverQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    showSyncNotification("Quotes synced with server!");
  } catch (err) {
    console.error("Failed to fetch from server:", err);
  }
}

// Post new quote to server
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
    console.error("Failed to post to server:", err);
  }
}

// Sync with server every 60 seconds
function syncQuotes() {
  fetchQuotesFromServer();
}

// Display notification
function showSyncNotification(msg) {
  const notif = document.createElement("div");
  notif.textContent = msg;
  notif.style.position = "fixed";
  notif.style.bottom = "20px";
  notif.style.left = "50%";
  notif.style.transform = "translateX(-50%)";
  notif.style.background = "#28a745";
  notif.style.color = "white";
  notif.style.padding = "10px 20px";
  notif.style.borderRadius = "5px";
  notif.style.zIndex = "1000";
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

setInterval(syncQuotes, 60000); // sync every 60 seconds
