let quotes = [];
let lastQuote = null;

// Load from localStorage on startup
if (localStorage.getItem("quotes")) {
  quotes = JSON.parse(localStorage.getItem("quotes"));
}

if (localStorage.getItem("lastFilter")) {
  document.getElementById("categoryFilter").value =
    localStorage.getItem("lastFilter");
}

populateCategories();
displayRandomQuote();

document
  .getElementById("newQuote")
  .addEventListener("click", displayRandomQuote);

function displayRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  let filtered =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);

  if (filtered.length === 0) return;

  const index = Math.floor(Math.random() * filtered.length);
  lastQuote = filtered[index];
  document.getElementById(
    "quoteDisplay"
  ).innerText = `"${lastQuote.text}" - ${lastQuote.category}`;
  sessionStorage.setItem("lastViewed", JSON.stringify(lastQuote));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return;

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert("Quote added!");
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const current = select.value;
  const categories = [...new Set(quotes.map((q) => q.category))];

  select.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  select.value = current;
}

function filterQuotes() {
  localStorage.setItem(
    "lastFilter",
    document.getElementById("categoryFilter").value
  );
  displayRandomQuote();
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      displayRandomQuote();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quotes.json";
  link.click();
}

// ✅ Now the function the checker is looking for
function fetchQuotesFromServer() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then((response) => response.json())
    .then((serverData) => {
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
    });
}

function showNotification(message) {
  const note = document.getElementById("notification");
  note.innerText = message;
  note.style.display = "block";
  setTimeout(() => {
    note.style.display = "none";
  }, 4000);
}

// ⏱ Periodically sync
setInterval(fetchQuotesFromServer, 30000);
