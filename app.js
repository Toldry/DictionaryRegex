/**
 * Created by Alon Eitan on 05/05/14.
 */

// Read the words file
var path='words.txt';
var request = new XMLHttpRequest();
var words = [];
request.open('GET', path, false);
request.onreadystatechange = function() {
    if(request.readyState === 4) {
        if (request.status === 200) {  // file is found
<<<<<<< HEAD
            words = request.responseText.split('\n').map(word => word.replace(/\r$/, ''));
=======
            words = request.responseText.split('\n');
            words = words.map(s => s.slice(0,-1));
>>>>>>> 04d4dd53bb97a872fc4e40c9f42236b40587b906
        }
    }
};
request.send();

var input_userInputBox = document.getElementsByName('input_regexTextField')[0];
var input_findMatchesButton = document.getElementsByName('input_findMatchesButton')[0];
var input_colorizeSubMatch = document.getElementsByName('input_colorizeSubMatch')[0];
var ol_matches = document.getElementsByName('ol_matches')[0];
var span_numberOfMatches = document.getElementsByName('span_numberOfMatches')[0];
var p_errorMessage = document.getElementsByName('p_errorMessage')[0];
var a_linkToQuery = document.getElementsByName('a_linkToQuery')[0];

var findMatches = function (regex) {
    console.log('Getting matches for regular expression: ' + regex);
    var matches = [];

    for (var i in words) {
        var word = words[i];

        if(!input_colorizeSubMatch.checked) {
            if(word.match(regex)) {
                matches.push(word);
            }
        }
        else {
            var arr = regex.exec(word);
            if(arr) {
                var matchInfo = { source: arr.input, subMatches: []};
                matchInfo.subMatches.push({startIndex: arr.index, endIndex: arr.index + arr[0].length})
                while(arr = regex.exec(word)) {
                    matchInfo.subMatches.push({startIndex: arr.index, endIndex: arr.index + arr[0].length})
                }
                matches.push(matchInfo);
            }
        }
    }

    return matches;
};

var onClickFindMatches = function() {
	// Remove previous matches
    span_numberOfMatches.innerText = '0';
    while(ol_matches.hasChildNodes()) {
        ol_matches.removeChild(ol_matches.lastChild);
    }

    p_errorMessage.style.display = 'none';

    var userInput = input_userInputBox.value;

	// Put text value in hash
    a_linkToQuery.href = '#' + encodeURIComponent(userInput);
    a_linkToQuery.innerHTML = a_linkToQuery.href;

    try {
        var regex = new RegExp(userInput, 'g');
    }
    catch(e) {
        p_errorMessage.style.display = 'block';
        console.error('Invalid regular expression');
        return;
    }

    var matches = findMatches(regex);

    span_numberOfMatches.innerText = matches.length.toString();

    // Add new matches
    for(var i in matches) {
        var match = matches[i];
        var listItem = document.createElement('li');

        if(!input_colorizeSubMatch.checked) {
            listItem.innerHTML = match;
        }
        else{
            var source = match.source;
            var parts=[];
            var lastSubMatchIndex = 0;

            for(var i in match.subMatches) {
                var subMatch = match.subMatches[i];
                var preSubMatchString = source.slice(lastSubMatchIndex, subMatch.startIndex);
                var subMatchString = source.slice(subMatch.startIndex, subMatch.endIndex);
                lastSubMatchIndex = subMatch.endIndex;
                parts.push(preSubMatchString);
                parts.push(subMatchString);
            }

            var tail = source.slice(lastSubMatchIndex, source.length - 1);
            parts.push(tail);

            for (var i in parts) {
                var part = parts[i];
                var partElement = document.createElement('span');
                partElement.innerHTML = part;
                if(i%2==1) {
                    partElement.className = 'subMatch';
                }
                listItem.appendChild(partElement);
            }
        }

        ol_matches.appendChild(listItem);
    }
};

// initialize element properties
input_findMatchesButton.onclick = onClickFindMatches;
a_linkToQuery.href = a_linkToQuery.innerHTML = window.location.href;

// Check hash link
if(window.location.hash) {
	input_userInputBox.value = decodeURIComponent(window.location.hash.split('#')[1]);
    onClickFindMatches();
}
<<<<<<< HEAD

// Add this function at the end of the file
function initializeExampleQueries() {
    const exampleLinks = document.querySelectorAll('.example-query');
    exampleLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = link.getAttribute('href').substring(1); // Remove the # symbol
            input_userInputBox.value = decodeURIComponent(hash);
            onClickFindMatches();
        });
    });
}

// Initialize the example queries
initializeExampleQueries();
=======
>>>>>>> 04d4dd53bb97a872fc4e40c9f42236b40587b906
