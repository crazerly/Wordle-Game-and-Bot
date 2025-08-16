
export async function selectWord(isDifficult) {
  console.log(isDifficult)
  let response;
  if (isDifficult) response = await fetch('/static/fiveletters.txt');
  else response = await fetch('/static/common5letters.txt');
  const text = await response.text();
  const words = text.split('\n').map(w => w.trim());
  // Return a random word
  return words[Math.floor(Math.random() * words.length)].toString();
}

export async function isValidWord(word) {
  const response = await fetch('/static/fiveletters.txt');
  const text = await response.text();
  const words = text.split('\n').map(w => w.trim());
  return words.includes(word);
}
