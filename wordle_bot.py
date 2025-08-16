from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from collections import defaultdict, Counter
import math

app = Flask(__name__, static_url_path='/static')
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5000"}})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/log', methods=['POST'])
def log_request():
    data = request.get_json()
    print("Received POST request to /Games/Wordle:", data)
    return jsonify({'message': 'Log received successfully!'}), 200

with open("static/common5letters.txt", "r") as file:
    wordle_words = file.read().splitlines()

with open("static/fiveletters.txt", "r") as file:
    word_list = file.read().splitlines()

possible_words = []
history = {} # Stores previous guesses and their patterns

@app.route('/update_difficulty', methods=['POST'])
def update_difficulty():
    global possible_words
    data = request.get_json()
    if (data == "on"):
        possible_words = list(word_list)
    else:
        possible_words = list(wordle_words)
    return '', 204


@app.route('/clear_word_list', methods=['POST'])
def clear_word_list():
    global history
    history.clear()
    return '', 204

@app.route('/update_word_list', methods=['POST'])
def update_word_list():
    data = request.get_json()
    guess = data.get("guess", "")
    guess_pattern = data.get("guessPattern", "")
    history[guess] = guess_pattern
    input = f"{guess}, {guess_pattern}"
    response = jsonify({"message": input})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

@app.route('/get_best_word', methods=['POST'])
def get_best_word():
    result = calc_best_guess()
    response = jsonify({"message": result})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

# Calculates the pattern of the guess given the answer
def calc_pattern(guess: str, answer: str) -> str:
    pattern = ['B'] * 5
    answer_pattern = Counter(answer)

    # First pass for greens
    for i in range(5):
        if guess[i] == answer[i]:
            pattern[i] = 'G'
            answer_pattern[guess[i]] -= 1
    
    # Second pass for yellows
    for i in range(5):
        if pattern[i] == 'B' and guess[i] in answer_pattern and answer_pattern[guess[i]] > 0:
            pattern[i] = 'Y'
            answer_pattern[guess[i]] -= 1
    
    return ''.join(pattern)

# Find possible answers
def is_valid_candidate(word: str) -> bool:
    for guess, pattern in history.items():
        if calc_pattern(guess, word) != pattern: 
            return False
    return True

def calc_best_guess():
    possible_words[:] = [word for word in possible_words if is_valid_candidate(word)]
    entropy = {}

    # Compute entropy for all possible guesses
    for guess in word_list:
        pattern_freq = defaultdict(int)

        for answer in possible_words:
            pattern = calc_pattern(guess, answer)
            pattern_freq[pattern] += 1

        total = len(possible_words)
        e = 0
        for count in pattern_freq.values():
            p = count / total # probability of pattern
            e += p * math.log2(1 / p) # entropy formula to calculate bits of information
        entropy[guess] = e
    guesses = sorted(entropy.items(), key=lambda item: item[1], reverse=True)
    # Returns a random possible guess - here, the first in the list - if all patterns are unique
    return guesses[0][0] if guesses[0][1] > 1 else possible_words[0]

if __name__ == '__main__':
    app.run(debug=True, port=5000)