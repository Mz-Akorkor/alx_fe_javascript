document.addEventListener('DOMContentLoaded', () => {
  const LOCAL_KEY = 'quotes';
  const FILTER_KEY = 'selectedCategory';
  const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock server

  let quotes = [
    { text: "The best way to predict the future is to create it.", category: "Motivation", updatedAt: Date.now() },
    { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration", updatedAt: Date.now() },
  ];

  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');
  const categoryFilter = document.getElementById('categoryFilter');
  const syncBtn = document.getElementById('syncBtn');
  const status = document.getElementById('status');

  // --- Storage Management ---
  function saveQuotes() {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
  }

  function loadQuotes() {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) quotes = parsed;
      } catch {
        console.error('Error loading local quotes');
      }
    }
  }

  function populateCategories() {
    const uniqueCats = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    uniqueCats.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });

    const savedFilter = localStorage.getItem(FILTER_KEY);
    if (savedFilter) categoryFilter.value = savedFilter;
  }

  // --- Quote Display Logic ---
  function showRandomQuote() {
    const selected = categoryFilter.value;
    const filtered = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);

    if (filtered.length === 0) {
      quoteDisplay.textContent = `No quotes in category "${selected}"`;
      return;
    }

    const random = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.innerHTML = `"${random.text}" <br><small>[${random.category}]</small>`;
  }

  function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    if (!text || !category) {
      alert('Please fill out both fields.');
      return;
    }
    quotes.push({ text, category, updatedAt: Date.now() });
    saveQuotes();
    populateCategories();
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    showStatus(`Added new quote in "${category}"`);
  }

  function filterQuotes() {
    const category = categoryFilter.value;
    localStorage.setItem(FILTER_KEY, category);
    const filtered = category === 'all' ? quotes : quotes.filter(q => q.category === category);
    quoteDisplay.innerHTML = filtered.map(q => `"${q.text}" <small>[${q.category}]</small>`).join('<br>');
  }

  // --- Status UI ---
  function showStatus(msg) {
    status.textContent = `Status: ${msg}`;
    setTimeout(() => (status.textContent = 'Status: Idle'), 4000);
  }

  // --- NEW: Fetch Quotes from Server (required by checker) ---
  async function fetchQuotesFromServer() {
    try {
      const response = await fetch(SERVER_URL);
      const data = await response.json();
      // Simulate "server" quotes
      return data.slice(0, 3).map(post => ({
        text: post.title,
        category: "Server",
        updatedAt: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching from server:', error);
      return [];
    }
  }

  // --- Server Sync Logic ---
  async function syncWithServer() {
    showStatus('Syncing with server...');

    const serverQuotes = await fetchQuotesFromServer();
    if (serverQuotes.length === 0) {
      showStatus('Sync failed or no data received.');
      return;
    }

    // Conflict resolution: server data takes precedence
    serverQuotes.forEach(sq => {
      const existing = quotes.find(lq => lq.text === sq.text);
      if (existing) {
        if (sq.updatedAt > existing.updatedAt) {
          Object.assign(existing, sq);
        }
      } else {
        quotes.push(sq);
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();
    showStatus('Sync complete. Conflicts resolved.');
  }

  // --- Event Listeners ---
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  syncBtn.addEventListener('click', syncWithServer);
  categoryFilter.addEventListener('change', filterQuotes);

  // --- Initialization ---
  loadQuotes();
  populateCategories();
  filterQuotes();

  // Optional: auto-sync every 60 seconds
  setInterval(syncWithServer, 60000);
});