const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealEls = document.querySelectorAll(".reveal");
const themeToggleBtn = document.querySelector("#themeToggleBtn");
const skillsToggleBtn = document.querySelector("#skillsToggleBtn");
const skillsSection = document.querySelector("#skillsSection");
const themeStorageKey = "site-theme";
const themeStylesheet = document.querySelector('link[rel="stylesheet"][href="red.css"], link[rel="stylesheet"][href="green.css"], link[rel="stylesheet"][href="style.css"]');
const contactForm = document.querySelector("#contactForm");
const formSummary = document.querySelector("#formSummary");
const skillsList = document.querySelector("#skillsList");
const projectsList = document.querySelector("#projectsList");
const notesForm = document.querySelector("#notesForm");
const noteInput = document.querySelector("#noteInput");
const notesList = document.querySelector("#notesList");
const notesStorageKey = "portfolio-notes";
const portfolioDataFallback = {
    skills: [
        { name: "HTML5", url: "https://pl.wikipedia.org/wiki/HTML5" },
        { name: "CSS3", url: "https://pl.wikipedia.org/wiki/Kaskadowe_arkusze_styl%C3%B3w" },
        { name: "JavaScript", url: "https://pl.wikipedia.org/wiki/JavaScript" },
        { name: "React", url: "https://pl.wikipedia.org/wiki/React.js" },
        { name: "Node.js", url: "https://pl.wikipedia.org/wiki/Node.js" },
    ],
    projects: [
        {
            title: "Panel analityczny - React",
            description:
                "Dashboard z wykresami (np. sprzedaz / statystyki), filtrowaniem zakresu dat i tabela podsumowan. Stan w React Hooks, responsywny layout i czytelna nawigacja miedzy widokami.",
        },
        {
            title: "REST API + klient webowy - Node.js",
            description:
                "Serwer w Express z endpointami CRUD, walidacja danych i prosta autoryzacja (JWT). Frontend laczy sie z API i umozliwia przegladanie oraz edycje rekordow w jednej aplikacji.",
        },
    ],
};

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

function setFieldError(inputEl, errorEl, message) {
    if (!inputEl || !errorEl) return;
    inputEl.classList.toggle("is-invalid", Boolean(message));
    inputEl.setAttribute("aria-invalid", message ? "true" : "false");
    errorEl.textContent = message || "";
}

function normalizeText(value) {
    return String(value ?? "").trim().replace(/\s+/g, " ");
}

function isEmailValid(value) {
    const v = normalizeText(value);
    if (!v) return false;
    // Prosty, praktyczny regex (format nazwa@domena.tld)
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v);
}

function containsDigit(value) {
    return /\d/.test(String(value ?? ""));
}

function initContactForm() {
    if (!contactForm) return;

    const firstName = contactForm.querySelector("#firstName");
    const lastName = contactForm.querySelector("#lastName");
    const email = contactForm.querySelector("#email");
    const message = contactForm.querySelector("#message");

    const errorFirstName = document.querySelector("#error-firstName");
    const errorLastName = document.querySelector("#error-lastName");
    const errorEmail = document.querySelector("#error-email");
    const errorMessage = document.querySelector("#error-message");

    const clearSummary = () => {
        if (!formSummary) return;
        formSummary.hidden = true;
        formSummary.textContent = "";
        formSummary.classList.remove("form-summary--ok");
    };

    const showSummaryOk = (text) => {
        if (!formSummary) return;
        formSummary.hidden = false;
        formSummary.textContent = text;
        formSummary.classList.add("form-summary--ok");
    };

    const showSummaryError = (text) => {
        if (!formSummary) return;
        formSummary.hidden = false;
        formSummary.textContent = text;
        formSummary.classList.remove("form-summary--ok");
    };

    const clearAllErrors = () => {
        setFieldError(firstName, errorFirstName, "");
        setFieldError(lastName, errorLastName, "");
        setFieldError(email, errorEmail, "");
        setFieldError(message, errorMessage, "");
        clearSummary();
    };

    const validate = () => {
        clearSummary();
        let isValid = true;

        const firstNameValue = normalizeText(firstName?.value);
        const lastNameValue = normalizeText(lastName?.value);
        const emailValue = normalizeText(email?.value);
        const messageValue = normalizeText(message?.value);

        // required
        if (!firstNameValue) {
            setFieldError(firstName, errorFirstName, "Podaj imię.");
            isValid = false;
        } else if (containsDigit(firstNameValue)) {
            setFieldError(firstName, errorFirstName, "Imię nie może zawierać cyfr.");
            isValid = false;
        } else {
            setFieldError(firstName, errorFirstName, "");
        }

        if (!lastNameValue) {
            setFieldError(lastName, errorLastName, "Podaj nazwisko.");
            isValid = false;
        } else if (containsDigit(lastNameValue)) {
            setFieldError(lastName, errorLastName, "Nazwisko nie może zawierać cyfr.");
            isValid = false;
        } else {
            setFieldError(lastName, errorLastName, "");
        }

        if (!emailValue) {
            setFieldError(email, errorEmail, "Podaj adres e-mail.");
            isValid = false;
        } else if (!isEmailValid(emailValue)) {
            setFieldError(email, errorEmail, "Podaj poprawny adres e-mail (np. nazwa@domena.pl).");
            isValid = false;
        } else {
            setFieldError(email, errorEmail, "");
        }

        if (!messageValue) {
            setFieldError(message, errorMessage, "Wpisz wiadomość.");
            isValid = false;
        } else {
            setFieldError(message, errorMessage, "");
        }

        return isValid;
    };

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const ok = validate();
        if (!ok) {
            showSummaryError("Popraw błędy w formularzu i spróbuj ponownie.");
            const firstInvalid = contactForm.querySelector(".is-invalid");
            if (firstInvalid && typeof firstInvalid.focus === "function") firstInvalid.focus();
            return;
        }

        showSummaryOk("Formularz poprawny. Dane zostały sprawdzone po stronie przeglądarki (bez backendu).");
        contactForm.reset();
        clearAllErrors();
    });

    contactForm.addEventListener("reset", () => {
        window.setTimeout(() => {
            clearAllErrors();
        }, 0);
    });

    // Walidacja w trakcie pisania (bez „krzyczenia” od razu: dopiero po dotknięciu pola)
    const bindLiveValidation = (inputEl, errorEl, validateFn) => {
        if (!inputEl) return;
        const state = { touched: false };

        inputEl.addEventListener("blur", () => {
            state.touched = true;
            validateFn();
        });

        inputEl.addEventListener("input", () => {
            if (!state.touched) return;
            validateFn();
        });
    };

    bindLiveValidation(firstName, errorFirstName, validate);
    bindLiveValidation(lastName, errorLastName, validate);
    bindLiveValidation(email, errorEmail, validate);
    bindLiveValidation(message, errorMessage, validate);
}

