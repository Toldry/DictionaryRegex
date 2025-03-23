import requests
from bs4 import BeautifulSoup
import time
import os

def scrape_hebrew_words(start_url):
    # Store all words
    all_words = []
    current_url = start_url
    
    while current_url:
        try:
            # Add delay to be respectful to the server
            time.sleep(1)
            
            # Get the page content
            response = requests.get(current_url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find all list items
            list_items = soup.find_all('li')
            
            # Extract text from list items
            for item in list_items:
                # Only add items that contain text and aren't navigation elements
                if item.string and not item.find_parent('div', class_='mw-navigation'):
                    all_words.append(item.string.strip())
            
            # Find the "next page" link
            next_link = None
            for link in soup.find_all('a'):
                if 'הדף הבא' in link.text:
                    next_link = link
                    break
            
            if next_link:
                # Construct absolute URL for next page
                base_url = 'https://he.wiktionary.org'
                current_url = base_url + next_link['href']
                print(f"Moving to next page: {current_url}")
            else:
                current_url = None
                print("No more pages to scrape")
                
        except Exception as e:
            print(f"Error occurred: {e}")
            break
    
    print(f"Scraped {len(all_words)} unique words")
    return all_words

def save_hebrew_words(output_file='raw_hebrew_words.txt'):
    # Check if file already exists
    if os.path.exists(output_file):
        print(f"File {output_file} already exists. Skipping scraping.")
        return

    start_url = f"https://he.wiktionary.org/wiki/מיוחד:כל_הדפים/א"
    words = scrape_hebrew_words(start_url)

    # Save words to file
    with open(output_file, 'w', encoding='utf-8') as f:
        for word in sorted(words):
            f.write(word + '\n')

def filter_hebrew_words(input_file='raw_hebrew_words.txt', output_file='hebrew_words.txt'):
    # Check if output file already exists
    if os.path.exists(output_file):
        print(f"File {output_file} already exists. Skipping filtering.")
        return

    # Define Hebrew letters
    hebrew_letters = set('אבגדהוזחטיכלמנסעפצקרשת')

    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Input file {input_file} not found.")
        return

    # Read and filter words
    filtered_words = set()  # Using set to automatically handle duplicates (condition 5)
    
    with open(input_file, 'r', encoding='utf-8') as f:
        for word in f:
            word = word.strip()
            
            # Apply filters
            if (len(word) > 1 and                     # condition 1
                ' ' not in word and                   # condition 2
                not word.endswith('(שורש)') and      # condition 3
                any(char in hebrew_letters for char in word) and  # condition 4
                word):                                # ensure non-empty string
                filtered_words.add(word)

    # Save filtered words to new file
    with open(output_file, 'w', encoding='utf-8') as f:
        for word in sorted(filtered_words):
            f.write(word + '\n')
    
    print(f"Filtered words saved to {output_file}")

if __name__ == "__main__":
    save_hebrew_words()
    filter_hebrew_words()