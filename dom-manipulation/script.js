let quotes = [];

// Load quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored
    ? JSON.parse(stored)
    : [
        {
          text: "Be yourself; everyone else is already taken.",
          category: "Motivation",
        },
        {
          text: "Two things are infinite: the universe and human stupidity.",
          category: "Humor",
        },
        { text: "So many books, so little time.", category: "Books" },
      ];
  saveQuotes(); // Save default if none exists
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display random quote
function showRandomQuote() {
  const filtered = getFilteredQuotes();
  const index = Math.floor(Math.random() * filtered.length);
  const quote = filtered[index];
  displayQuote(quote);

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Show quote in DOM
function displayQuote(quote) {
  if (!quote) {
    document.getElementById("quoteDisplay").innerHTML =
      "<p>No quotes found.</p>";
    return;
  }

  document.getElementById("quoteDisplay").innerHTML = `
    <p>"${quote.text}"</p>
    <small>Category: ${quote.category}</small>
  `;
}

// Filter quotes by selected category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  const filtered = getFilteredQuotes();

  const container = document.getElementById("quoteDisplay");
  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = "<p>No quotes for this category.</p>";
    return;
  }

  filtered.forEach((q) => {
    const div = document.createElement("div");
    div.innerHTML = `<p>"${q.text}"</p><small>Category: ${q.category}</small>`;
    container.appendChild(div);
  });
}

// Return filtered quotes array
function getFilteredQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  return selected === "all"
    ? quotes
    : quotes.filter((q) => q.category === selected);
}

// Populate unique categories in dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map((q) => q.category))];
  const select = document.getElementById("categoryFilter");

  // Keep existing selection
  const prev = localStorage.getItem("selectedCategory") || "all";

  // Clear current options
  select.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === prev) option.selected = true;
    select.appendChild(option);
  });
}

// Add quote from form
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

// Create add-quote form
function createAddQuoteForm() {
  const container = document.getElementById("formContainer");

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const catInput = document.createElement("input");
  catInput.type = "text";
  catInput.id = "newQuoteCategory";
  catInput.placeholder = "Enter quote category";

  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.onclick = addQuote;

  container.appendChild(textInput);
  container.appendChild(catInput);
  container.appendChild(btn);
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

// Import quotes from file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format");
      }
    } catch (err) {
      alert("Error reading file");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// === INIT ===
loadQuotes();
populateCategories();
createAddQuoteForm();
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Show last category
filterQuotes();
