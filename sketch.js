// Major Project
// Vadym Kolomiiets

// --------------------------CREDENTIALS SECTION----------------------------------------------------------------------------------------------

//https://www.reddit.com/r/p5js/comments/1jdtnfr/how_to_remove_input_box/ 
// https://stackoverflow.com/questions/48936886/how-do-i-save-an-array-to-a-file-and-manipulate-it-from-within-my-code 

//LOCAL STORAGES:
//https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem
//https://blog.logrocket.com/localstorage-javascript-complete-guide/
//https://p5js.org/reference/p5/storeItem/
//https://thecodingtrain.com/tracks/p5-tips-and-tricks/more-p5/local-storage
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt 

//---------------------------------END OF CREDENTIALS---------------------------------------------------------------------------

// Player
let player;
let isDead = false;

// Array holding Place objects
let places = [];
let bar;
let points = 0;
let submitButton;
let button = null;

// Dark mode
let darkMode = false;
let darkModeToggle;

// Local Storage
let userList = [];
let myInput;
let currentUser = null;

let gameStart = false;

// -------------------------------------------------------------------- GAME MODE ---------------------------------------------------
//single player or competitiom
let gameMode = null;

//Competition mode Player2
let player2;
let isDead2 = false;
let places2 = [];
let bar2;
let points2 = 0;
let currentUser2 = null;
let myInput2;

//Mode buttons
let btnSingle;
let btnCompete;

// Second name input shown when competition is chosen
let submitButton2;

// -------------------------------------------------------------------- LOCAL STORAGE ---------------------------------------------------
let storage = {
  saveUsers() {
    localStorage.setItem(`userList`, JSON.stringify(userList));
  },
  loadUsers() {
    let stored = localStorage.getItem('userList');
    if (stored) {
      userList = JSON.parse(stored);
    }
  },
  getBestScore(name) {
    let key = `bestScore_` + name;
    let stored = localStorage.getItem(key);
    return stored ? parseInt(stored) : 0;
  },
  updateBestScore(name, score) {
    let key = `bestScore_` + name;
    let current = storage.getBestScore(name);
    if (score > current) {
      localStorage.setItem(key, score);
    }
  }
};

// -------------------------------------------------------------------- PRELOAD SECTION ---------------------------------------------------
let bgMusic;
function preload() {
  bgMusic = loadSound('https://cdn.freecodecamp.org/curriculum/js-music-player/scratching-the-surface.mp3');
}

// -------------------------------------------------------------------- GAME LOGIC ---------------------------------------------------
function setup() {
  createCanvas(500, 500);
  player = new Player();
  bar = new Bar();
  places.push(new Place());

  storage.loadUsers();
  bgMusic.loop();

  myInput = createInput('Enter your name');
  myInput.position(width / 2 - 90, height / 2);

  submitButton = createButton('Submit');
  submitButton.position(myInput.x + 60, height / 2 + 50);
  submitButton.mousePressed(saveInput);

  darkModeToggle = createCheckbox(' Dark Mode', false);
  darkModeToggle.position(width / 2 - 90, height / 2 + 85);
  darkModeToggle.changed(() => {
    darkMode = darkModeToggle.checked();
  });
}

function draw() {
  //Mode selection screen
  if (currentUser !== null && gameMode === null) {
    drawModeSelect();
    return;
  }

  //Single-player
  if (gameMode === "single") {
    if (!isDead) {
      running();
    } else {
      if (currentUser !== null) {
        storage.updateBestScore(currentUser, points);
      }
      noLoop();
      drawDeathScreen();
    }
    return;
  }

  //Competition
  if (gameMode === "competition") {
    if (!isDead && !isDead2) {
      runningCompetition();
      return;
    }

    if (currentUser !== null) storage.updateBestScore(currentUser, points);
    if (currentUser2 !== null) storage.updateBestScore(currentUser2, points2);
    noLoop();
    drawCompetitionOver();
  }
}

