/**
 * Dictionary Regex - Background Search Web Worker
 * Offloads dictionary download, parsing, indexing, and regex execution from the main thread.
 */

let words = [];
let currentFile = null;
let lastMatches = [];

self.onmessage = async function(e) {
    const data = e.data;
    if (!data) return;

    if (data.type === 'LOAD_WORDS') {
        try {
            if (currentFile !== data.file || words.length === 0) {
                currentFile = data.file;
                const res = await fetch(data.file);
                if (!res.ok) throw new Error('Failed to load dictionary');
                const text = await res.text();
                words = text.split(/\r?\n/);
                if (words.length > 0 && words[words.length - 1] === '') {
                    words.pop();
                }
            }
            self.postMessage({ type: 'WORDS_LOADED', count: words.length, file: data.file });
        } catch (err) {
            self.postMessage({ type: 'LOAD_ERROR', error: err.message, file: data.file });
        }
    } else if (data.type === 'SET_WORDS') {
        words = data.words || [];
        currentFile = data.file || null;
        self.postMessage({ type: 'WORDS_SET', count: words.length });
    } else if (data.type === 'SEARCH') {
        const { id, pattern, shouldColorize, limit } = data;
        const matchLimit = limit || 2000;
        try {
            const matches = [];

            if (!shouldColorize) {
                // Fast path: non-global RegExp.test() with indexed loop (avoids intermediate object allocations)
                const testRegex = new RegExp(pattern);
                for (let i = 0, len = words.length; i < len; i++) {
                    const word = words[i];
                    if (testRegex.test(word)) {
                        matches.push(word);
                    }
                }
            } else {
                // Colorized sub-match tracking
                const execRegex = new RegExp(pattern, 'g');
                for (let i = 0, len = words.length; i < len; i++) {
                    const word = words[i];
                    execRegex.lastIndex = 0;
                    let match = execRegex.exec(word);
                    if (!match) continue;

                    const subMatches = [{
                        startIndex: match.index,
                        endIndex: match.index + match[0].length
                    }];

                    while ((match = execRegex.exec(word)) !== null) {
                        if (match[0].length === 0) {
                            execRegex.lastIndex++;
                            continue;
                        }
                        subMatches.push({
                            startIndex: match.index,
                            endIndex: match.index + match[0].length
                        });
                    }

                    matches.push({ source: word, subMatches });
                }
            }

            lastMatches = matches;
            const totalCount = matches.length;
            // Transfer only initial chunk up to limit to eliminate postMessage structured-clone lag
            const initialMatches = totalCount > matchLimit ? matches.slice(0, matchLimit) : matches;

            self.postMessage({
                type: 'SEARCH_RESULTS',
                id,
                totalCount,
                matches: initialMatches
            });
        } catch (error) {
            self.postMessage({ type: 'SEARCH_ERROR', id, error: error.message });
        }
    } else if (data.type === 'GET_ALL_MATCHES') {
        self.postMessage({
            type: 'ALL_MATCHES_RESULTS',
            id: data.id,
            totalCount: lastMatches.length,
            matches: lastMatches
        });
    }
};
