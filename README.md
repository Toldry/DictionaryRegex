# Dictionary Regex

A web-based tool that allows users to search through a list of words using regular expressions. 


## Usage

1. Enter your regular expression in the input field
2. Click the "Find Matches" button to search
3. View the matches in the list below


## Setup & Local Preview
 
```bash
# Start local preview server
npm run preview
# or
npm start
```
 
Alternatively, with Python:
```bash
python -m http.server 8000
```

## Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```


# Sources
English words:
https://raw.githubusercontent.com/words/an-array-of-english-words/refs/heads/master/index.json

Spanish words:
https://raw.githubusercontent.com/words/an-array-of-spanish-words/refs/heads/master/index.json

Hebrew words:
https://he.wiktionary.org

German words:
`german_words.txt` (~1.6M German words)

