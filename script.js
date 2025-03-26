document.addEventListener("DOMContentLoaded", function () {
    const selector = document.querySelector(".language-selector");
    const selected = document.querySelector(".selected-language");
    const dropdown = document.querySelector(".language-dropdown");
    const options = document.querySelectorAll(".language-dropdown li");
    const languageSelector = document.querySelector(".language-selector");
  
    const savedLang = localStorage.getItem("selectedLanguage") || new URL(window.location.href).searchParams.get("lang") || "en";
    setLanguage(savedLang);
  
    // Toggle dropdown on click
    selected.addEventListener("click", function () {
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });
  
    // Change selected language when an option is clicked
    options.forEach(option => {
        option.addEventListener("click", function () {
            const lang = this.getAttribute("data-lang");
            selected.innerHTML = this.innerHTML + ' <i class="fas fa-caret-down"></i>';
            dropdown.style.display = "none"; // Hide dropdown after selection
            setLanguage(lang);
        });
    });
  
    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!selector.contains(event.target)) {
          languageSelector.classList.remove("active"); // Remove active state from selector
          dropdown.classList.remove("show"); // Hide the dropdown
          selector.classList.remove("inactive"); // Reset the rotation to normal state
            dropdown.style.display = "none";
        }
    });
  
    languageSelector.addEventListener("click", function () {
      event.stopPropagation(); // Prevent the click from propagating to the document
      this.classList.toggle("active"); // Toggles the active state on the language selector
      dropdown.classList.toggle("show"); // Show/hide dropdown
      selector.classList.toggle("inactive"); // Toggles the rotation state
  });
  
  });
  
  window.addEventListener('scroll', function() {
    var footer = document.querySelector('footer');
    if (window.scrollY > 20) {  /* Scroll position to trigger the footer appearance */
        footer.classList.add('show');
    } else {
        footer.classList.remove('show');
    }
  });
  
  //////////////////////////////////
  // New code to change language! //
  //////////////////////////////////
  //////////////////////////////////
  // Function to set language
  function setLanguage(lang) {
    localStorage.setItem("selectedLanguage", lang); // Store language in localStorage
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang); // Add or update the ?lang= parameter
    window.history.replaceState(null, "", url); // Update URL without reloading

    updateSelectedLanguage(lang); // ✅ Now updates flag & text
    loadLanguage(lang); // Load content in selected language
}

function updateSelectedLanguage(lang) {
    const selected = document.querySelector(".selected-language");
    const flagSrc = `../images/${lang}.png`; // Set correct flag path
    selected.innerHTML = `<img src="${flagSrc}" class="lang-flag"> ${lang} <i class="fas fa-caret-down"></i>`;
}

  // Function to load language content
  function loadLanguage(lang) {
    fetch(`../languages/${lang}.json`) // Fetch translation file
        .then(response => {
            if (!response.ok) throw new Error(`Language file not found: ${lang}.json`);
            return response.json();
        })
        .then(data => {
            document.querySelectorAll("[data-translate]").forEach(el => {
                const key = el.getAttribute("data-translate");
                if (data[key]) {
                    el.innerHTML = data[key]; // Update content dynamically
                }
            });
        })
        .catch(error => console.error("Translation error:", error));
}

  
  
  // Get language from localStorage or URL
  const savedLang = localStorage.getItem("selectedLanguage") || new URL(window.location.href).searchParams.get("lang") || "en";
  setLanguage(savedLang);