initContactForm();

function renderSkills(skills) {
    if (!skillsList) return;
    skillsList.innerHTML = "";

    skills.forEach((skill) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = skill.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = skill.name;
        li.appendChild(link);
        skillsList.appendChild(li);
    });
}

function renderProjects(projects) {
    if (!projectsList) return;
    projectsList.innerHTML = "";

    projects.forEach((project) => {
        const article = document.createElement("article");
        article.className = "project-card";

        const title = document.createElement("h3");
        title.textContent = project.title;

        const description = document.createElement("p");
        description.textContent = project.description;

        article.appendChild(title);
        article.appendChild(description);
        projectsList.appendChild(article);
    });
}

function showDataLoadError() {
    if (skillsList) {
        skillsList.innerHTML = "<li>Nie udalo sie zaladowac listy umiejetnosci.</li>";
    }

    if (projectsList) {
        projectsList.innerHTML = "<p>Nie udalo sie zaladowac listy projektow.</p>";
    }
}

async function initPortfolioData() {
    try {
        const candidateUrls = ["./data.json", "data.json", "/data.json"];
        let data = null;

        for (const url of candidateUrls) {
            try {
                const response = await fetch(url, { cache: "no-store" });
                if (!response.ok) continue;
                data = await response.json();
                break;
            } catch (fetchError) {
                // пробуем следующий адрес
            }
        }

        if (!data) {
            throw new Error("Brak dostepu do data.json");
        }

        const skills = Array.isArray(data.skills) ? data.skills : [];
        const projects = Array.isArray(data.projects) ? data.projects : [];

        renderSkills(skills);
        renderProjects(projects);
    } catch (error) {
        console.error("Blad pobierania danych JSON:", error);
        const isFileProtocol = window.location.protocol === "file:";
        if (isFileProtocol) {
            // Fallback dla uruchamiania index.html bez serwera (file://)
            renderSkills(portfolioDataFallback.skills);
            renderProjects(portfolioDataFallback.projects);
            return;
        }

        showDataLoadError();
    }
}

initPortfolioData();

function getSavedNotes() {
    try {
        const raw = localStorage.getItem(notesStorageKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Blad odczytu notatek z localStorage:", error);
        return [];
    }
}

function saveNotes(notes) {
    localStorage.setItem(notesStorageKey, JSON.stringify(notes));
}

function renderNotes(notes) {
    if (!notesList) return;
    notesList.innerHTML = "";

    if (!notes.length) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "notes-list__empty";
        emptyItem.textContent = "Brak notatek. Dodaj pierwszy wpis.";
        notesList.appendChild(emptyItem);
        return;
    }

    notes.forEach((note, index) => {
        const item = document.createElement("li");
        item.className = "notes-item";

        const text = document.createElement("span");
        text.className = "notes-item__text";
        text.textContent = note;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "notes-item__delete";
        deleteButton.textContent = "Usun";
        deleteButton.setAttribute("aria-label", `Usun notatke: ${note}`);
        deleteButton.addEventListener("click", () => {
            const updatedNotes = getSavedNotes().filter((_, noteIndex) => noteIndex !== index);
            saveNotes(updatedNotes);
            renderNotes(updatedNotes);
        });

        item.appendChild(text);
        item.appendChild(deleteButton);
        notesList.appendChild(item);
    });
}

function initNotesFeature() {
    if (!notesForm || !noteInput || !notesList) return;

    const initialNotes = getSavedNotes();
    renderNotes(initialNotes);

    notesForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const noteValue = normalizeText(noteInput.value);
        if (!noteValue) return;

        const notes = getSavedNotes();
        notes.push(noteValue);
        saveNotes(notes);
        renderNotes(notes);

        notesForm.reset();
        noteInput.focus();
    });
}

initNotesFeature();
