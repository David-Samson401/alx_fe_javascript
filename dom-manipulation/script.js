// Initial quotes array
const quotes = [
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

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Show random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Clear and display
  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>Category: ${quote.category}</em></p>
  `;
}

// Add new quote from input
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text: quoteText, category: quoteCategory });

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// Bind event
newQuoteBtn.addEventListener("click", showRandomQuote);