function keyPressed() {
  // ---- Single player controls ----
  if (gameMode === "single" && !isDead && places[0].active) {
    if (key === 'a' || key === 'A') places[0].move("left");
    else if (key === 'd' || key === 'D') places[0].move("right");
  }

  // ---- Competition controls ----
  if (gameMode === "competition") {
    if (!isDead && places[0] && places[0].active) {
      if (key === 'a' || key === 'A') places[0].move("left");
      else if (key === 'd' || key === 'D') places[0].move("right");
    }
    if (!isDead2 && places2[0] && places2[0].active) {
      if (keyCode === LEFT_ARROW) places2[0].move2("left");
      else if (keyCode === RIGHT_ARROW) places2[0].move2("right");
    }
  }
}

// -------------------------------------------------------------------------- MY OWN FUNCTIONS -------------------------------------------
//Choose mode
function drawModeSelect() {
  background(darkMode ? 30 : 220);
  textAlign(CENTER);
  fill(darkMode ? 220 : 30);
  textSize(22);
  text(`Hi, ${currentUser}! Choose a mode:`, width / 2, height / 2 - 60);
}
//Saving user input
function saveInput() {
  let userInput = myInput.value();
  if (userInput === '') return;

  currentUser = userInput;

  if (!userList.includes(userInput)) {
    userList.push(userInput);
    storage.saveUsers();
  }

  myInput.remove();
  submitButton.remove();
  darkModeToggle.remove();
  myInput.value('');

  showModeButtons();
}
//Showing mode buttons
function showModeButtons() {
  btnSingle = createButton('Single Player');
  btnSingle.position(width / 2 - 110, height / 2);
  btnSingle.mousePressed(startSingle);

  btnCompete = createButton('Competition (2 players)');
  btnCompete.position(width / 2 - 110, height / 2 + 45);
  btnCompete.mousePressed(showPlayer2Input);
}
//Play as single-player
function startSingle() {
  btnSingle.remove();
  btnCompete.remove();
  btnSingle = null;
  btnCompete = null;
  gameMode = "single";
  gameStart = true;
}
//Show input for second player
function showPlayer2Input() {
  btnSingle.remove();
  btnCompete.remove();
  btnSingle = null;
  btnCompete = null;

  myInput2 = createInput('Player 2 name');
  myInput2.position(width / 2 - 90, height / 2);

  submitButton2 = createButton('Start Competition');
  submitButton2.position(width / 2 - 65, height / 2 + 50);
  submitButton2.mousePressed(startCompetition);
}
//Start game as competition
function startCompetition() {
  let name2 = myInput2.value().trim();
  if (name2 === '') return;

  currentUser2 = name2;

  if (!userList.includes(name2)) {
    userList.push(name2);
    storage.saveUsers();
  }

  myInput2.remove();
  submitButton2.remove();

  resizeCanvas(1000, 500);
  player2 = new Player2();
  bar2 = new Bar();
  places2.push(new Place());

  gameMode = "competition";
  gameStart = true;
}

//Starts our gameplay
function running() {
  if (!gameStart) return;

  background(darkMode ? 30 : 220);

  if (!isDead && userList.length > 0) {
    displayPlaces();
    player.display();
    displayUI();

    if (currentUser !== null) {
      let best = storage.getBestScore(currentUser);
      textAlign(CENTER);
      textSize(16);
      fill(darkMode ? 200 : 30);
      text(`Best: ${best} | Player: ${currentUser}`, width / 2, 60);
    }
  }
}
//Makes competition work
function runningCompetition() {
  drawLeftHalf();
  drawRightHalf();
}
//Restarts the game
function restart() {
  points = 0;
  places = [];
  places.push(new Place());
  bar.f = 0;
  isDead = false;

  if (gameMode === "competition") {
    points2 = 0;
    places2 = [];
    places2.push(new Place());
    bar2.f = 0;
    isDead2 = false;
  }

  if (button) {
    button.remove();
    button = null;
  }
  loop();
}

