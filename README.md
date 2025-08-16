A recreation of the game [Wordle](https://www.nytimes.com/games/wordle/index.html) in a web browser, with unlimited plays + a Wordle bot to calculate the optimal guess.  
The difficulty can be changed in the top-left of the screen. Normal difficulty picks a random word from a list of 2300, whereas hard difficulty picks from a different list of 13000 words.  
This is different from the official 'Hard Mode', which forces the player to use revealed hints, although I might add this mode as well in the future.

## Setup

1. Clone the script:

```bash
git clone https://github.com/crazerly/Wordle-Game-and-Bot.git
```

2. Install flask and flask-cors:

```bash
(python -m) pip install flask flask-cors
```

3. Run the bot:

```bash
python wordle_bot.py
```

4. Open the game in your browser:

```bash
http://127.0.0.1:5000/
```

## How the bot works

Each time you submit a guess, the bot stores your guess and corresponding pattern in a dictionary.  
Then when the bot runs, it uses this information to narrow down the set of possible answers.  
To calculate the best guess, the bot first calculates the entropy for each word in the full word list, and returns the guess with the highest entropy.  
'[Entropy](<https://en.wikipedia.org/wiki/Entropy_(information_theory)>)' refers to how many bits of information a word reveals about the answer. The higher the entropy of a word, the more words (on average) it can eliminate when guessed. You can learn more about entropy and how it's used to solve Wordle [here](https://www.youtube.com/watch?v=v68zYyaEmEA) in 3Blue1Brown's video.  
However, when the entropy for all words is equal, the bot picks a random word in the list of possible answers so that it doesn't pick an invalid guess.
