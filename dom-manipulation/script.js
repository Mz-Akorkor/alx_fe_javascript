document.addEventListener('DOMContentLoaded', () => {
  // Storage keys
  const LOCAL_KEY = 'quotes';
  const SESSION_LAST_INDEX = 'lastViewedQuoteIndex';

  // Default quotes if no localStorage present
  let quotes = [
    { text: "The best way to predict the future is to create it.", category: "Motivation" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
    { text: "Do what you can, with what you have, where you are.", category: "Action" }
  ];

  // DOM elements
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const exportBtn = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');
  const clearStorageBtn = document.getElementById('clearStorage');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');

  // ---------- Utilities ----------
  // Save quotes array to localStorage
  function saveQuotes() {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
  }

  // Load quotes from localStorage if present
  function loadQuotes() {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          quotes = parsed;
        }
      } catch (err) {
        console.error('Failed to parse stored quotes:', err);
      }
    }
  }

  // Save last viewed index to sessionStorage
  function saveLastViewedIndex(index) {
    sessionStorage.setItem(SESSION_LAST_INDEX, String(index));
  }

  // Get last viewed index from sessionStorage (or null)
  function getLastViewedIndex() {
    const idx = sessionStorage.getItem(SESSION_LAST_INDEX);
    return idx === null ? null : parseInt(idx, 10);
  }

  // ---------- Core features ----------
  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteDisplay.innerHTML = "<em>No quotes available. Add one below!</em>";
      return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const q = quotes[randomIndex];

    // show with innerHTML so categories can be styled if desired
    quoteDisplay.innerHTML = `
      <p style="font-size:1.05em; margin:0 0 6px 0">"${q.text}"</p>
      <small>— [${q.category}]</small>
      <div style="margin-top:8px;"><small>Index: ${randomIndex}</small></div>
    `;

    // save last viewed index to sessionStorage
    saveLastViewedIndex(randomIndex);
  }

  // Add a new quote from inputs (and persist)
  function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (text === "" || category === "") {
      alert("Please enter both a quote and a category.");
      return;
    }

    const newObj = { text, category };
    quotes.push(newObj);
    saveQuotes(); // persist to localStorage

    // Clear input fields and give immediate feedback
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    quoteDisplay.innerHTML = `<strong>New quote added in "${category}" category!</strong>`;
  }

  // Export quotes as JSON file
  function exportQuotesAsJson() {
    try {
      const jsonStr = JSON.stringify(quotes, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'quotes_export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export quotes: ' + err.message);
    }
  }

  // Import quotes from a JSON file selected by the user
  function importFromJsonFile(file) {
    if (!file) {
      alert('No file selected.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const imported = JSON.parse(evt.target.result);

        // Validate imported structure: expect array of objects with text & category
        if (!Array.isArray(imported)) {
          throw new Error('Imported JSON must be an array of quote objects.');
        }

        const valid = imported.every(item => item && typeof item.text === 'string' && typeof item.category === 'string');
        if (!valid) {
          throw new Error('Each quote must be an object with "text" and "category" string properties.');
        }

        // Merge imported quotes into current quotes
        quotes.push(...imported);
        saveQuotes(); // persist updated list
        quoteDisplay.innerHTML = `<strong>Quotes imported successfully! (${imported.length})</strong>`;
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
    };

    reader.onerror = function () {
      alert('Failed to read the file.');
    };

    reader.readAsText(file);
  }

  // Clear stored quotes (confirmation)
  function clearStoredQuotes() {
    if (!confirm('This will clear all saved quotes from localStorage. Continue?')) return;
    localStorage.removeItem(LOCAL_KEY);
    quotes = []; // clear in-memory
    quoteDisplay.innerHTML = '<em>All saved quotes cleared.</em>';
  }

  // Display last viewed quote (if sessionStorage had it)
  function showLastViewedIfPresent() {
    const lastIndex = getLastViewedIndex();
    if (lastIndex !== null && quotes[lastIndex]) {
      const q = quotes[lastIndex];
      quoteDisplay.innerHTML = `
        <p style="font-size:1.05em; margin:0 0 6px 0">Last viewed: "${q.text}"</p>
        <small>— [${q.category}]</small>
      `;
    }
  }

  // ---------- Initialization ----------
  // Load persisted quotes from localStorage (if present)
  loadQuotes();

  // Show last viewed quote if present in sessionStorage
  showLastViewedIfPresent();

  // Attach event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  exportBtn.addEventListener('click', exportQuotesAsJson);
  clearStorageBtn.addEventListener('click', clearStoredQuotes);

  // Handle import file input change
  importFile.addEventListener('change', function (evt) {
    const file = evt.target.files && evt.target.files[0];
    if (file) {
      importFromJsonFile(file);
      // reset input so same file can be re-selected later if needed
      importFile.value = '';
    }
  });

  // Also create a small dynamic form as extra demonstration (optional)
  function createAddQuoteFormDynamic() {
    const container = document.createElement('div');
    container.style.marginTop = '18px';

    const iText = document.createElement('input');
    iText.placeholder = 'Dynamic quote text';
    const iCat = document.createElement('input');
    iCat.placeholder = 'Dynamic category';
    const iBtn = document.createElement('button');
    iBtn.textContent = 'Add Dynamic Quote';

    iBtn.addEventListener('click', () => {
      const t = iText.value.trim();
      const c = iCat.value.trim();
      if (!t || !c) {
        alert('Fill both fields in dynamic form.');
        return;
      }
      quotes.push({ text: t, category: c });
      saveQuotes();
      iText.value = '';
      iCat.value = '';
      quoteDisplay.innerHTML = `<em>Dynamic quote added in "${c}"</em>`;
    });

    container.appendChild(iText);
    container.appendChild(iCat);
    container.appendChild(iBtn);
    document.body.appendChild(container);
  }

  // Create extra dynamic form
  createAddQuoteFormDynamic();
});