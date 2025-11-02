document.addEventListener('DOMContentLoaded', () => {
  const LOCAL_KEY = 'quotes';
  const FILTER_KEY = 'selectedCategory';
  const SESSION_LAST_INDEX = 'lastViewedQuoteIndex';

  let quotes = [
    { text: "The best way to predict the future is to create it.", category: "Motivation" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
    { text: "Do what you can, with what you have, where you are.", category: "Action" }
  ];

  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const exportBtn = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');
  const clearStorageBtn = document.getElementById('clearStorage');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');
  const categoryFilter = document.getElementById('categoryFilter');

  // --- Storage Helpers ---
  function saveQuotes() {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
  }

  function loadQuotes() {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) quotes = parsed;
      } catch (err) {
        console.error('Failed to parse stored quotes:', err);
      }
    }
  }

  function saveSelectedCategory(cat) {
    localStorage.setItem(FILTER_KEY, cat);
  }

  function getSavedCategory() {
    return localStorage.getItem(FILTER_KEY) || 'all';
  }

  // --- UI Updates ---
  function populateCategories() {
    const uniqueCats = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    uniqueCats.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });

    // Restore last saved category filter
    const savedCat = getSavedCategory();
    categoryFilter.value = savedCat;
  }

  function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    const filteredQuotes = selectedCategory === 'all'
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

    if (filteredQuotes.length === 0) {
      quoteDisplay.innerHTML = `<em>No quotes available for "${selectedCategory}".</em>`;
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const q = filteredQuotes[randomIndex];
    quoteDisplay.innerHTML = `
      <p>"${q.text}"</p>
      <small>— [${q.category}]</small>
    `;

    sessionStorage.setItem(SESSION_LAST_INDEX, randomIndex);
  }

  function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (!text || !category) {
      alert('Please enter both a quote and a category.');
      return;
    }

    quotes.push({ text, category });
    saveQuotes();
    populateCategories(); // refresh dropdown
    quoteDisplay.innerHTML = `<strong>Added new quote in "${category}"!</strong>`;
    newQuoteText.value = '';
    newQuoteCategory.value = '';
  }

  function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    saveSelectedCategory(selectedCategory);

    const filtered = selectedCategory === 'all'
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

    if (filtered.length === 0) {
      quoteDisplay.innerHTML = `<em>No quotes in category "${selectedCategory}".</em>`;
    } else {
      const list = filtered.map(q => `<p>"${q.text}" <small>[${q.category}]</small></p>`).join('');
      quoteDisplay.innerHTML = list;
    }
  }

  // --- Import & Export ---
  function exportQuotes() {
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
  }

  function importFromJsonFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error('Invalid JSON structure');
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        quoteDisplay.innerHTML = `<strong>Imported ${imported.length} quotes successfully!</strong>`;
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function clearStorage() {
    if (!confirm('This will clear all saved quotes. Continue?')) return;
    localStorage.removeItem(LOCAL_KEY);
    quotes = [];
    populateCategories();
    quoteDisplay.innerHTML = `<em>All quotes cleared.</em>`;
  }

  // --- Event Listeners ---
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  exportBtn.addEventListener('click', exportQuotes);
  clearStorageBtn.addEventListener('click', clearStorage);
  importFile.addEventListener('change', e => {
    if (e.target.files[0]) importFromJsonFile(e.target.files[0]);
  });

  // --- Initialization ---
  loadQuotes();
  populateCategories();
  filterQuotes();
});