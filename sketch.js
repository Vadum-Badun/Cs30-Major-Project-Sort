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

//Assets(simply imgages)
let bgImg;
let catImgs = {};
let dogImgs = {};

// -------------------------------------------------------------------- GAME MODE ---------------------------------------------------
//Single player or competitiom
let gameMode = null;

//Competition Player2
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

//Second name input
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

  //Load storage and start the music
  storage.loadUsers();
  bgMusic.loop();

  //Input UI
  myInput = createInput('Enter your name');
  myInput.position(windowWidth / 2 - 90, windowHeight / 2);

  //Button UI
  submitButton = createButton('Submit');
  submitButton.position(windowWidth / 2 - 30, windowHeight / 2 + 50);
  submitButton.mousePressed(saveInput);

  //Dark Mode UI
  darkModeToggle = createCheckbox(' Dark Mode', false);
  darkModeToggle.position(windowWidth / 2 - 90, windowHeight / 2 + 85);
  darkModeToggle.changed(() => {
    darkMode = darkModeToggle.checked();
  });
}

//Resizing window if users changes its size
function windowResized() {
  if (gameMode === "competition") {
    resizeCanvas(windowWidth, windowHeight);
  } else {
    resizeCanvas(windowWidth, windowHeight);
  }
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
  places2.push(new Place());

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
    // Removed player.display() — Place handles the falling animal
    displayUI();

    if (currentUser !== null) {
      let best = storage.getBestScore(currentUser);
      textAlign(CENTER);
      textSize(22);
      fill(darkMode ? 200 : 30);
      text(`Best: ${best} | Player: ${currentUser}`, width / 2, 30);
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
function displayPlaces() {
  for (let i = 0; i < places.length; i++) {
    //Draw the falling animal
    places[i].display();
    
    if (!places[i].active) {
      places[i].spawn();
    } else if (places[i].guessed) {
      places[i].transform();
    }
  }
}
function displayPlaces2() {
  for (let i = 0; i < places2.length; i++) {

    //Draw the falling animal
    places2[i].display();
    
    if (!places2[i].active) {
      places2[i].spawn();
    } else if (places2[i].guessed) {
      places2[i].transform();
    }
  }
}

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
//Draws the screen for the first player
function drawLeftHalf() {
  push();
  imageMode(CORNER);
  image(bgImg, 0, 0, width/2, height);

  stroke(darkMode ? 160 : 80);
  strokeWeight(2);
  line(width/2, 0, width/2, height);
  noStroke();

  textAlign(CENTER);
  textSize(20);
  fill(darkMode ? 180 : 60);
  text(`P1: ${currentUser}  |  A = Left  D = Right`, width/4, height - 20);

  textSize(28);
  fill(darkMode ? 220 : 30);
  textAlign(LEFT);
  text(`Points: ${points}`, 10, 35);

  let best = storage.getBestScore(currentUser);
  textAlign(CENTER);
  textSize(22);
  fill(darkMode ? 180 : 50);
  text(`Best: ${best}`, width/4, 30);

  bar.displayAt(width/4, height * 0.06, width * 0.18);
  bar.update();
  if (bar.f >= bar.l) isDead = true;

  displayPlaces();
  //Removes player.display()
  pop();
}

//Draws screen for Second Player
function drawRightHalf() {
  push();
  translate(width/2, 0);
  imageMode(CORNER);
  image(bgImg, 0, 0, width/2, height);

  textAlign(CENTER);
  textSize(20);
  fill(darkMode ? 180 : 60);
  text(`P2: ${currentUser2}  |  ← = Left  → = Right`, width/4, height - 20);

  textSize(28);
  fill(darkMode ? 220 : 30);
  textAlign(LEFT);
  text(`Points: ${points2}`, 10, 35);

  let best2 = storage.getBestScore(currentUser2);
  textAlign(CENTER);
  textSize(22);
  fill(darkMode ? 180 : 50);
  text(`Best: ${best2}`, width/4, 30);

  bar2.displayAt(width/4, height * 0.06, width * 0.18);
  bar2.update();
  if (bar2.f >= bar2.l) isDead2 = true;

  displayPlaces2();
  // Removes player2.display()
  pop();
}

// --------------------------------------------------------------- DEATH SCREENS -----------------------------------------------------------
//Game over for single-player
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
    button.position(width / 2 - 50, height / 2 + 45);
    button.mousePressed(restart);
  }
}