// --------------------------------------------------------------- DISPLAYING -----------------------------------------------------------
//Displaying places, that shows direction for first player
function displayPlaces() {
  for (let i = 0; i < places.length; i++) {
    places[i].display();
    if (!places[i].active) {
      places[i].spawn();
    } else if (places[i].guessed) {
      places[i].transform(places[i].dir);
    }
  }
}
//Displaying places, that shows direction for Player2
function displayPlaces2() {
  for (let i = 0; i < places2.length; i++) {
    places2[i].display();
    if (!places2[i].active) {
      places2[i].spawn();
    } else if (places2[i].guessed) {
      places2[i].transform(places2[i].dir);
    }
  }
}
//Displays user interface
function displayUI() {
  bar.display();
  bar.update();

  textSize(14);
  fill(darkMode ? 180 : 80);
  textAlign(CENTER);
  text("A = Left   |   D = Right", width / 2, height - 15);

  textSize(18);
  fill(darkMode ? 220 : 30);
  textAlign(LEFT);
  text(`Points : ${points}`, 20, 30);
}

// --------------------------------------------------------------- SPLIT SCREEN -----------------------------------------------------------
//Draws the gameplay for the first player
function drawLeftHalf() {
  push();

  fill(darkMode ? 30 : 220);
  noStroke();
  rect(0, 0, 500, 500);

  stroke(darkMode ? 160 : 80);
  strokeWeight(2);
  line(500, 0, 500, 500);
  noStroke();

  textAlign(CENTER);
  textSize(14);
  fill(darkMode ? 180 : 60);
  text(`P1: ${currentUser}  |  A = Left  D = Right`, 250, height - 15);

  textSize(18);
  fill(darkMode ? 220 : 30);
  textAlign(LEFT);
  text(`Points: ${points}`, 10, 30);

  let best = storage.getBestScore(currentUser);
  textAlign(CENTER);
  textSize(14);
  fill(darkMode ? 180 : 50);
  text(`Best: ${best}`, 250, 60);

  bar.displayAt(250, 85, 180);
  bar.update();
  if (bar.f >= bar.l) isDead = true;

  displayPlaces();
  player.display();

  pop();
}
//Draws the gameplay for the second player
function drawRightHalf() {
  push();
  translate(500, 0);

  fill(darkMode ? 40 : 205);
  noStroke();
  rect(0, 0, 500, 500);

  textAlign(CENTER);
  textSize(14);
  fill(darkMode ? 180 : 60);
  text(`P2: ${currentUser2}  |  ← = Left  → = Right`, 250, height - 15);

  textSize(18);
  fill(darkMode ? 220 : 30);
  textAlign(LEFT);
  text(`Points: ${points2}`, 10, 30);

  let best2 = storage.getBestScore(currentUser2);
  textAlign(CENTER);
  textSize(14);
  fill(darkMode ? 180 : 50);
  text(`Best: ${best2}`, 250, 60);

  bar2.displayAt(250, 85, 180);
  bar2.update();
  if (bar2.f >= bar2.l) isDead2 = true;

  displayPlaces2();
  player2.display();

  pop();
}

// --------------------------------------------------------------- DEATH SCREENS -----------------------------------------------------------
//Draws the death screen for single player
function drawDeathScreen() {
  background(darkMode ? 30 : 220);
  textAlign(CENTER);
  fill(darkMode ? 220 : 30);
  textSize(40);
  text("Oops, you're dead!", width / 2, height / 2 - 40);

  textSize(30);
  text(`Points : ${points}`, width / 2, height / 2);

  if (currentUser !== null) {
    let best = storage.getBestScore(currentUser);
    textSize(25);
    fill(darkMode ? 200 : 60);
    text(`Best Score: ${best}`, width / 2, height / 2 + 30);
  }

  if (button === null) {
    button = createButton('Play Again');
    button.position(width / 2 - 50, height / 2 + 45);
    button.mousePressed(restart);
  }
}

