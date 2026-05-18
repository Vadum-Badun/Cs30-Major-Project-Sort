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
//https://justinbakse.notion.site/Welcome-to-p5-party-887564cad8ec455e9bee994362322f2e 

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
  darkModeToggle.remove(); // Remove the toggle from DOM once game starts
  myInput.value('');

  gameStart = true;
}
// -------------------------------------------------------------------- PRELOAD SECTION ---------------------------------------------------
let bgMusic;
function preload() {
  bgMusic = loadSound('https://cdn.freecodecamp.org/curriculum/js-music-player/scratching-the-surface.mp3');

  partyConnect(
    "wss://demoserver.p5party.org",
    "hello_party"
  );
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

  // Dark mode
  darkModeToggle = createCheckbox(' Dark Mode', false);
  darkModeToggle.position(width / 2 - 90, height / 2 + 85);
  darkModeToggle.changed(() => {
    darkMode = darkModeToggle.checked();
  });
}

function draw() {
  if (!isDead) {
    running();
  } else if (isDead) {
    if (currentUser !== null) {
      storage.updateBestScore(currentUser, points);
    }
    noLoop();

    // Death screen respects dark mode
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
}

function keyPressed() {
  if (!isDead && places[0].active) {
    if (key === 'a' || key === 'A') {
      places[0].move("left");
    } else if (key === 'd' || key === 'D') {
      places[0].move("right");
    }
  }
}

// -------------------------------------------------------------------------- MY OWN FUNCTIONS -------------------------------------------
function running() {
  if (!gameStart) {
    return;
  }

  //Switch to dark mode
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

function restart() {
  points = 0;
  places = [];
  places.push(new Place());
  bar.f = 0;
  isDead = false;

  if (button) {
    button.remove();
    button = null;
  }
  loop();
}

// --------------------------------------------------------------- DISPLAYING -----------------------------------------------------------
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

function displayUI() {
  bar.display();
  bar.update();

  // Controls hint
  textSize(14);
  fill(darkMode ? 180 : 80);
  textAlign(CENTER);
  text("A = Left   |   D = Right", width / 2, height - 15);

  // Points
  textSize(18);
  fill(darkMode ? 220 : 30);
  textAlign(LEFT);
  text(`Points : ${points}`, 20, 30);
}
// ---------------------------------------------------------------------- CLASSES -------------------------------------------------------
class Place {
  constructor() {
    this.l = 50;
    this.x = width / 2;
    this.y = this.l;
    this.v = 20;
    this.active = false;
    this.guessed = false;
    this.dir = random() < 0.5 ? "left" : "right";
  }

  display() {
    rectMode(CENTER);
    noStroke();
    // Square body: white in dark mode, black in light mode
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
      if (this.x > 75) {
        this.x -= this.v / 2;
      }
    } else {
      if (this.x < width - 75) {
        this.x += this.v / 2;
      }
    }
  }

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
}

class Bar {
  constructor() {
    this.x = width / 2;
    this.y = 30;
    this.l = 200;
    this.f = 0;
  }

  display() {
    strokeWeight(4);
    stroke(darkMode ? 180 : 30);
    // Bar background: dark in dark mode, light in light mode
    fill(darkMode ? 60 : 220);
    rectMode(CENTER);
    rect(this.x, this.y, this.l, this.l / 20);

    noStroke();
    fill(204, 0, 0);
    rectMode(CORNER);
    rect(this.x - this.l / 2, this.y - this.l / 40, this.f, this.l / 20);
  }

  update() {
    if (this.f < this.l) {
      this.f += 3.2;
    } else {
      isDead = true;
    }
  }
}

class Player {
  constructor() {
    this.d = 25;
    this.x = width / 2;
    this.y = height / 2;
  }

  display() {
    noStroke();
    fill(51, 255, 255);
    ellipse(this.x, this.y, this.d);
  }
}