let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Display a random quote
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available.";
    return;
  }

  const selectedCategory = localStorage.getItem("selectedCategory") || "all";
  const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.innerHTML = `<p>${randomQuote.text}</p><small>— ${randomQuote.category}</small>`;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  if (!text || !category) return alert("Both fields are required!");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  displayRandomQuote();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  postQuoteToServer(newQuote);
}

// Populate categories in the dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const filter = document.getElementById("categoryFilter");
  filter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
  });

  const last = localStorage.getItem("selectedCategory") || "all";
  filter.value = last;
}

// Filter quotes by category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  displayRandomQuote();
}

// Import from JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      displayRandomQuote();
      alert("Quotes imported successfully!");
    } catch (e) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Export to JSON
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    const newQuotes = data.slice(0, 3).map(post => ({
      text: post.title,
      category: "Server"
    }));
    quotes.push(...newQuotes);
    saveQuotes();
    populateCategories();
    displayRandomQuote();
    showNotification("Quotes synced with server!");
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

// Post new quote to server
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });
  } catch (e) {
    console.error("Post failed:", e);
  }
}

// Sync quotes periodically
function syncQuotes() {
  setInterval(() => {
    fetchQuotesFromServer();
  }, 30000);
}

// Notification system
function showNotification(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  div.style.position = "fixed";
  div.style.bottom = "20px";
  div.style.right = "20px";
  div.style.backgroundColor = "#4caf50";
  div.style.color = "white";
  div.style.padding = "10px";
  div.style.borderRadius = "4px";
  div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  displayRandomQuote();
  syncQuotes();
  document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
});
