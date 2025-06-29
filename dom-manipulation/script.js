let quotes = [];

// Load quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      {
        text: "The best way to get started is to quit talking and begin doing.",
        category: "Motivation",
      },
      {
        text: "Life is what happens when you're busy making other plans.",
        category: "Life",
      },
      {
        text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        category: "Success",
      },
    ];
    saveQuotes(); // Store initial quotes
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display a random quote
function showRandomQuote() {
  const index = Math.floor(Math.random() * quotes.length);
  const quote = quotes[index];
  document.getElementById(
    "quoteDisplay"
  ).innerHTML = `<p>"${quote.text}"</p><small>Category: ${quote.category}</small>`;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Add a quote via input
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added!");
  }
}

// Create dynamic form for adding quotes
function createAddQuoteForm() {
  const container = document.getElementById("formContainer");

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const button = document.createElement("button");
  button.textContent = "Add Quote";
  button.onclick = addQuote;

  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(button);
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

// Import quotes from uploaded JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Expected an array.");
      }
    } catch (err) {
      alert("Error parsing JSON.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize
loadQuotes();
createAddQuoteForm();
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Optional: Show last viewed quote from sessionStorage
const last = sessionStorage.getItem("lastQuote");
if (last) {
  const quote = JSON.parse(last);
  document.getElementById(
    "quoteDisplay"
  ).innerHTML = `<p>"${quote.text}"</p><small>Category: ${quote.category}</small>`;
}
