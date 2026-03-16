# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dictionary Regex** is a web-based tool that allows users to search through word dictionaries using regular expressions. It supports both English and Hebrew word lists with bilingual UI, optional match highlighting, and shareable search links.

**Repository**: https://github.com/Toldry/DictionaryRegex

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+) class-based architecture, HTML5, CSS3
- **Testing**: Jest with jsdom environment
- **Build**: Babel for ES6+ transpilation
- **Data Collection**: Python 3 with BeautifulSoup (Hebrew word scraping)
- **Hosting**: Static site (GitHub Pages)

## Development Commands

```bash
# Run tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch
```

To run a specific test file:
```bash
npm test -- app.test.js
```

To run tests matching a pattern:
```bash
npm test -- --testNamePattern="findMatches"
```

## Local Development / Testing the Application

No build step required. Choose one option to serve the static files:

**Option 1: Python (if installed)**
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

**Option 2: Node.js**
```bash
npm install -g http-server
http-server -p 8000
# Visit http://localhost:8000
```

## Architecture Overview

### DictionaryRegex Class (app.js)

Single class that encapsulates all application logic. Key responsibilities:

**Data Management:**
- `words[]` - Loaded dictionary (English or Hebrew)
- `currentMatches[]` - Results from last search
- `currentLanguage` - 'en' or 'he', persisted in URL query parameter
- `MATCH_LIMIT` - Hard limit (5000) for UI performance

**Core Search Methods:**
- `performSearch()` - Main entry point: validates regex, calls findMatches(), displays results
- `findMatches(regex)` - Iterates through all words testing against regex pattern
- `findColorizedMatches(regex)` - Alternative implementation that tracks match positions for highlighting

**UI/Display:**
- `displayResults(matches, limitResults)` - Renders results list, handles pagination
- `createColorizedMatch(word, colorizedInfo)` - Builds HTML for highlighted matches
- `showError(message)` - Displays validation errors

**Language Support:**
- `loadWords()` - Async fetch of language-specific dictionary file
- `handleLanguageChange()` - Switches language and reloads dictionary
- `updateUILanguage()` - Updates visible text using data attributes
- `getLanguageFromUrl()` / `updateUrlWithLanguage()` - URL query param persistence

**UX Features:**
- `initializeExampleQueries()` - Sets up 5 example regex patterns
- `handleExampleClick(e)` - Loads and executes example patterns
- `initializeHorizontalScroll()` - Mobile-only scroll behavior for examples

### Data Files

- **words.txt** - English dictionary (109,585 entries, one per line, lowercase)
- **hebrew_words.txt** - Hebrew dictionary (19,173 entries from he.wiktionary.org)
- **hebrew_scraper.py** - Scraper that fetches and filters Hebrew words (>1 char, no spaces, Hebrew letters only)

### HTML Structure (index.html)

- Bilingual support via `data-en` and `data-he` attributes on elements
- Language selector dropdown
- Regex input field, search button, colorize checkbox
- Example queries section (horizontal scroll on mobile)
- Results list with match counter and warning dialog for >5000 matches
- Shareable link display

### Styling (styles.css)

- Responsive design (mobile breakpoint at 600px)
- RTL support for Hebrew (document direction set dynamically)
- Yellow highlight for matched portions (orange on hover)
- Mobile-specific horizontal scroll for examples

## Testing Architecture (app.test.js)

Uses Jest with jsdom for DOM simulation:

**Test Setup:**
- `jest.setup.js` mocks `window.innerWidth` for mobile testing
- `beforeEach()` creates DOM structure and mocks fetch API
- Each test gets fresh instance of DictionaryRegex

**Test Coverage:**
- Dictionary loading and word parsing
- Regex matching logic with colorization
- Language switching and UI updates
- URL parameter handling for language and search patterns
- Example query functionality
- Error handling for invalid regex
- Results display and pagination

## Important Implementation Details

**URL Sharing:**
- Search pattern encoded in URL hash: `example.com#regex_pattern`
- Language encoded in query param: `example.com?lang=he`
- Load-time check (app.js:170-174) auto-executes searches from URL hash

**Performance Considerations:**
- `MATCH_LIMIT` (5000) prevents DOM thrashing for patterns matching entire dictionary
- Colorization is slower than simple matching; toggle behavior tested separately
- Dictionary loaded once on initialization; language changes reload async

**Regex Execution:**
- Uses `RegExp` constructor with 'g' flag for global matching
- Two algorithms: simple `.match()` for performance, `.exec()` loop for position tracking
- Invalid regex caught with try/catch, displays error message

**Mobile Detection:**
- `window.innerWidth <= 600` triggers horizontal scroll initialization
- Jest setup mocks this for testing both code paths

## Key Test Patterns

Most tests follow this pattern:
```javascript
test('description', async () => {
    await dictionaryRegex.loadWords();  // async dictionary fetch
    dictionaryRegex.elements.input.value = 'regex_pattern';
    dictionaryRegex.performSearch();
    expect(dictionaryRegex.currentMatches).toHaveLength(n);
});
```

Mocking is essential:
- `global.fetch` mocked in beforeEach (required for loadWords async)
- DOM created fresh for each test
- Jest clears all mocks in afterEach

## Common Modifications

**Adding new example queries:** Update `initializeExampleQueries()` method and add corresponding HTML

**Changing match display limit:** Modify `MATCH_LIMIT` constant

**Supporting new language:** Add `*.txt` dictionary file, update language selection options, ensure i18n data attributes exist

**Modifying search algorithm:** Edit `findMatches()` or `findColorizedMatches()` logic and update corresponding tests