//Draws death screen for competition
function drawCompetitionOver() {
  background(darkMode ? 30 : 220);

  let winner, loser, winPoints, losePoints;

  if (isDead && !isDead2) {
    // P1 died, P2 still alive, check if scores are equal
    if (points === points2) {
      winner = null;
    } else {
      winner = currentUser2; 
      winPoints = points2;
      loser = currentUser;  
      losePoints = points;
    }
  } else if (isDead2 && !isDead) {
    // P2 died, P1 still alive, check if scores are equal
    if (points === points2) {
      winner = null;
    } else {
      winner = currentUser;  
      winPoints = points;
      loser = currentUser2; 
      losePoints = points2;
    }
  } else {
    // Both died on the same frame
    winner = null;
  }

  textAlign(CENTER);
  fill(darkMode ? 220 : 30);
  textSize(36);
  text("GAME OVER", width / 2, height / 2 - 90);

  //Shows the winner
  if (winner) {
    textSize(28);
    fill(0, 180, 100);
    text(`${winner} wins!`, width / 2, height / 2 - 45);

    textSize(20);
    fill(darkMode ? 200 : 50);
    text(`${winner}: ${winPoints} pts   |   ${loser}: ${losePoints} pts`, width / 2, height / 2);
  } else {
    textSize(28);
    fill(darkMode ? 200 : 80);
    text("It's a tie!", width / 2, height / 2 - 45);
    textSize(20);
    fill(darkMode ? 180 : 60);
    text(`${currentUser}: ${points}   |   ${currentUser2}: ${points2}`, width / 2, height / 2);
  }

  textSize(16);
  fill(darkMode ? 160 : 80);
  text(`${currentUser} best: ${storage.getBestScore(currentUser)}   |   ${currentUser2} best: ${storage.getBestScore(currentUser2)}`, width / 2, height / 2 + 35);

  if (button === null) {
    button = createButton('Play Again');
    button.position(width / 2 - 50, height / 2 + 60);
    button.mousePressed(restart);
  }
}

// ---------------------------------------------------------------------- CLASSES -------------------------------------------------------
//Displaying places
class Place {
  constructor() {
    this.l = 50;
    this.x = 250;        // Fixed: always centre of whichever half renders this
    this.y = this.l;
    this.v = 20;
    this.active = false;
    this.guessed = false;
    this.dir = random() < 0.5 ? "left" : "right";
  }

  display() {
    rectMode(CENTER);
    noStroke();
    fill(darkMode ? 220 : 0);
    rect(this.x, this.y, this.l, this.l);

    fill("red");
    if (this.dir === "left") {
      rect(this.x - 20, this.y, 10, this.l);
    } else {
      rect(this.x + 20, this.y, 10, this.l);
    }
  }

  spawn() {
    if (this.y < height / 2) {
      this.y += this.v;
    } else {
      this.active = true;
    }
  }

  transform(dir) {
    if (dir === "left") {
      if (this.x > 75) this.x -= this.v / 2;
    } else {
      if (this.x < 425) this.x += this.v / 2; // Fixed: clamped to 500px half
    }
  }

  //Direction for the first player
  move(dir) {
    if (dir !== this.dir) {
      isDead = true;
    } else {
      bar.f = 0;
      this.guessed = true;
      places.unshift(new Place());
      places.splice(2, 1);
      points++;
    }
  }

  //Direction for second player
  move2(dir) {
    if (dir !== this.dir) {
      isDead2 = true;
    } else {
      bar2.f = 0;
      this.guessed = true;
      places2.unshift(new Place());
      places2.splice(2, 1);
      points2++;
    }
  }
}

//Displaying health bar
class Bar {
  constructor() {
    this.x = 250;
    this.y = 85;
    this.l = 180;
    this.f = 0;
  }

  display() {
    this.displayAt(this.x, this.y, this.l);
  }

  displayAt(cx, cy, len) {
    strokeWeight(4);
    stroke(darkMode ? 180 : 30);
    fill(darkMode ? 60 : 220);
    rectMode(CENTER);
    rect(cx, cy, len, len / 20);

    noStroke();
    fill(204, 0, 0);
    rectMode(CORNER);
    rect(cx - len / 2, cy - len / 40, (this.f / this.l) * len, len / 20);
  }

  update() {
    if (this.f < this.l) {
      this.f += 3.2;
    } else {
      isDead = true;
    }
  }
}

//Displays first player
class Player {
  constructor() {
    this.d = 25;
    this.x = 250;
    this.y = height / 2;
  }

  display() {
    noStroke();
    fill(51, 255, 255);
    ellipse(this.x, this.y, this.d);
  }
}

//Displays second player
class Player2 {
  constructor() {
    this.d = 25;
    this.x = 250;
    this.y = height / 2;
  }

  display() {
    noStroke();
    fill(255, 150, 51);
    ellipse(this.x, this.y, this.d);
  }
}
