# Dictionary Regex

A web-based tool that allows users to search through a list of words using regular expressions. 


## Usage

1. Enter your regular expression in the input field
2. Click the "Find Matches" button to search
3. View the matches in the list below


## Setup

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

## Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```
