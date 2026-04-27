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


let player;

//Array holding Place objects (the falling squares the player must react to) 
let places = []; 
let bar;
let isDead = false;
let points = 0;
let submitButton;
let button = null;
let userList = [];
let myInput;
let currentUser = null;
let gameStart = false;


//--------------------------------------------------------------------LOCAL STORAGE---------------------------------------------------
let storage = {
//Saving userList array to local storage
  saveUsers(){
    localStorage.setItem(`userList`, JSON.stringify(userList));
  },

  //Loads saved user list from local storage into the array
  loadUsers(){
    let stored = localStorage.getItem('userList');
    if(stored){
      userList = JSON.parse(stored);
    }
  },
  //Return stored best score for specific username
  getBestScore(name){
    let key = `bestScore_` + name;
    let stored = localStorage.getItem(key);
    return stored ? parseInt(stored) : 0;
  },

  //Updates the best for user
  updateBestScore(name, score){
    let key = `bestScore_` + name;
    let current = storage.getBestScore(name);
    if(score > current){
      localStorage.setItem(key,score);
    }
  
  }
};

//--------------------------------------------------------------------MUSIC SECTION-----------------------------------------------------------------------------------
let bgMusic;
function preload() {
  bgMusic = loadSound('https://cdn.freecodecamp.org/curriculum/js-music-player/scratching-the-surface.mp3');
}
//--------------------------------------------------------------------GAME LOGIC-------------------------------------------------------------------------------------

function setup(){
  createCanvas(500, 500);
  player = new Player();
  bar = new Bar();
  places.push(new Place());

  storage.loadUsers();
  bgMusic.loop();
 
  myInput = createInput('Enter your name');
  myInput.position(width/2 -90, height/2);
  submitButton = createButton('Submit');
  submitButton.position(myInput.x + 60, height / 2 + 50);
  submitButton.mousePressed(saveInput);
}

function draw(){
  running();
}

// Keyboard input, listens for A (left) or D (right) key presses
function keyPressed(){
  if(!isDead && places[0].active){
    // A key = left, D key = right
    if(key === 'a' || key === 'A'){
      places[0].move("left");
    }
    else if(key === 'd' || key === 'D'){
      places[0].move("right");
    }
  }
}
//--------------------------------------------------------------------------MY OWN FUNCTIONS----------------------------------------------------------------------------
function running(){
  //Prevents game from starting before we enter username
  if(!gameStart){
    return;
  }
  background(220);
  if(!isDead && userList.length > 0){

    displayPlaces();
    //Player displaying
    player.display();

    displayUI();

    //Show user's best score
    if(currentUser !== null){
      let best = storage.getBestScore(currentUser);
      textAlign(CENTER);
      textSize(16);
      fill(30);
      text(`Best: ${best} | Player: ${currentUser}`, width / 2 , 60);
      gameOver();
    }
  } 
}

function displayPlaces(){
  //Places
  for(let i = 0; i < places.length; i++){
    //Draws the squares
    places[i].display();

    //Animation of falling down
    if(!places[i].active){
      places[i].spawn();
    }
    else if(places[i].guessed){
      // Slide it sideways after a correct guess
      places[i].transform(places[i].dir);
    }
  }
}

function displayUI(){
  //Timer Bar
  bar.display();
  bar.update();

  //Controls hint
  textSize(14);
  fill(80);
  textAlign(CENTER);
  text("A = Left   |   D = Right", width / 2, height - 15);

  //Points
  textSize(18);
  fill(30);
  textAlign(LEFT);
  text(`Points : ${points}`, 20, 30);
}

function gameOver(){
  if(isDead){

    //Save best score
    if(currentUser !== null){
      storage.updateBestScore(currentUser, points);
    }
    
    //Stops the draw loop
    noLoop();

    textAlign(CENTER);
    fill(30);
    textSize(40);
    text("Oops, you're dead!", width/2, height/2 - 40);

    textSize(30);
    text(`Points : ${points}`, width/2, height/2);


    if(currentUser !== null){
      let best = storage.getBestScore(currentUser);
      textSize(25);
      fill(30);
      text(`Best Score: ${best}`, width / 2, height / 2 + 30);
    }

    // Creates only one button, so it doesn't duplicate
    if(button === null){
      button = createButton('Play Again');
      button.position(width/2 - 50, height/2 + 45);
      //Once pressed, restarts the game
      button.mousePressed(restart);
    }
  }
}

