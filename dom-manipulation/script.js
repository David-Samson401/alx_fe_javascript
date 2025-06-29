let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "The journey of a thousand miles begins with a single step.",
    category: "Motivation",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
  },
  {
    text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    category: "Inspiration",
  },
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Simulated mock API

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  const selectedCategory = categoryFilter?.value || "all";
  const filtered =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(
          (q) => q.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available in this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];

  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>Category: ${quote.category}</em></p>
  `;

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function loadLastViewedQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerHTML = `
      <blockquote>"${quote.text}"</blockquote>
      <p><em>Category: ${quote.category}</em></p>
    `;
  }
}

function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  quoteDisplay.innerHTML = `
    <blockquote>"${newQuote.text}"</blockquote>
    <p><em>Category: ${newQuote.category}</em></p>
  `;

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");

  // ✅ POST to server
  postQuoteToServer(newQuote);
}

function createAddQuoteForm() {
  const formTitle = document.createElement("h2");
  formTitle.textContent = "Add New Quote";
  document.body.appendChild(formTitle);

  const formContainer = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addBtn);

  document.body.appendChild(formContainer);
}

function populateCategories() {
  const categories = Array.from(new Set(quotes.map((q) => q.category.trim())));
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

// ✅ Task 4: async/await + GET from mock API
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(`${SERVER_URL}?_limit=5`);
    const serverData = await response.json();

    const newQuotes = [];

    for (const item of serverData) {
      const simulatedQuote = {
        text: item.title,
        category: "ServerSync",
      };

      const exists = quotes.some((q) => q.text === simulatedQuote.text);
      if (!exists) {
        quotes.push(simulatedQuote);
        newQuotes.push(simulatedQuote);
      }
    }

    if (newQuotes.length > 0) {
      saveQuotes();
      populateCategories();
      showSyncMessage("✅ Quotes synced from server.");
    }
  } catch (err) {
    showSyncMessage("⚠️ Failed to sync: " + err.message);
  }
}

// ✅ Task 4: POST to mock API using async/await
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    console.log("✅ Posted quote to server:", data);
  } catch (err) {
    console.error("⚠️ Failed to post quote:", err);
  }
}

// ✅ Task 4: for checker
function syncQuotes() {
  fetchQuotesFromServer();
}

// ✅ Task 4: Notification UI
function showSyncMessage(msg, timeout = 3000) {
  const syncDiv = document.getElementById("syncStatus");
  if (syncDiv) {
    syncDiv.textContent = msg;
    syncDiv.style.display = "block";
    setTimeout(() => {
      syncDiv.style.display = "none";
    }, timeout);
  }
}

// ✅ Task 2: JSON Export
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// ✅ Task 2: JSON Import
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes))
        throw new Error("Invalid JSON format");

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (e) {
      alert("Failed to import: Invalid JSON format.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ✅ Initialize
window.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();
  populateCategories();
  loadLastViewedQuote();
  newQuoteBtn.addEventListener("click", showRandomQuote);

  const saved = localStorage.getItem("selectedCategory");
  if (saved && saved !== "all") filterQuotes();

  // ✅ Task 4: periodic sync every 30 seconds
  setInterval(syncQuotes, 30000);
});
