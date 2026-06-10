// Raining like cats and dogs
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

//Music upload, I gotta work on it hard I guess
//https://firebase.google.com/products/hosting?utm_source=chatgpt.com
//---------------------------------END OF CREDENTIALS---------------------------------------------------------------------------

//Player
let player;
let isDead = false;

//Array holding Place objects
let places = [];
let bar;
let points = 0;
let submitButton;
let button = null;

//Dark mode
let darkMode = false;
let darkModeToggle;

//Local Storage
let userList = [];
let myInput;
let currentUser = null;

let gameStart = false;

//Assets
let bgImg;
let catImgs = {};
let dogImgs = {};

//Single player or competition
let gameMode = null;

//Levels
let chosenLevel = 1;
let levelUp = false;
let lastCheckpoint = 0;

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

//Stores level selection buttons
let levelButtons = []; 

//Second name input
let submitButton2;

//God mode
let barPaused = false;

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

function preload() {

  //Load Music
  bgMusic = loadSound('Metallica.mp3');

  //Load background
  bgImg = loadImage('back_image.png');

  //Load cat images
  catImgs.idle = loadImage('brit_cat.png');
  catImgs.walk = loadImage('brit_walk.png');

  //Load dog images
  dogImgs.idle = loadImage('gold_dog_stand.png');
  dogImgs.walk = loadImage('gold_dog_walk.png');
}

