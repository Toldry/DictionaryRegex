# Regex Word Matcher

A web-based tool that allows users to search through a list of words using regular expressions. The tool provides real-time matching and highlighting capabilities for regex patterns.

## Features

- Search through a word list using regular expressions
- Display the total number of matches found
- Option to highlight sub-matches within words
- Shareable search links via URL hash
- Error handling for invalid regex patterns

## Usage

1. Enter your regular expression in the input field
2. Click the "Find Matches" button to search
3. View the matches in the list below
4. Toggle the "Colorize Sub-matches" option to highlight specific pattern matches within words

## Technical Details

The application:
- Loads words from a `words.txt` file
- Supports global regex matching
- Uses vanilla JavaScript with no external dependencies
- Implements URL hash-based sharing of search patterns

## Setup

1. Place the application files on a web server
2. Ensure `words.txt` exists in the same directory as `app.js`
3. Open the HTML file in a web browser

## Requirements

- A modern web browser with JavaScript enabled
- A web server (local or remote) to serve the files
- A `words.txt` file containing the word list (one word per line)

## Quick Start

There are two easy ways to serve the static files:

### Using Python (Option 1)

If you have Python installed (Python 3.x), you can start a simple HTTP server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

### Using Node.js (Option 2)

1. Install a simple static file server:
```bash
npm install -g http-server
```

2. Run the server:
```bash
http-server -p 8000
```

Then visit `http://localhost:8000` in your browser.

### Project Structure

Ensure your files are organized as follows:

## License

Created by Alon Eitan 