//Restart the game
function restart(){
  points = 0;
  places = [];
  places.push(new Place());
  bar.f = 0;
  isDead = false;

  //Removes the button
  if(button){
    button.remove();
    button = null;
  }

  //Restarts draw loop
  loop();
}

function saveInput(){
  let userInput = myInput.value();

  
  //We shouldn't allow empty names, exit the function:
  if(userInput === '') {
    return;
  }
    
  currentUser = userInput;

  if(!userList.includes(userInput)){
    userList.push(userInput);
    storage.saveUsers();
  }

  myInput.remove();
  submitButton.remove();
  myInput.value('');

  gameStart = true;
}

//----------------------------------------------------------------------CLASSES-----------------------------------------------------------------------------------------------
//Creates the falling square with indicator of direction. 
//Player must match direction before time runs out
class Place{

  constructor(){
    //Side length
    this.l = 50;

    //Starting position x
    this.x = width / 2;

    //Starting position y
    this.y = this.l;

    //Speed of square falling
    this.v = 20;

    //Checking if square finished falling
    this.active = false;

    //Checking the answer given by player
    this.guessed = false;

    //Randomly select the direction for the square
    this.dir = random() < 0.5 ? "left" : "right";

    //random color
    this.r = random(255);
    this.g = random(255);
    this.b = random(180);
  }

  //Draws square and its direction
  display(){
    rectMode(CENTER);
    noStroke();
    fill(0, 0 , 255);
    rect(this.x, this.y, this.l, this.l);

    fill(this.r, this.g, this.b);

    //Places indicator on the left or right side
    if(this.dir === "left"){
      rect(this.x - 20, this.y, 10, this.l); 
    }
    else{
      rect(this.x + 20, this.y, 10, this.l);
    }
  };

  //Animates the square falling down
  spawn(){
    if(this.y < height/2){
      this.y += this.v;
    }
    else {
      this.active = true;
    }
  };

  //Sliding the square after correct guess
  transform(dir){
    if(dir === "left"){
      if(this.x > 75){
        this.x -= this.v/2;
      }
    }
    else {
      if(this.x < width - 75){
        this.x += this.v/2;
      }
    }
  };

  //Is called only when the player presses a direction button
  //Either call the function to add points, reset timer and spawn a new Place, or game over
  move(dir){
    if(dir !== this.dir){
      isDead = true;
    }
    else {
      bar.f = 0;
      this.guessed = true;
      places.unshift(new Place());
      places.splice(2, 1);
      points++;
    }
  };
}
//Creates the player. Doesn't do anything, just visual design
class Player{
  constructor(){
    this.d = 25;
    this.x = width / 2;
    this.y = height / 2;
  }


  display(){
    noStroke();
    fill(51, 255, 255);
    ellipse(this.x, this.y, this.d);
  };
}

//A timer that fills up at the top. Once filled, game is over.
class Bar{
  constructor(){
    this.x = width/2;
    this.y = 30;
    this.l = 200;

    //Current fill amount, which increses each frame
    this.f = 0;
  }

  //Draws the bar outline and filling level
  display(){
    strokeWeight(4);
    stroke(30);
    fill(220);
    rectMode(CENTER);
    rect(this.x, this.y, this.l, this.l/20);

    noStroke();
    fill(204, 0, 0);
    rectMode(CORNER);
    rect(this.x - this.l/2, this.y - this.l/40, this.f, this.l/20);
  };

  //Increses the fill each frame and gives a game over
  update(){
    if(this.f < this.l){
      this.f += 3.2;
    }
    else {
      isDead = true;
    }
  };
}