//Game over for multiplayer
function drawCompetitionOver() {
  background(darkMode ? 30 : 220);
  textAlign(CENTER);
  fill(darkMode ? 220 : 30);
  textSize(36);
  text("GAME OVER", width / 2, height / 2 - 90);
  
  if (button === null) {
    button = createButton('Play Again');
    button.position(width / 2 - 50, height / 2 + 60);
    button.mousePressed(restart);
  }
}

// ---------------------------------------------------------------------- CLASSES -------------------------------------------------------
//This class determines the direction of animals, how they look, switch, etc.
class Place {
  constructor() {
    this.l = 120;
    this.x = width / 2;
    this.y = 50;
    this.v = 17;
    this.active = false;
    this.guessed = false;
    this.dir = random() < 0.5 ? "left" : "right";
    this.type = random() < 0.5 ? "dog" : "cat";
    this.isWalking = false;
  }

  display() {
    let img = this.isWalking ? (this.type === "dog" ? dogImgs.walk : catImgs.walk) : (this.type === "dog" ? dogImgs.idle : catImgs.idle);
    imageMode(CENTER);
    image(img, this.x, this.y, this.l, this.l);
  }

  spawn() {
    //If the animal reaches the mat position mark it active
    if (this.y < height * 0.7) {
      this.y += this.v;
    } else {
      this.active = true;
    }
  }

  //Simply: animation of animals going to the side
  transform() {
    this.isWalking = true;
    // Dogs go left, cats go right
    let correctDir = (this.type === "dog") ? "left" : "right";
    if (correctDir === "left") {
      if (this.x > width * 0.15) this.x -= this.v / 2;
    }
    else {
      if (this.x < width * 0.85) this.x += this.v / 2;
    }
  }

  //Move for the first player
  move(dir) {
    //if cat type is chosen right is correct.
    let correctDir = (this.type === "dog") ? "left" : "right";
    
    if (dir !== correctDir) {
      isDead = true;
    }
    else {
      bar.f = 0;
      this.guessed = true;
      places.unshift(new Place());
      places.splice(2, 1);
      points++;
    }
  }

  //Move for second player
  move2(dir) {
    let correctDir = (this.type === "dog") ? "left" : "right";
    if (dir !== correctDir) {
      isDead2 = true;
    }
    else {
      bar2.f = 0;
      this.guessed = true;
      places2.unshift(new Place());
      places2.splice(2, 1);
      points2++;
    }
  }
}

//Health bar
class Bar {
  constructor() {
    this.x = width / 2;
    this.y = height * 0.06;
    this.l = width * 0.18;
    this.f = 0;
  }

  display() { this.displayAt(this.x, this.y, this.l); }

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
    if (this.f < this.l) this.f += 4.5;
    else isDead = true;
  }
}

//Shows up the animal in the botttom after it stops falling
class Player {
  constructor() {
    this.x = 250;
    this.y = 400;
  }
  display() {
    let p = places[0];
    let img = (p.type === "dog") ? dogImgs.idle : catImgs.idle;
    imageMode(CENTER);
    image(img, this.x, this.y, 80, 80);
  }
}

//Shows up the animal in the botttom after it stops falling for second Player
class Player2 {
  constructor() {
    this.x = 250;
    this.y = 400;
  }
  display() {
    let p = places2[0];
    let img = (p.type === "dog") ? dogImgs.idle : catImgs.idle;
    imageMode(CENTER);
    image(img, this.x, this.y, 80, 80);
  }
}