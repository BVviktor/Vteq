/**
 * Vteq IT — Global JavaScript
 * Handles: i18n, mobile navigation, scroll animations, reviews, portfolio helpers.
 */

document.addEventListener("DOMContentLoaded", function () {
    initLanguageSelector();
    initMobileNav();
    initScrollReveal();
    initActiveNavLink();
    initReviews();
    initPortfolioFilters();
    initPortfolioModal();

    // Load saved or URL language once on page load
    const savedLang =
        localStorage.getItem("selectedLanguage") ||
        new URL(window.location.href).searchParams.get("lang") ||
        "hu";
    setLanguage(savedLang);
});

/* ==========================================================================
   Internationalization (i18n)
   Reads strings from /languages/{lang}.json and applies to [data-translate]
   ========================================================================== */

function setLanguage(lang) {
    localStorage.setItem("selectedLanguage", lang);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    document.documentElement.lang = lang;
    window.history.replaceState(null, "", url);
    updateSelectedLanguage(lang);
    loadLanguage(lang);
}

function updateSelectedLanguage(lang) {
    const selected = document.querySelector(".selected-language");
    if (!selected) return;
    const flagSrc = `../images/${lang}.png`;
    selected.innerHTML = `<img src="${flagSrc}" class="lang-flag" alt="${lang}"> ${lang} <i class="fas fa-caret-down"></i>`;
}

function loadLanguage(lang) {
    fetch(`../languages/${lang}.json`)
        .then((response) => {
            if (!response.ok) throw new Error(`Language file not found: ${lang}.json`);
            return response.json();
        })
        .then((data) => {
            // Standard text/HTML replacements
            // Elements with data-translate or data-translate-placeholder
            document.querySelectorAll("[data-translate], [data-translate-placeholder]").forEach((el) => {
                const key = el.getAttribute("data-translate") || el.getAttribute("data-translate-placeholder");
                if (!data[key]) return;

                if (el.hasAttribute("data-translate-placeholder") || el.getAttribute("data-translate-placeholder")) {
                    el.placeholder = data[key];
                } else if (el.tagName === "SELECT") {
                    el.innerHTML = data[key];
                } else {
                    el.innerHTML = data[key];
                }
            });

            // Re-apply nested translate keys inside freshly injected HTML
            document.querySelectorAll("[data-translate]").forEach((el) => {
                const key = el.getAttribute("data-translate");
                if (data[key] && !el.closest("[data-translate-done]")) {
                    // already handled above
                }
            });

            // Load reviews for current language
            loadReviews(lang);

            // Update page title & meta description for selected language (SEO + UX)
            updatePageSeo(data, lang);
        })
        .catch((error) => console.error("Translation error:", error));
}

/* ==========================================================================
   SEO — per-page title & description from language JSON
   ========================================================================== */

function getPageSeoKey() {
    const path = window.location.pathname;
    if (path.includes("/news/20250325")) return "news-article";
    if (path.includes("/news/")) return "news";
    if (path.includes("/about/")) return "about";
    if (path.includes("/contact/")) return "contact";
    if (path.includes("/portfolio/")) return "portfolio";
    if (path.includes("/home/")) return "home";
    return "home";
}

function updatePageSeo(data, lang) {
    const page = getPageSeoKey();
    const title = data[`seo-${page}-title`];
    const desc = data[`seo-${page}-desc`];
    if (title) document.title = title;
    if (desc) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", desc);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute("content", desc);
    }
    if (title) {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute("content", title);
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) twitterTitle.setAttribute("content", title);
    }
    if (desc) {
        const twitterDesc = document.querySelector('meta[name="twitter:description"]');
        if (twitterDesc) twitterDesc.setAttribute("content", desc);
    }
    // Update og:locale for social crawlers that re-fetch
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
        const locales = { en: "en_US", hu: "hu_HU", de: "de_DE", ru: "ru_RU" };
        ogLocale.setAttribute("content", locales[lang] || "en_US");
    }
}

function initLanguageSelector() {
    const selector = document.querySelector(".language-selector");
    const selected = document.querySelector(".selected-language");
    const dropdown = document.querySelector(".language-dropdown");
    const options = document.querySelectorAll(".language-dropdown li");

    if (!selector || !selected || !dropdown) return;

    selected.addEventListener("click", function (e) {
        e.stopPropagation();
        dropdown.classList.toggle("show");
        selector.classList.toggle("active");
    });

    options.forEach((option) => {
        option.addEventListener("click", function (e) {
            e.stopPropagation();
            const lang = this.getAttribute("data-lang");
            dropdown.classList.remove("show");
            selector.classList.remove("active");
            setLanguage(lang);
        });
    });

    document.addEventListener("click", function () {
        dropdown.classList.remove("show");
        selector.classList.remove("active");
    });
}

/* ==========================================================================
   Mobile navigation toggle
   ========================================================================== */

function initMobileNav() {
    const toggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (!toggle || !navLinks) return;

    toggle.addEventListener("click", function () {
        navLinks.classList.toggle("open");
        const icon = toggle.querySelector("i");
        if (icon) {
            icon.classList.toggle("fa-bars");
            icon.classList.toggle("fa-xmark");
        }
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => navLinks.classList.remove("open"));
    });
}

/* ==========================================================================
   Scroll reveal animations (Intersection Observer)
   ========================================================================== */

// Single shared observer for scroll-reveal animations
let revealObserver = null;

