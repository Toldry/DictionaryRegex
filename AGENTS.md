# AGENTS.md

This file provides development guidelines and architectural context for AI agents working with the **Dictionary Regex** codebase.

## Project Overview

**Dictionary Regex** is a client-side web application that enables users to query dictionary word lists using regular expressions. It features multilingual support (English, Hebrew, Spanish, German), real-time match highlighting (colorization), example queries per language, responsive mobile layout, and shareable search URLs.

- **Repository**: https://github.com/Toldry/DictionaryRegex
- **Supported Languages**: English (`en`), Hebrew (`he` - RTL), Spanish (`es`), German (`de`)

---

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+ class-based architecture), HTML5, CSS3
- **Testing**: Jest with `jest-environment-jsdom`
- **Build / Transpilation**: Babel (`@babel/preset-env`, `babel-jest`)
- **Data Gathering**: Python 3 script with BeautifulSoup (`hebrew_scraper.py` for Hebrew Wiktionary)
- **Deployment**: Static website (GitHub Pages compatible, no backend required)

---

## Development Commands

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npm test -- app.test.js

# Run tests matching a specific pattern
npm test -- --testNamePattern="Language Support"
```

### Local Development / Static Server

```bash
# Start local preview server (serves on http://localhost:3000)
npm run preview
# or
npm start
```
Then navigate to `http://localhost:8000`.

---

## Architecture & Code Structure

### Core Components

```
DictionaryRegex/
├── index.html            # Main HTML UI with i18n data-* attributes
├── app.js                # Core DictionaryRegex class and application logic
├── worker.js             # Web Worker for non-blocking background regex matching
├── app.test.js           # Comprehensive Jest test suite
├── styles.css            # Styles, responsive layouts, RTL rules, and animations
├── english_words.txt     # English dictionary (109k+ entries)
├── hebrew_words.txt      # Hebrew dictionary (19k+ entries)
├── spanish_words.txt     # Spanish dictionary (636k+ entries)
├── german_words.txt      # German dictionary (1.6M+ entries)
├── hebrew_scraper.py     # Python script to scrape Hebrew lemmas from Wiktionary
└── package.json          # Dependencies, Jest config, test scripts
```

### Key Logic in `DictionaryRegex` (`app.js`)

1. **State & Configuration:**
   - `words[]`: Array of loaded words for the active language.
   - `currentMatches[]`: Results matching the current regex query.
   - `currentLanguage`: Active language code (`'en'`, `'he'`, `'es'`, `'de'`). Persisted in the URL via `?lang=...`.
   - `MATCH_LIMIT`: Threshold (default `2000`) before pagination / match warning kicks in.

2. **Search Engine:**
   - `performSearch()`: Parses regex pattern, handles errors/exceptions, invokes search, triggers results rendering.
   - `findMatches(regex)`: Scans dictionary entries. Fast-path string matching or executes colorized sub-match tracking.
   - `findColorizedMatches(word, regex)`: Uses `RegExp.exec()` to extract character indices for sub-match highlighting.

3. **Internationalization (i18n):**
   - HTML elements define localized strings via `data-<lang>` (e.g. `data-en`, `data-he`, `data-es`, `data-de`).
   - Placeholders use `data-<lang>-placeholder`.
   - `updateUILanguage()` updates all UI text dynamically and sets `document.documentElement.dir = 'rtl'` for Hebrew.
   - `initializeExampleQueries()` supplies curated regex examples for each language.

4. **URL Hash & Query Parameters:**
   - Search query is stored in the URL hash: `#<encoded_regex>`.
   - Language is stored in URL parameter: `?lang=<lang_code>`.
   - `initializeFromHash()` automatically executes the search when the page loads with a pre-filled hash.

---

## Guide: Adding a New Language

To add support for a new language (e.g., French `fr`):

1. **Dictionary File**: Place `<lang>_words.txt` in the root folder (plain text, one word per line, UTF-8).
2. **HTML Setup (`index.html`)**:
   - Add `<li><a href="?lang=<lang>" class="language-link" data-lang-code="<lang>">Language Name</a></li>` to `#languageList`.
   - Add `data-<lang>="..."` translations to all UI elements (`h3`, `p`, `h4`, buttons, labels, spans, error messages).
   - Add `data-<lang>-placeholder="..."` to `#regexTextField`.
3. **App Logic (`app.js`)**:
   - Update `loadWords()` to map `this.currentLanguage === '<lang>'` to `<lang>_words.txt`.
   - Add example regex queries to `examplesByLanguage.<lang>` in `initializeExampleQueries()`.
4. **Tests (`app.test.js`)**:
   - Add test cases in the `DictionaryRegex - Language Support` suite for dictionary loading and URL updates.
   - Run `npm test` to verify.

---

## Testing Guidelines

- Tests use Jest with JSDOM and mock DOM fixtures in `beforeEach()`.
- Global `fetch` is mocked to return test dictionaries.
- Ensure all DOM events, URL search param synchronization, and result limits (>2000) are covered.
