# Raining Like Cats and Dogs

# By Vadym Kolomiiets, CS30

A browser-based sorting game built with p5.js. Animals fall from the sky — press the right key to send each one to its correct side before the timer runs out.

---

## How to Play

Animals drop one at a time from the top of the screen. When an animal lands, you have a limited window to sort it correctly:

- Press **A** to send the animal left
- Press **D** to send the animal right

**Dogs go left. Cats go right.**
---

## Getting Started
1. Open `index.html` in a browser (p5.js must be included)
2. Make sure the following asset files are in the same folder as `sketch.js`:
   - `back_image.png` — background
   - `brit_cat.png`, `brit_walk.png` — cat sprites
   - `gold_dog_stand.png`, `gold_dog_walk.png` — dog sprites
   - `Metallica.mp3` — background music
3. Enter your name and press **Submit**
4. Choose a game mode and starting level

# **Note for Mr. Schellenberg:** If animals fall slower than expected, adjust `animalFall` and `barSpeed`. I explained all in details at the top of `sketch.js`

---

## Game Modes

### Single Player

- Sort as many animals as you can without making a mistake. Choose a starting difficulty level from 1–10 before the round begins.

### Competition (2 Players)

- Split-screen head-to-head mode. Player 1 uses **A / D**, Player 2 uses **← / →**. The player with more points when either person dies wins.

---

## Levels & Difficulty

- The starting level (1–10) sets the initial speed of the timer bar. As your score increases, the bar automatically speeds up every 10 points. Reaching each 10-point checkpoint triggers a level-up screen where you can choose your next difficulty.

---

## Leaderboard

- Best scores are saved to your browser's local storage. Access the leaderboard from the mode select screen.

---

## Dark Mode

- A dark mode toggle is available on the name entry screen. The setting applies to all menus and screens for the rest of the session.

---

## God Mode (Debug)

- Press **G** at any time during gameplay to freeze the timer bar. Press **G** again to unfreeze

---

## File Structure

```
sketch.js          — Main game code
index.html         — p5.js entry point
back_image.png     — Background image
brit_cat.png       — Cat idle sprite
brit_walk.png      — Cat walking sprite
gold_dog_stand.png — Dog idle sprite
gold_dog_walk.png  — Dog walking sprite
Metallica.mp3      — Background music
```

---

## Dependencies

- [p5.js](https://p5js.org/) — rendering and input
- [p5.sound](https://p5js.org/reference/p5.sound/) — music playback
- Browser local storage — score

---

## Known Quirks

- Animal fall speed can vary depending on the machine's frame rate. Adjust `animalFall` at the top of `sketch.js` if needed.
- Local storage is browser-specific — scores won't carry over to a different browser or device.

## Copying

- Anyone is more than welcome to copy and use my code as they wish. Make this game even cooler if you want to, for some reason...