const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealEls = document.querySelectorAll(".reveal");
const themeToggleBtn = document.querySelector("#themeToggleBtn");
const skillsToggleBtn = document.querySelector("#skillsToggleBtn");
const skillsSection = document.querySelector("#skillsSection");
const themeStorageKey = "site-theme";
const themeStylesheet = document.querySelector('link[rel="stylesheet"][href="red.css"], link[rel="stylesheet"][href="green.css"], link[rel="stylesheet"][href="style.css"]');

function applyTheme(themeName) {
    if (!themeStylesheet) return;

    const stylesheetName = themeName === "green" ? "green.css" : "red.css";
    themeStylesheet.setAttribute("href", stylesheetName);

    if (themeToggleBtn) {
        const nextThemeLabel = themeName === "red" ? "Switch to green theme" : "Switch to red theme";
        themeToggleBtn.textContent = nextThemeLabel;
    }
}

function initThemeToggle() {
    const savedTheme = localStorage.getItem(themeStorageKey);
    const initialTheme = savedTheme === "green" ? "green" : "red";
    applyTheme(initialTheme);

    if (!themeToggleBtn) return;

    themeToggleBtn.addEventListener("click", () => {
        const currentIsRed = themeStylesheet && themeStylesheet.getAttribute("href") === "red.css";
        const nextTheme = currentIsRed ? "green" : "red";
        applyTheme(nextTheme);
        localStorage.setItem(themeStorageKey, nextTheme);
    });
}

function initSectionToggle() {
    if (!skillsToggleBtn || !skillsSection) return;

    const updateButtonLabel = (isExpanded) => {
        skillsToggleBtn.textContent = isExpanded ? 'Ukryj sekcję „Umiejętności”' : 'Pokaż sekcję „Umiejętności”';
        skillsToggleBtn.setAttribute("aria-expanded", String(isExpanded));
    };

    const getIsExpanded = () => skillsSection.style.display !== "none";
    updateButtonLabel(getIsExpanded());

    skillsToggleBtn.addEventListener("click", () => {
        const isExpanded = getIsExpanded();
        skillsSection.style.display = isExpanded ? "none" : "";
        updateButtonLabel(!isExpanded);
    });
}

function initRevealToggle() {
    if (!revealEls.length) return;

    if (prefersReducedMotion) {
        revealEls.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                } else {
                    entry.target.classList.remove("is-visible");
                }
            });
        },
        {
            root: null,
            rootMargin: "0px 0px -6% 0px",
            threshold: [0, 0.06, 0.12],
        }
    );

    revealEls.forEach((el) => io.observe(el));
}

initRevealToggle();
initThemeToggle();
initSectionToggle();