function initScrollReveal() {
    const reveals = document.querySelectorAll(".reveal:not(.visible)");
    if (!reveals.length) return;

    if (!revealObserver) {
        revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
    }

    reveals.forEach((el) => revealObserver.observe(el));
}

/* ==========================================================================
   Highlight active nav link based on current page
   ========================================================================== */

function initActiveNavLink() {
    const path = window.location.pathname;
    document.querySelectorAll(".nav-links a").forEach((link) => {
        const href = link.getAttribute("href");
        if (href && path.includes(href.replace("../", "").replace("/index.html", ""))) {
            link.classList.add("active");
        }
    });
}

/* ==========================================================================
   Reviews — static data from reviews.json + localStorage for user submissions
   On static hosting, new reviews are stored locally and shown with a badge.
   Approved reviews can be added permanently to reviews.json.
   ========================================================================== */

function initReviews() {
    const form = document.getElementById("review-form");
    if (!form) return;

    // Sends review to Formspree (same inbox as contact form) — you add approved ones to reviews.json
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("review-name").value.trim();
        const rating = document.querySelector('input[name="rating"]:checked');
        const comment = document.getElementById("review-comment").value.trim();
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!name || !rating || !comment) {
            alert("Please fill in all fields and select a rating.");
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "...";
        }

        try {
            const response = await fetch("https://formspree.io/f/xwplpnjy", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    form_type: "review",
                    _subject: "New client review — Vteq IT",
                    name,
                    rating: rating.value,
                    message: comment,
                }),
            });

            if (!response.ok) throw new Error("Submit failed");

            form.reset();
            const thanks = document.getElementById("review-thanks");
            if (thanks) {
                thanks.style.display = "block";
                setTimeout(() => (thanks.style.display = "none"), 6000);
            }
        } catch (err) {
            console.error("Review submit error:", err);
            alert("Could not send your review. Please try again or use the Contact page.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                const lang = localStorage.getItem("selectedLanguage") || "en";
                fetch(`../languages/${lang}.json`)
                    .then((r) => r.json())
                    .then((data) => {
                        if (data["review-submit"]) submitBtn.textContent = data["review-submit"];
                    });
            }
        }
    });
}

function loadReviews(lang) {
    const container = document.getElementById("reviews-container");
    const emptyState = document.getElementById("reviews-empty");
    if (!container) return;

    fetch("../languages/reviews.json")
        .then((r) => r.json())
        .then((data) => {
            const showPublished = data._config && data._config.showPublishedReviews;
            const publishedReviews = (data[lang] || data["en"] || []).filter((r) => r.name && r.text);

            if (!showPublished || publishedReviews.length === 0) {
                container.innerHTML = "";
                container.style.display = "none";
                if (emptyState) emptyState.style.display = "block";
                return;
            }

            if (emptyState) emptyState.style.display = "none";
            container.style.display = "";

            container.innerHTML = publishedReviews
                .map(
                    (r) => `
                <div class="review-card reveal">
                    <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
                    <p class="review-text">${escapeHtml(r.text)}</p>
                    <p class="review-author">${escapeHtml(r.name)}</p>
                    <p class="review-role">${escapeHtml(r.role || "")}</p>
                </div>`
                )
                .join("");

            initScrollReveal();
        })
        .catch((err) => console.error("Reviews load error:", err));
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/* ==========================================================================
   Portfolio filter tabs
   ========================================================================== */

function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".portfolio-card");

    if (!filterBtns.length) return;

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            filterBtns.forEach((b) => b.classList.remove("active"));
            this.classList.add("active");

            const filter = this.getAttribute("data-filter");

            cards.forEach((card) => {
                const category = card.getAttribute("data-category");
                const show = filter === "all" || category === filter;
                card.classList.toggle("hidden", !show);
                if (show) {
                    card.classList.add("reveal", "visible");
                }
            });
        });
    });
}

/* ==========================================================================
   Portfolio project modal
   ========================================================================== */

function initPortfolioModal() {
    const modal = document.getElementById("portfolio-modal");
    if (!modal) return;

    const closeBtn = modal.querySelector(".modal-close");
    const cards = document.querySelectorAll(".portfolio-card[data-project]");

    cards.forEach((card) => {
        card.addEventListener("click", function () {
            const projectId = this.getAttribute("data-project");
            openProjectModal(projectId);
        });
    });

    closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("open");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") modal.classList.remove("open");
    });
}

function openProjectModal(projectId) {
    const modal = document.getElementById("portfolio-modal");
    const body = document.getElementById("modal-body");
    const template = document.getElementById(`project-${projectId}`);

    if (!modal || !body || !template) return;

    body.innerHTML = template.innerHTML;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    // Re-apply translations inside modal content
    const lang = localStorage.getItem("selectedLanguage") || "en";
    fetch(`../languages/${lang}.json`)
        .then((r) => r.json())
        .then((data) => {
            body.querySelectorAll("[data-translate]").forEach((el) => {
                const key = el.getAttribute("data-translate");
                if (data[key]) el.innerHTML = data[key];
            });
        });

    modal.addEventListener(
        "transitionend",
        () => {
            if (!modal.classList.contains("open")) {
                document.body.style.overflow = "";
            }
        },
        { once: true }
    );

    // Allow closing after content load
    const closeHandler = () => {
        document.body.style.overflow = "";
    };
    modal.querySelector(".modal-close").onclick = () => {
        modal.classList.remove("open");
        closeHandler();
    };
}
