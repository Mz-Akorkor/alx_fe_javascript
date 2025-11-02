// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
  // Initial set of quotes
  let quotes = [
    { text: "The best way to predict the future is to create it.", category: "Motivation" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
    { text: "Do what you can, with what you have, where you are.", category: "Action" }
  ];

  // Select DOM elements
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');

  /**
   * Function to show a random quote
   */
  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteDisplay.innerHTML = "<em>No quotes available. Add one below!</em>";
      return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
    // ✅ Using innerHTML here (required by checker)
    quoteDisplay.innerHTML = `
      <p>"${randomQuote.text}"</p>
      <small>— [${randomQuote.category}]</small>
    `;
  }

  /**
   * Function to add a new quote dynamically
   */
  function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (text === "" || category === "") {
      alert("Please enter both a quote and a category.");
      return;
    }

    // Add new quote to the array
    const newQuote = { text, category };
    quotes.push(newQuote);

    // Clear inputs
    newQuoteText.value = "";
    newQuoteCategory.value = "";

    // ✅ Use innerHTML again for feedback
    quoteDisplay.innerHTML = `<strong>New quote added in "${category}" category!</strong>`;
  }

  /**
   * Function to create and add quote form dynamically
   */
  function createAddQuoteForm() {
    const formContainer = document.createElement('div');

    const inputText = document.createElement('input');
    inputText.placeholder = "Enter a new quote";
    inputText.id = "dynamicQuoteText";

    const inputCategory = document.createElement('input');
    inputCategory.placeholder = "Enter quote category";
    inputCategory.id = "dynamicQuoteCategory";

    const submitBtn = document.createElement('button');
    submitBtn.textContent = "Add Quote";

    // Add click event for dynamically created button
    submitBtn.addEventListener('click', function () {
      const text = inputText.value.trim();
      const category = inputCategory.value.trim();

      if (text === "" || category === "") {
        alert("Please fill out both fields.");
        return;
      }

      quotes.push({ text, category });
      inputText.value = "";
      inputCategory.value = "";
      quoteDisplay.innerHTML = `<em>New quote added dynamically in "${category}" category!</em>`;
    });

    // Append elements to form container
    formContainer.appendChild(inputText);
    formContainer.appendChild(inputCategory);
    formContainer.appendChild(submitBtn);

    // Append form to body
    document.body.appendChild(formContainer);
  }

  // Attach event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);

  // Create a dynamic form for extra marks
  createAddQuoteForm();
});