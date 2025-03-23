const DictionaryRegex = require('./app.js');

describe('DictionaryRegex', () => {
    let dictionaryRegex;
    
    // Mock DOM elements
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="regexTextField" type="text">
            <button id="findMatchesButton">Find Matches</button>
            <input id="colorizeSubMatch" type="checkbox">
            <ul id="matches"></ul>
            <div id="numberOfMatches">0</div>
            <div id="errorMessage" style="display: none;"></div>
            <a id="linkToQuery"></a>
            <div class="examples-container">
                <a class="example-query" href="#test">Test</a>
            </div>
            <div id="matchWarning" style="display: none;">
                <span id="totalMatchCount"></span>
                <button id="limitMatches">Show First 5000</button>
                <button id="showAll">Show All</button>
            </div>
        `;
        
        // Mock fetch API
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('word1\nword2\nword3\nword4\nword5')
            })
        );
        
        dictionaryRegex = new DictionaryRegex();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should initialize with empty results', () => {
        expect(dictionaryRegex.currentMatches).toEqual([]);
        expect(dictionaryRegex.elements.matchCount.textContent).toBe('0');
    });

    test('should load dictionary words', async () => {
        await dictionaryRegex.loadWords();
        expect(dictionaryRegex.words).toHaveLength(5);
        expect(dictionaryRegex.words).toContain('word1');
    });

    test('should handle search with no matches', async () => {
        await dictionaryRegex.loadWords();
        dictionaryRegex.elements.input.value = 'xyz123';
        await dictionaryRegex.performSearch();
        expect(dictionaryRegex.currentMatches).toHaveLength(0);
        expect(dictionaryRegex.elements.matchCount.textContent).toBe('0');
    });

    test('should handle search with matches under limit', async () => {
        await dictionaryRegex.loadWords();
        dictionaryRegex.elements.input.value = 'word';
        await dictionaryRegex.performSearch();
        expect(dictionaryRegex.currentMatches.length).toBeLessThanOrEqual(dictionaryRegex.MATCH_LIMIT);
        expect(dictionaryRegex.elements.matchWarning.style.display).toBe('none');
    });

    test('should initialize query link with base URL', () => {
        const baseUrl = window.location.href.split('#')[0];
        expect(dictionaryRegex.elements.queryLink.href).toBe(baseUrl);
        expect(dictionaryRegex.elements.queryLink.textContent).toBe(baseUrl);
    });

    test('should update query link when performing search', async () => {
        await dictionaryRegex.loadWords();
        const searchPattern = 'test-pattern';
        dictionaryRegex.elements.input.value = searchPattern;
        await dictionaryRegex.performSearch();
        expect(dictionaryRegex.elements.queryLink.href).toContain(encodeURIComponent(searchPattern));
    });

    test('should clear warning messages when showing results under limit', async () => {
        // First search with many matches
        dictionaryRegex.elements.matchWarning.style.display = 'block';
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'load-more-btn';
        document.body.appendChild(loadMoreBtn);

        // Then search with few matches
        await dictionaryRegex.loadWords();
        dictionaryRegex.elements.input.value = 'word1';
        await dictionaryRegex.performSearch();
        
        expect(dictionaryRegex.elements.matchWarning.style.display).toBe('none');
        expect(document.querySelector('.load-more-btn')).toBeNull();
    });
});

describe('DictionaryRegex - Handling Large Result Sets', () => {
    let dictionaryRegex;

    beforeEach(() => {
        // Mock large dictionary
        const largeWordList = Array.from({ length: 6000 }, (_, i) => `word${i}`);
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve(largeWordList.join('\n'))
            })
        );
        
        document.body.innerHTML = `
            <input id="regexTextField" type="text">
            <button id="findMatchesButton">Find Matches</button>
            <input id="colorizeSubMatch" type="checkbox">
            <ul id="matches"></ul>
            <div id="numberOfMatches">0</div>
            <div id="errorMessage" style="display: none;"></div>
            <a id="linkToQuery"></a>
            <div id="matchWarning" style="display: none;">
                <span id="totalMatchCount"></span>
                <button id="limitMatches">Show First 5000</button>
                <button id="showAll">Show All</button>
            </div>
        `;
        
        dictionaryRegex = new DictionaryRegex();
    });

    test('should show warning when matches exceed limit', async () => {
        await dictionaryRegex.loadWords();
        dictionaryRegex.elements.input.value = 'word';
        await dictionaryRegex.performSearch();

        expect(dictionaryRegex.currentMatches.length).toBeGreaterThan(dictionaryRegex.MATCH_LIMIT);
        expect(dictionaryRegex.elements.matchWarning.style.display).toBe('block');
        expect(dictionaryRegex.elements.totalMatchCount.textContent).toBe('6,000');
    });

    test('should automatically load first 5000 matches when exceeding limit', async () => {
        await dictionaryRegex.loadWords();
        dictionaryRegex.elements.input.value = 'word';
        await dictionaryRegex.performSearch();

        const displayedMatches = dictionaryRegex.elements.matchesList.children.length;
        expect(displayedMatches).toBe(dictionaryRegex.MATCH_LIMIT);
        expect(dictionaryRegex.elements.matchCount.textContent).toBe('5,000 of 6,000');
    });

    test('should show load more button when matches exceed limit', async () => {
        await dictionaryRegex.loadWords();
        dictionaryRegex.elements.input.value = 'word';
        await dictionaryRegex.performSearch();

        const loadMoreBtn = document.querySelector('.load-more-btn');
        expect(loadMoreBtn).not.toBeNull();
        expect(loadMoreBtn.textContent).toBe('Load 1,000 more matches');
    });

    test('should load all matches when "Show All" button is clicked', async () => {
        await dictionaryRegex.loadWords();
        dictionaryRegex.elements.input.value = 'word';
        await dictionaryRegex.performSearch();

        const showAllBtn = dictionaryRegex.elements.showAllBtn;
        showAllBtn.click();

        expect(dictionaryRegex.elements.matchesList.children.length).toBe(6000);
        expect(dictionaryRegex.elements.matchCount.textContent).toBe('6,000 of 6,000');
        expect(dictionaryRegex.elements.matchWarning.style.display).toBe('none');
    });

    test('should maintain limit when "Show First 5000" button is clicked', async () => {
        await dictionaryRegex.loadWords();
        dictionaryRegex.elements.input.value = 'word';
        await dictionaryRegex.performSearch();

        const limitMatchesBtn = dictionaryRegex.elements.limitMatchesBtn;
        limitMatchesBtn.click();

        expect(dictionaryRegex.elements.matchesList.children.length).toBe(5000);
        expect(dictionaryRegex.elements.matchCount.textContent).toBe('5,000 of 6,000');
        expect(dictionaryRegex.elements.matchWarning.style.display).toBe('none');
    });

    test('should load remaining matches when "Load More" button is clicked', async () => {
        await dictionaryRegex.loadWords();
        dictionaryRegex.elements.input.value = 'word';
        await dictionaryRegex.performSearch();

        const loadMoreBtn = document.querySelector('.load-more-btn');
        loadMoreBtn.click();

        // Wait for next tick to allow async operations to complete
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(dictionaryRegex.elements.matchesList.children.length).toBe(6000);
        expect(dictionaryRegex.elements.matchCount.textContent).toBe('6,000');
        expect(document.querySelector('.load-more-btn')).toBeNull();
    });

    test('should properly transition from large to small result set', async () => {
        // First search with many matches
        await dictionaryRegex.loadWords();
        dictionaryRegex.elements.input.value = 'word';
        await dictionaryRegex.performSearch();

        // Verify large result set UI
        expect(dictionaryRegex.elements.matchWarning.style.display).toBe('block');
        expect(document.querySelector('.load-more-btn')).not.toBeNull();

        // Then search with specific word
        dictionaryRegex.elements.input.value = 'word1$';
        await dictionaryRegex.performSearch();

        // Verify small result set UI
        expect(dictionaryRegex.elements.matchWarning.style.display).toBe('none');
        expect(document.querySelector('.load-more-btn')).toBeNull();
        expect(dictionaryRegex.elements.matchCount.textContent).toBe('1');
    });
}); 