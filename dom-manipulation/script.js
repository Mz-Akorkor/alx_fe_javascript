document.addEventListener('DOMContentLoaded', () => {
  const LOCAL_KEY = 'quotes';
  const FILTER_KEY = 'selectedCategory';
  const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

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

  // Save and load quotes
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

  // Populate categories
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

  // Display and filter quotes
  function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    const filtered = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
    if (filtered.length === 0) {
      quoteDisplay.innerHTML = `No quotes found for "${selectedCategory}".`;
      return;
    }
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.innerHTML = `"${random.text}" <br><small>[${random.category}]</small>`;
  }

  function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem(FILTER_KEY, selectedCategory);
    const filtered = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
    quoteDisplay.innerHTML = filtered.map(q => `"${q.text}" <small>[${q.category}]</small>`).join('<br>');
  }

  // Add quote and POST to server
  function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    if (!text || !category) {
      alert('Please enter both a quote and category.');
      return;
    }

    const newQuote = { text, category, updatedAt: Date.now() };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    showNotification(`New quote added under "${category}".`);
    postQuoteToServer(newQuote);
  }

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
        showNotification("Quote successfully posted to the server.");
      } else {
        showNotification("Failed to post quote to the server.");
      }
    } catch (error) {
      console.error("Error posting quote:", error);
      showNotification("Error posting quote to server.");
    }
  }

  // Fetch from server
  async function fetchQuotesFromServer() {
    try {
      const response = await fetch(SERVER_URL);
      const data = await response.json();
      return data.slice(0, 5).map(post => ({
        text: post.title,
        category: "Server",
        updatedAt: Date.now()
      }));
    } catch (error) {
      console.error("Error fetching quotes from server:", error);
      return [];
    }
  }

  //  REQUIRED FUNCTION: syncQuotes
  async function syncQuotes() {
    showNotification("Syncing quotes with server...");
    const serverQuotes = await fetchQuotesFromServer();

    if (serverQuotes.length === 0) {
      showNotification("No new quotes received from server.");
      return;
    }

    let updatedCount = 0;
    serverQuotes.forEach(serverQuote => {
      const existing = quotes.find(q => q.text === serverQuote.text);
      if (!existing) {
        quotes.push(serverQuote);
        updatedCount++;
      } else if (serverQuote.updatedAt > existing.updatedAt) {
        Object.assign(existing, serverQuote);
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      saveQuotes();
      populateCategories();
      filterQuotes();
      showNotification("Quotes synced with server!");
    } else {
      showNotification("No updates found during sync.");
    }
  }

  // Notification UI
  function showNotification(message) {
    status.textContent = `Status: ${message}`;
    status.style.backgroundColor = "#eef";
    setTimeout(() => {
      status.textContent = "Status: Idle";
      status.style.backgroundColor = "transparent";
    }, 4000);
  }

  // Event listeners + periodic sync
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  categoryFilter.addEventListener('change', filterQuotes);
  syncBtn.addEventListener('click', syncQuotes);

  loadQuotes();
  populateCategories();
  filterQuotes();

  //Periodically check every 1 minute
  setInterval(syncQuotes, 60000);
});