// -------------------------------------------------------------------- GAME LOGIC ---------------------------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player();
  bar = new Bar();
  places.push(new Place());

  storage.loadUsers();
  bgMusic.loop();

  myInput = createInput('Enter your name');
  myInput.position(windowWidth / 2 - 90, windowHeight / 2);

  submitButton = createButton('Submit');
  submitButton.position(windowWidth / 2 - 90, windowHeight / 2 + 50);
  submitButton.mousePressed(saveInput);

  darkModeToggle = createCheckbox(' Dark Mode', false);
  darkModeToggle.position(windowWidth / 2 - 90, windowHeight / 2 + 70);
  darkModeToggle.changed(() => {
    darkMode = darkModeToggle.checked();
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  //Mode selection screen
  if (currentUser !== null && gameMode === null) {
    drawModeSelect();
    return;
  }

  //Single-player
  if (gameMode === "single") {
    if (levelUp) {
      drawLevelUpScreen();
      return;
    }
    if (!isDead) {
      running();
    }
    else {
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

    if (currentUser !== null) {
      storage.updateBestScore(currentUser, points);
    }
    if (currentUser2 !== null) {
      storage.updateBestScore(currentUser2, points2);
    }
    noLoop();
    drawCompetitionOver();
  }
}

function keyPressed() {

  //For God mode

  if (key === 'g' || key === 'G') {
    barPaused = !barPaused;
  }

  //Single player controls
  if (gameMode === "single" && !isDead && places[0].active) {
    if (key === 'a' || key === 'A') {
      places[0].move("left");
    }
    else if (key === 'd' || key === 'D') {
      places[0].move("right");
    }
  }

  //Competition controls
  if (gameMode === "competition") {
    if (!isDead && places[0] && places[0].active) {
      if (key === 'a' || key === 'A') {
        places[0].move("left");
      }
      else if (key === 'd' || key === 'D') {
        places[0].move("right");
      }
    }
    if (!isDead2 && places2[0] && places2[0].active) {
      if (keyCode === LEFT_ARROW) {
        places2[0].move2("left");
      }
      else if (keyCode === RIGHT_ARROW) {
        places2[0].move2("right");
      }
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
  if (userInput === '') {
    return;
  }
  currentUser = userInput;

  if (!userList.includes(userInput)) {
    userList.push(userInput);
    storage.saveUsers();
  }

  myInput.remove();
  submitButton.remove();
  darkModeToggle.remove();
  showModeButtons();
}

//Showing mode buttons
function showModeButtons() {
  btnSingle = createButton('Single Player');
  btnSingle.position(width / 2 - 110, height / 2 - 70);
  btnSingle.mousePressed(showLevelButtons);

  btnCompete = createButton('Competition (2 players)');
  btnCompete.position(width / 2 - 210, height / 2 + 10);
  btnCompete.mousePressed(showPlayer2Input);
}

//Show level selection buttons
function showLevelButtons() {
  btnSingle.remove();
  btnCompete.remove();
  btnSingle = null;
  btnCompete = null;

  for (let i = 1; i <= 10; i++) {
    let b = createButton('' + i);
    b.position(width / 2 - 270 + (i * 55), height / 2);
    b.mousePressed(() => startSingle(i));
    levelButtons.push(b);
  }
}

//Play as single-player with chosen level
function startSingle(lvl) {
  for (let b of levelButtons) {
    b.remove();
  }
  levelButtons = [];
  chosenLevel = lvl;
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
  submitButton2.position(width / 2 - 185, height / 2 + 20);
  submitButton2.mousePressed(startCompetition);
}

//Start game as competition
function startCompetition() {
  let name2 = myInput2.value().trim();
  if (name2 === '') {
    return;
  }

  currentUser2 = name2;

  if (!userList.includes(name2)) {
    userList.push(name2);
    storage.saveUsers();
  }

  myInput2.remove();
  submitButton2.remove();

  resizeCanvas(windowWidth, windowHeight);
  player2 = new Player2();
  bar2 = new Bar();

  //Reset first player places to use left half
  places = [];
  places.push(new Place(width / 4));
  bar.f = 0;
  places2.push(new Place(width / 4));

  gameMode = "competition";
  gameStart = true;
}

//Starts our gameplay
function running() {
  if (!gameStart) {
    return;
  }

  imageMode(CORNER);
  image(bgImg, 0, 0, width, height);

  if (!isDead && userList.length > 0) {
    displayPlaces();
    displayUI();

    if (currentUser !== null) {
      let best = storage.getBestScore(currentUser);
      textAlign(CENTER);
      textSize(22);
      fill(darkMode ? 200 : 30);
      text(`Best: ${best} | Player: ${currentUser} | Lvl: ${chosenLevel}`, width / 2, 30);
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
  lastCheckpoint = 0;
  levelUp = false;
  places = [];
  places.push(new Place(gameMode === "competition" ? width / 4 : width / 2));
  bar.f = 0;
  isDead = false;

  if (gameMode === "competition") {
    points2 = 0;
    places2 = [];
    places2.push(new Place(width / 4));
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
//Displays animals for the first Player
function displayPlaces() {
  for (let i = 0; i < places.length; i++) {
    places[i].display();

    if (!places[i].active) {
      places[i].spawn();
    }
    else if (places[i].guessed) {
      places[i].transform();
    }
  }
}

//Displays animals for the second Player
function displayPlaces2() {
  for (let i = 0; i < places2.length; i++) {
    places2[i].display();

    if (!places2[i].active) {
      places2[i].spawn();
    }
    else if (places2[i].guessed) {
      places2[i].transform();
    }
  }
}

//Shows the score bar and controls hint
function displayUI() {
  bar.display();
  bar.update();

  textSize(20);
  fill(darkMode ? 180 : 80);
  textAlign(CENTER);
  text("A = Left   |   D = Right", width / 2, height - 20);

  textSize(28);
  fill(darkMode ? 220 : 30);
  textAlign(LEFT);
  text(`Points : ${points}`, 20, 35);
}

// --------------------------------------------------------------- SPLIT SCREEN -----------------------------------------------------------
//Draws the side of first Player
function drawLeftHalf() {
  push();
  imageMode(CORNER);
  image(bgImg, 0, 0, width / 2, height);

  stroke(darkMode ? 160 : 80);
  strokeWeight(2);
  line(width / 2, 0, width / 2, height);
  noStroke();

  textAlign(CENTER);
  textSize(20);
  fill(darkMode ? 180 : 60);
  text(`P1: ${currentUser}  |  A = Left  D = Right`, width / 4, height - 20);

  textSize(28);
  fill(darkMode ? 220 : 30);
  textAlign(LEFT);
  text(`Points: ${points}`, 10, 35);

  let best = storage.getBestScore(currentUser);
  textAlign(CENTER);
  textSize(22);
  fill(darkMode ? 180 : 50);
  text(`Best: ${best}`, width / 4, 30);

  bar.displayAt(width / 4, height * 0.06, width * 0.18);
  bar.update();

  displayPlaces();
  pop();
}

//Draws the side of Player2
function drawRightHalf() {
  push();
  translate(width / 2, 0);
  imageMode(CORNER);
  image(bgImg, 0, 0, width / 2, height);

  textAlign(CENTER);
  textSize(20);
  fill(darkMode ? 180 : 60);
  text(`P2: ${currentUser2}  |  ← = Left  → = Right`, width / 4, height - 20);

  textSize(28);
  fill(darkMode ? 220 : 30);
  textAlign(LEFT);
  text(`Points: ${points2}`, 10, 35);

  let best2 = storage.getBestScore(currentUser2);
  textAlign(CENTER);
  textSize(22);
  fill(darkMode ? 180 : 50);
  text(`Best: ${best2}`, width / 4, 30);

  bar2.displayAt(width / 4, height * 0.06, width * 0.18);
  bar2.update();

  displayPlaces2();
  pop();
}

// --------------------------------------------------------------- LEVEL UP SCREEN -----------------------------------------------------------
//Draws the level-up pause screen
function drawLevelUpScreen() {
  background(darkMode ? 30 : 220);
  textAlign(CENTER);
  fill(darkMode ? 220 : 30);
  textSize(40);
  text(`Level ${chosenLevel} Complete!`, width / 2, height / 2 - 100);
  textSize(28);
  text(`You reached ${points} points!`, width / 2, height / 2 - 50);
  textSize(22);
  if (chosenLevel < 10) {
    text(`Starting Level ${chosenLevel + 1} — choose your difficulty:`, width / 2, height / 2 - 10);
  }
  else {
    text(`Max level reached! Choose a difficulty to keep going:`, width / 2, height / 2 - 10);
  }
}

//Creates the level buttons on the level-up screen
function showLevelUpButtons() {
  for (let i = 1; i <= 10; i++) {
    let b = createButton('' + i);
    b.position(width / 2 - 270 + (i * 55), height / 2 + 30);
    b.mousePressed(() => resumeFromLevelUp(i));
    levelButtons.push(b);
  }
}

//Resumes gameplay after a level is chosen
function resumeFromLevelUp(lvl) {
  for (let b of levelButtons) {
    b.remove();
  }
  levelButtons = [];
  chosenLevel = lvl;
  levelUp = false;
  loop();
}

function drawDeathScreen() {
  background(darkMode ? 30 : 220);
  textAlign(CENTER);
  fill(darkMode ? 220 : 30);
  textSize(40);
  text("Oops, you're dead!", width / 2, height / 2 - 40);
  textSize(30);
  text(`Points : ${points}`, width / 2, height / 2);

  if (button === null) {
    button = createButton('Play Again');
    button.position(width / 2 - 120, height / 2 + 45);
    button.mousePressed(restart);
  }
}

function drawCompetitionOver() {
  background(darkMode ? 30 : 220);
  textAlign(CENTER);
  fill(darkMode ? 220 : 30);
  textSize(36);
  text("GAME OVER", width / 2, height / 2 - 90);

  //Shows up the winner
  textSize(28);
  if (points > points2) {
    text(`${currentUser} wins with ${points} points!`, width / 2, height / 2 - 40);
  }
  else if (points2 > points) {
    text(`${currentUser2} wins with ${points2} points!`, width / 2, height / 2 - 40);
  }
  else {
    text(`It's a tie! Both scored ${points} points.`, width / 2, height / 2 - 40);
  }

  if (button === null) {
    button = createButton('Play Again');
    button.position(width / 2 - 120, height / 2 + 60);
    button.mousePressed(restart);
  }
}

// ---------------------------------------------------------------------- CLASSES -------------------------------------------------------
//Simply: directing animals, playing their animation, determine which way they go
class Place {
  constructor(xCenter) {
    this.l = 120;
    this.xCenter = xCenter !== undefined ? xCenter : width / 2;
    this.x = this.xCenter;
    this.y = 50;
    this.v = 5;
    this.active = false;
    this.guessed = false;
    this.type = random() < 0.5 ? "dog" : "cat";
    this.isWalking = false;
  }

  display() {
    let img = this.isWalking
      ? this.type === "dog" ? dogImgs.walk : catImgs.walk
      : this.type === "dog" ? dogImgs.idle : catImgs.idle;
    imageMode(CENTER);
    image(img, this.x, this.y, this.l, this.l);
  }

  spawn() {
    //If the animal reaches the mat position, mark it as active
    if (this.y < height * 0.7) {
      this.y += this.v + 13;
    }
    else {
      this.active = true;
    }
  }

  transform() {
    this.isWalking = true;
    //Dogs go left, cats go right
    let correctDir = this.type === "dog" ? "left" : "right";
    let halfW = this.xCenter * 2;
    if (correctDir === "left") {
      if (this.x > halfW * 0.15) {
        this.x -= this.v / 2 + 7;
      }
    }
    else {
      if (this.x < halfW * 0.85) {
        this.x += this.v / 2 + 7;
      }
    }
  }

  move(dir) {
    //If cat type is chosen, right is correct
    let correctDir = this.type === "dog" ? "left" : "right";

    if (dir !== correctDir) {
      isDead = true;
    }
    else {
      bar.f = 0;
      this.guessed = true;
      places.unshift(new Place(this.xCenter));
      places.splice(2, 1);
      points++;

      //Trigger level-up screen at total score
      let nextCheckpoint = (Math.floor(lastCheckpoint / 10) + 1) * 10;
      if (points >= nextCheckpoint && nextCheckpoint <= 100) {
        lastCheckpoint = nextCheckpoint;
        chosenLevel = nextCheckpoint / 10;
        levelUp = true;
        noLoop();
        showLevelUpButtons();
      }
    }
  }

  move2(dir) {
    let correctDir = this.type === "dog" ? "left" : "right";
    if (dir !== correctDir) {
      isDead2 = true;
    }
    else {
      bar2.f = 0;
      this.guessed = true;
      places2.unshift(new Place(this.xCenter));
      places2.splice(2, 1);
      points2++;
    }
  }
}

//Health Bar
class Bar {
  constructor() {
    this.x = width / 2;
    this.y = height * 0.06;
    this.l = width * 0.18;
    this.f = 0;
  }

  getSpeed() {
    //Bar is faster at higher points and level
    let currentPoints = (this === bar) ? points : points2;
    let level = Math.floor(currentPoints / 10) + 1 + (chosenLevel - 1);
    return min(8, 2.5 + (level - 1) * 1.5);
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
    rect(cx - len / 2, cy - len / 40, this.f / this.l * len, len / 20);
  }

  update() {
    //Enters God mode
    if (barPaused) return;
    
    if (this.f < this.l) {
      this.f += this.getSpeed();
    }
    else {
      if (this === bar) {
        isDead = true;
      } else {
        isDead2 = true;
      }
    }
  }
}

//Shows up animals on left side
class Player {
  constructor() {
    this.x = 250;
    this.y = 400;
  }
  display() {
    let p = places[0];
    let img = p.type === "dog" ? dogImgs.idle : catImgs.idle;
    imageMode(CENTER);
    image(img, this.x, this.y, 80, 80);
  }
}

//Shows up animals on right side
class Player2 {
  constructor() {
    this.x = 250;
    this.y = 400;
  }
  display() {
    let p = places2[0];
    let img = p.type === "dog" ? dogImgs.idle : catImgs.idle;
    imageMode(CENTER);
    image(img, this.x, this.y, 80, 80);
  }
}