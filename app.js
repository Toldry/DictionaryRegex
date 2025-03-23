/**
 * Created by Alon Eitan on 05/05/14.
 */

class DictionaryRegex {
    constructor() {
        this.words = [];
        this.currentMatches = [];
        this.MATCH_LIMIT = 5000;
        this.currentLanguage = this.getLanguageFromUrl() || 'en';
        
        this.elements = {
            input: document.getElementById('regexTextField'),
            searchButton: document.getElementById('findMatchesButton'),
            colorizeCheckbox: document.getElementById('colorizeSubMatch'),
            matchesList: document.getElementById('matches'),
            matchCount: document.getElementById('numberOfMatches'),
            errorMessage: document.getElementById('errorMessage'),
            queryLink: document.getElementById('linkToQuery'),
            examplesContainer: document.querySelector('.examples-container'),
            exampleLinks: document.querySelectorAll('.example-query'),
            matchWarning: document.getElementById('matchWarning'),
            totalMatchCount: document.getElementById('totalMatchCount'),
            limitMatchesBtn: document.getElementById('limitMatches'),
            showAllBtn: document.getElementById('showAll'),
            loadMoreBtn: document.createElement('button'),
            languageSelect: document.getElementById('languageSelect')
        };

        // Initialize query link with current URL
        const baseUrl = window.location.href.split('#')[0];
        this.elements.queryLink.href = baseUrl;
        this.elements.queryLink.textContent = baseUrl;
        
        // Set initial language UI state
        if (this.elements.languageSelect) {
            this.elements.languageSelect.value = this.currentLanguage;
        }
        document.documentElement.dir = this.currentLanguage === 'he' ? 'rtl' : 'ltr';
        this.updateUILanguage();
        
        this.initializeEventListeners();
        this.initializeExampleQueries();
        this.initialize();
    }

    getLanguageFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const lang = urlParams.get('lang');
        return lang;
    }

    updateUrlWithLanguage() {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('lang', this.currentLanguage);
        window.history.pushState({}, '', newUrl);
    }

    async loadWords() {
        try {
            const file = this.currentLanguage === 'en' ? 'words.txt' : 'hebrew_words.txt';
            const response = await fetch(file);
            if (!response.ok) throw new Error('Failed to load dictionary');
            const text = await response.text();
            this.words = text.split('\n').map(word => word.replace(/\r$/, ''));
        } catch (error) {
            console.error('Error loading dictionary:', error);
            this.showError('Failed to load dictionary');
        }
    }

    initializeEventListeners() {
        // Search functionality
        this.elements.searchButton.addEventListener('click', () => this.performSearch());
        
        // Example queries
        this.elements.exampleLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleExampleClick(e));
        });

        // Language switching - only if the selector exists
        if (this.elements.languageSelect) {
            this.elements.languageSelect.addEventListener('change', () => this.handleLanguageChange());
        }

        // Mobile scroll behavior
        if (window.innerWidth <= 600) {
            this.initializeHorizontalScroll();
        }

        // Add new event listeners for the warning buttons
        this.elements.limitMatchesBtn.addEventListener('click', () => {
            this.displayResults(this.currentMatches, true);
            this.elements.matchWarning.style.display = 'none';
        });

        this.elements.showAllBtn.addEventListener('click', () => {
            this.displayResults(this.currentMatches, false);
            this.elements.matchWarning.style.display = 'none';
        });
    }

    handleLanguageChange() {
        if (!this.elements.languageSelect) return;
        
        this.currentLanguage = this.elements.languageSelect.value;
        document.documentElement.dir = this.currentLanguage === 'he' ? 'rtl' : 'ltr';
        this.updateUILanguage();
        this.updateUrlWithLanguage();
        this.loadWords().then(() => {
            // If there's a current search, perform it again with the new dictionary
            if (this.elements.input.value) {
                this.performSearch();
            }
        });
    }

    updateUILanguage() {
        // Update document direction
        document.documentElement.dir = this.currentLanguage === 'he' ? 'rtl' : 'ltr';
        
        // Update all elements with data attributes
        document.querySelectorAll('[data-en]').forEach(element => {
            const text = element.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                element.textContent = text;
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-en-placeholder]').forEach(element => {
            const placeholder = element.getAttribute(`data-${this.currentLanguage}-placeholder`);
            if (placeholder) {
                element.placeholder = placeholder;
            }
        });

        // Update example query descriptions
        document.querySelectorAll('.example-query .description').forEach(description => {
            const text = description.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                description.textContent = text;
            }
        });
    }

    initializeHorizontalScroll() {
        let isDragging = false;
        let startX, startY, scrollLeft;
        let isHorizontalDrag = false;

        const container = this.elements.examplesContainer;

        const startDragging = (e) => {
            isDragging = true;
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
            scrollLeft = container.scrollLeft;
            isHorizontalDrag = false;
        };

        const stopDragging = () => {
            isDragging = false;
            isHorizontalDrag = false;
        };

        const drag = (e) => {
            if (!isDragging) return;
            
            const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            const y = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
            
            // Calculate movement deltas
            const dx = x - startX;
            const dy = y - startY;

            // Determine if this is primarily a horizontal drag
            if (!isHorizontalDrag) {
                isHorizontalDrag = Math.abs(dx) > Math.abs(dy);
            }

            // Only prevent default and scroll horizontally if it's a horizontal drag
            if (isHorizontalDrag) {
                e.preventDefault();
                container.scrollLeft = scrollLeft - dx;
            }
        };

        container.addEventListener('mousedown', startDragging);
        container.addEventListener('touchstart', startDragging);
        container.addEventListener('mousemove', drag);
        container.addEventListener('touchmove', drag);
        container.addEventListener('mouseup', stopDragging);
        container.addEventListener('touchend', stopDragging);
        container.addEventListener('mouseleave', stopDragging);
    }

    handleExampleClick(e) {
        e.preventDefault();
        const hash = e.currentTarget.getAttribute('href').substring(1);
        this.elements.input.value = decodeURIComponent(hash);
        this.performSearch();
    }

    performSearch() {
        this.clearPreviousResults();
        const pattern = this.elements.input.value;
        
        if (!pattern) return;

        this.updateQueryLink(pattern);

        try {
            const regex = new RegExp(pattern, 'g');
            this.currentMatches = this.findMatches(regex);
            
            if (this.currentMatches.length > this.MATCH_LIMIT) {
                this.showMatchWarning(this.currentMatches.length);
                // Automatically display first 5000 matches
                this.displayResults(this.currentMatches, true);
            } else {
                this.displayResults(this.currentMatches, false);
            }
        } catch (error) {
            this.showError('Invalid regular expression');
        }
    }

    findMatches(regex) {
        console.log('Searching for pattern:', regex);
        const matches = [];
        const shouldColorize = this.elements.colorizeCheckbox.checked;

        for (const word of this.words) {
            if (!shouldColorize) {
                if (word.match(regex)) matches.push(word);
                continue;
            }

            const matchInfo = this.findColorizedMatches(word, regex);
            if (matchInfo) matches.push(matchInfo);
        }

        return matches;
    }

    findColorizedMatches(word, regex) {
        let match = regex.exec(word);
        if (!match) return null;

        const matchInfo = {
            source: match.input,
            subMatches: [{
                startIndex: match.index,
                endIndex: match.index + match[0].length
            }]
        };

        while ((match = regex.exec(word))) {
            matchInfo.subMatches.push({
                startIndex: match.index,
                endIndex: match.index + match[0].length
            });
        }

        return matchInfo;
    }

    showMatchWarning(totalMatches) {
        this.elements.totalMatchCount.textContent = totalMatches.toLocaleString();
        this.elements.matchWarning.style.display = 'block';
        this.elements.matchCount.textContent = totalMatches.toLocaleString();
    }

    displayResults(matches, isInitialLoad = true) {
        this.currentMatches = matches;
        const initialMatches = isInitialLoad ? 
            matches.slice(0, this.MATCH_LIMIT) : 
            matches;

        // Hide warning message if matches are under limit
        if (matches.length <= this.MATCH_LIMIT) {
            this.elements.matchWarning.style.display = 'none';
        }

        this.elements.matchCount.textContent = matches.length > this.MATCH_LIMIT ?
            `${initialMatches.length.toLocaleString()} of ${matches.length.toLocaleString()}` :
            matches.length.toLocaleString();

        this.elements.matchesList.innerHTML = '';

        initialMatches.forEach(match => {
            const li = document.createElement('li');
            
            if (typeof match === 'string') {
                li.textContent = match;
            } else {
                li.appendChild(this.createColorizedMatch(match));
            }

            this.elements.matchesList.appendChild(li);
        });

        this.updateLoadMoreButton(matches.length);
    }

    updateLoadMoreButton(totalMatches) {
        const existingBtn = document.querySelector('.load-more-btn');
        if (existingBtn) {
            existingBtn.remove();
        }

        if (totalMatches > this.MATCH_LIMIT) {
            this.elements.loadMoreBtn = document.createElement('button');
            this.elements.loadMoreBtn.className = 'button load-more-btn';
            this.elements.loadMoreBtn.textContent = `Load ${(totalMatches - this.MATCH_LIMIT).toLocaleString()} more matches`;
            
            this.elements.loadMoreBtn.addEventListener('click', () => {
                this.elements.loadMoreBtn.remove();
                
                this.elements.matchesList.innerHTML = '';
                this.elements.matchCount.textContent = this.currentMatches.length.toLocaleString();
                
                this.currentMatches.forEach(match => {
                    const li = document.createElement('li');
                    if (typeof match === 'string') {
                        li.textContent = match;
                    } else {
                        li.appendChild(this.createColorizedMatch(match));
                    }
                    this.elements.matchesList.appendChild(li);
                });
            }, { once: true });

            this.elements.matchesList.after(this.elements.loadMoreBtn);
        }
    }

    createColorizedMatch(match) {
        const container = document.createDocumentFragment();
        let lastIndex = 0;

        match.subMatches.forEach(subMatch => {
            // Add text before match
            if (subMatch.startIndex > lastIndex) {
                container.appendChild(document.createTextNode(
                    match.source.slice(lastIndex, subMatch.startIndex)
                ));
            }

            // Add highlighted match
            const highlight = document.createElement('span');
            highlight.className = 'subMatch';
            highlight.textContent = match.source.slice(
                subMatch.startIndex,
                subMatch.endIndex
            );
            container.appendChild(highlight);

            lastIndex = subMatch.endIndex;
        });

        // Add remaining text
        if (lastIndex < match.source.length) {
            container.appendChild(document.createTextNode(
                match.source.slice(lastIndex)
            ));
        }

        return container;
    }

    clearPreviousResults() {
        this.elements.matchCount.textContent = '0';
        this.elements.matchesList.innerHTML = '';
        this.elements.errorMessage.style.display = 'none';
        this.elements.matchWarning.style.display = 'none';  // Also hide warning message
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) loadMoreBtn.remove();
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        console.error(message);
    }

    updateQueryLink(pattern) {
        const url = new URL(window.location.href);
        url.hash = '#' + encodeURIComponent(pattern);
        if (this.currentLanguage === 'he') {
            url.searchParams.set('lang', 'he');
        }
        this.elements.queryLink.href = url.toString();
        this.elements.queryLink.textContent = url.toString();
    }

    async initializeFromHash() {
        if (window.location.hash) {
            this.elements.input.value = decodeURIComponent(
                window.location.hash.substring(1)
            );
            // Wait for dictionary to load before searching
            await this.loadWords();
            this.performSearch();
        }
    }

    // New method to handle async initialization
    async initialize() {
        await this.loadWords();
        this.initializeFromHash();
    }

    initializeExampleQueries() {
        const template = document.getElementById('exampleQueryTemplate');
        if (!template) return; // Skip initialization if template doesn't exist

        const examples = [
            {
                pattern: 'astic$',
                description: {
                    en: 'Words ending in "astic"',
                    he: 'מילים שמסתיימות ב"astic"'
                }
            },
            {
                pattern: '^.{4}ing$',
                description: {
                    en: '4-letter words ending in "ing"',
                    he: 'מילים באורך 4 אותיות שמסתיימות ב"ing"'
                }
            },
            {
                pattern: '^(.+)\\1$',
                description: {
                    en: 'Words that are repeated (like \'murmur\')',
                    he: 'מילים שחוזרות על עצמן'
                }
            },
            {
                pattern: '(.)\\1(.)\\2(.)\\3',
                description: {
                    en: 'Words with three consecutive pairs of repeated letters',
                    he: 'מילים עם שלושה זוגות אותיות חוזרות ברצף'
                }
            },
            {
                pattern: '^(.)(.)(.).\\3\\2\\1$',
                description: {
                    en: '7-letter palindromes',
                    he: 'פלינדרומים באורך 7 אותיות'
                }
            }
        ];

        const container = document.querySelector('.example-queries');
        if (!container) return; // Skip if container doesn't exist
        
        examples.forEach(example => {
            const clone = template.content.cloneNode(true);
            const link = clone.querySelector('.example-query');
            const description = clone.querySelector('.description');
            const pattern = clone.querySelector('.pattern');
            
            link.href = '#' + example.pattern;
            description.setAttribute('data-en', example.description.en);
            description.setAttribute('data-he', example.description.he);
            description.textContent = example.description.en;
            pattern.textContent = example.pattern;
            
            // Add click event listener directly to the link
            link.addEventListener('click', (e) => this.handleExampleClick(e));
            
            container.appendChild(clone);
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.dictionaryRegex = new DictionaryRegex();
});

// At the very end of the file, after the DOMContentLoaded event listener
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DictionaryRegex;
}
