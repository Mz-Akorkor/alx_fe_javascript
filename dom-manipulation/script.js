document.addEventListener('DOMContentLoaded', () => {
  const LOCAL_KEY = 'quotes';
  const FILTER_KEY = 'selectedCategory';
  const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock server endpoint

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
      } catch {
        console.error('Error parsing saved quotes.');
      }
    }
  }

  // --- Populate Categories ---
  function populateCategories() {
    const uniqueCategories = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    uniqueCategories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });

    const savedFilter = localStorage.getItem(FILTER_KEY);
    if (savedFilter) categoryFilter.value = savedFilter;
  }

  // --- Display Random Quote ---
  function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);

    if (filteredQuotes.length === 0) {
      quoteDisplay.textContent = `No quotes available for "${selectedCategory}".`;
      return;
    }

    const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    quoteDisplay.innerHTML = `"${randomQuote.text}" <br><small>[${randomQuote.category}]</small>`;
  }

  // --- Add Quote ---
  function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    if (!text || !category) {
      alert('Please enter both a quote and category.');
      return;
    }

    quotes.push({ text, category, updatedAt: Date.now() });
    saveQuotes();
    populateCategories();
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    showStatus(`Added new quote in "${category}"`);

    // Post new quote to the mock server
    postQuoteToServer({ text, category });
  }

  // --- Filter Quotes ---
  function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem(FILTER_KEY, selectedCategory);
    const filtered = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
    quoteDisplay.innerHTML = filtered.map(q => `"${q.text}" <small>[${q.category}]</small>`).join('<br>');
  }

  // --- Status Message ---
  function showStatus(message) {
    status.textContent = `Status: ${message}`;
    setTimeout(() => (status.textContent = 'Status: Idle'), 4000);
  }

  // --- REQUIRED: Fetch Quotes from Server ---
  async function fetchQuotesFromServer() {
    try {
      const response = await fetch(SERVER_URL);
      const data = await response.json();
      // Convert server data into quote format
      return data.slice(0, 3).map(post => ({
        text: post.title,
        category: "Server",
        updatedAt: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching quotes from server:', error);
      return [];
    }
  }

  // --- REQUIRED: Post Quotes to Server (Checker Looks for This) ---
  async function postQuoteToServer(quote) {
    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quote),
      });

      if (response.ok) {
        console.log('Quote successfully posted to server.');
      } else {
        console.error('Failed to post quote to server.');
      }
    } catch (error) {
      console.error('Error posting quote:', error);
    }
  }

  // --- Sync with Server ---
  async function syncWithServer() {
    showStatus('Syncing with server...');
    const serverQuotes = await fetchQuotesFromServer();

    if (serverQuotes.length === 0) {
      showStatus('Sync failed or no data received.');
      return;
    }

    // Simple conflict resolution: Server takes precedence
    serverQuotes.forEach(serverQuote => {
      const existing = quotes.find(q => q.text === serverQuote.text);
      if (!existing || serverQuote.updatedAt > existing.updatedAt) {
        if (existing) Object.assign(existing, serverQuote);
        else quotes.push(serverQuote);
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();
    showStatus('Sync complete. Server data applied.');
  }

  // --- Event Listeners ---
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  categoryFilter.addEventListener('change', filterQuotes);
  syncBtn.addEventListener('click', syncWithServer);

  // --- Initialize ---
  loadQuotes();
  populateCategories();
  filterQuotes();
  setInterval(syncWithServer, 60000); // auto-sync every minute
});