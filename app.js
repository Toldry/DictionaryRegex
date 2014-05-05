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
            words = request.responseText.split('\n');
        }
    }
}
request.send();

var input_userInputBox = document.getElementsByName('input_regexTextField')[0];
var input_findMatchesButton = document.getElementsByName('input_findMatchesButton')[0];
var ol_matches = document.getElementsByName('ol_matches')[0];
var span_numberOfMatches = document.getElementsByName('span_numberOfMatches')[0];
var p_errorMessage = document.getElementsByName('p_errorMessage')[0];

var findMatches = function(regex) {
    console.log('Getting matches for regular expression: ' + regex);
    var matches = [];

    for(var i in words) {
        var word = words[i];
        if(word.match(regex)) {
            matches.push(word);
        }
    }

    return matches;
}

input_findMatchesButton.onclick = function() {
    // Remove previous matches
    span_numberOfMatches.innerText = '0';
    while(ol_matches.hasChildNodes()) {
        ol_matches.removeChild(ol_matches.lastChild);
    }

    p_errorMessage.style.display = 'none';

    var userInput = input_userInputBox.value;

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
        listItem.innerHTML = match;
        ol_matches.appendChild(listItem);
    }
}