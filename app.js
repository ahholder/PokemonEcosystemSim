//Universal Variables
let score = 0;
let gameOver = false;
let maxTiles = 100;
let tileSize = 75;
let columns = 10;
let rows = 10;
let baseSpeed = tileSize;
let spawnTimer = 1500;
let spawnCountdown = 1500;
let countdownInterval = 100;
let maxTypes = 1;
let minimumTimer = 400;
let maxEnemies = 25;
let overallTimer = 0;
let imageBuffer = 25;
let allowPhases = false; //If false, enemies get random speeds after 60 seconds || If true, new types of enemies spawn after 60 seconds
let gamePaused = false;

//Board Variables
let board;
let boardWidth = columns * tileSize;
let boardHeight = rows * tileSize;
let context;

//Player Character Variables
let playerWidth = tileSize - imageBuffer;
let playerHeight = tileSize - imageBuffer;
let playerX = tileSize * 4;
let playerY = tileSize * 5;

let player = {
    x : playerX,
    y : playerY,
    width : playerWidth,
    height: playerHeight,
    velocity : 0,
    speed : 1,
}

let playerImg;
let playerIcon;

//Enemy Variables
let enemyArray = [];

//Initial startup
window.onload = function () {
    //Setting Board
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    playerImg = new Image();
    playerImg.src = "./PlayerChar.png";
    playerImg.onload = function () {
        context.drawImage(playerImg, player.x, player.y, player.width, player.height);
    }

    setInterval(spawn, countdownInterval);
    requestAnimationFrame(update);
    document.addEventListener("keydown", walk);
    document.addEventListener("keydown", pauser);
    //document.addEventListener("keydown", testerLook); //Used for game testing only

}

//Primary updates for game activity
function update() {
    if (gameOver == true) {
        return;
    }
    requestAnimationFrame(update);

    if (gamePaused == false) {
        context.clearRect(0, 0, board.width, board.height);

        //Redraw Canvas - Enemy
        let testcount = 0;
        for (let i = 0; i < enemyArray.length; i++) {
            let mainEnemy = enemyArray[i];

            if (mainEnemy.alive == true) {

                //Movement
                if (mainEnemy.angle == 0) {
                    mainEnemy.y += mainEnemy.speed;
                } else if (mainEnemy.angle == 1) {
                    mainEnemy.x += mainEnemy.speed;
                } else if (mainEnemy.angle == 2) {
                    mainEnemy.y -= mainEnemy.speed;
                } else {
                    mainEnemy.x -= mainEnemy.speed;
                }

                //Active
                if (mainEnemy.x > boardWidth + tileSize || mainEnemy.x < -1 * tileSize || mainEnemy.y > boardHeight + tileSize || mainEnemy.y < -1 * tileSize) {
                    mainEnemy.alive = false;
                    score += 100;
                    document.getElementById("score").innerText = "Score: " + score.toString();
                    if (spawnTimer > minimumTimer) {
                        spawnTimer -= 50;
                    }
                }

                //GameOver Check
                if (checkCollision(mainEnemy, player) && mainEnemy.alive) {
                    gameOver = true;
                    document.getElementById("score").innerText = "GAME OVER -- Final Score: " + score.toString();
                }

                //Modify Count
                if (mainEnemy.alive == true) {
                    testcount += 1;
                }

            }

        }

        //Redraw Canvas - Player
        playerIcon = context.drawImage(playerImg, player.x, player.y, player.width + imageBuffer, player.height + imageBuffer);

        //Update Enemy Tally
        document.getElementById("tally").innerText = "Current Enemies: " + testcount.toString() + " || Time Played: " + overallTimer / 1000 + "s";

        //Cycle Dead Enemies -- 10/7/23
        for (let i = 0; i < enemyArray.length; i++) {
            if (enemyArray[i].alive == false) {
                enemyArray[i] = enemyArray[enemyArray.length - 1];
                enemyArray.pop();
            }

            //Redraw Canvas - Enemy
            context.drawImage(enemyArray[i].display, enemyArray[i].x, enemyArray[i].y, enemyArray[i].width + imageBuffer, enemyArray[i].height + imageBuffer);
        }
    }
}

//Prints console information about spawns and places visual trackers -- testing only, not enabled in final version
function testerLook(e) {
    let trackerImg = new Image();
    trackerImg.src = "./Glyph.png";
    if (e.code == "KeyX") {
        for (let i = 0; i < enemyArray.length; i++) {
            let tracked = enemyArray[i];
            let detailz = "#" + i.toString() + ". " + tracked.name + " - " + tracked.img;
            detailz += " @ " + tracked.x + "x, " + tracked.y + "y @ " + tracked.width + "w, " + tracked.height + "h";
            console.log(detailz);

            context.drawImage(trackerImg, tracked.x, tracked.y, tracked.width + imageBuffer, tracked.height + imageBuffer);
        }
    }
}

//Allows the game to be paused
function pauser(e) {
    if (gameOver) {
        return;
    }
    if (e.code == "Space" || e.code == "KeyZ") {
        if (gamePaused == true) {
            gamePaused = false;
            document.getElementById("score").innerText = "Score: " + score.toString();
        } else if (gamePaused == false) {
            document.getElementById("score").innerText = "GAME PAUSED";
            gamePaused = true;
        }
    }
}

//Determines if an enemy reaches the player
function checkCollision(a, b) {
    let dead = false;
    if (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y) {
        dead = true;
    }
    return dead;
}

//Player movement
function walk(e) {
    if (gameOver || gamePaused) {
        return;
    }
    //Position
    if ((e.code == "ArrowLeft" || e.code == "KeyA") && player.x - (baseSpeed * player.speed) >= 0) {
        player.x -= baseSpeed * player.speed;
    } else if ((e.code == "ArrowDown" || e.code == "KeyS") && player.y + (baseSpeed * player.speed) < boardHeight) {
        player.y += baseSpeed * player.speed;
    } else if ((e.code == "ArrowUp" || e.code == "KeyW") && player.y - (baseSpeed * player.speed) >= 0) {
        player.y -= baseSpeed * player.speed;
    } else if ((e.code == "ArrowRight" || e.code == "KeyD") && player.x + (baseSpeed * player.speed) < boardWidth) {
        player.x += baseSpeed * player.speed;
    }

    //Angle
    if (e.code == "ArrowLeft" || e.code == "KeyA") {
        playerImg.src = "./PlayerChar4.png";
    } else if (e.code == "ArrowDown" || e.code == "KeyS") {
        playerImg.src = "./PlayerChar.png";
    } else if (e.code == "ArrowUp" || e.code == "KeyW") {
        playerImg.src = "./PlayerChar3.png";
    } else if (e.code == "ArrowRight" || e.code == "KeyD") {
        playerImg.src = "./PlayerChar2.png";
    }
}

//Checks if a new enemy should be created
function spawn() {
    if (gameOver || gamePaused) {
        return;
    }

    spawnCountdown -= countdownInterval;
    overallTimer += countdownInterval;

    //check to improve
    if (overallTimer >= 60000 && maxTypes < 2 && allowPhases == true) {
        maxTypes += 1;
    }

    //check to spawn
    if ((spawnCountdown <= 0 || enemyArray.length <= 0) && maxEnemies > enemyArray.length) {
        makeEnemy();
        spawnCountdown = spawnTimer;
        console.log((overallTimer / 1000).toString() + "s = spawned!");
    }
}

//Determines the side from which an enemy spawns
function enemySide() {
    let num = Math.floor(Math.random() * 4);
    return num;
}

//Determines how far along a side an enemy spawns
function enemyStart() {
    let num = Math.floor(Math.random() * 10);
    return num;
}

//Determines the type of enemy spawned
function enemyType() {
    let num = Math.floor(Math.random() * maxTypes);
    if (allowPhases == false) num = 0;
    return num;
}

//Determines Enemy speed
function enemyDetails(newEnemy) {
    if (newEnemy.type <= 0) {
        newEnemy.speed = 0.5;
        newEnemy.width = 1 * (tileSize - imageBuffer);
        newEnemy.height = 1 * (tileSize - imageBuffer);
        if (newEnemy.angle == 0) {
            newEnemy.img = "./enemyA.png";
        } else if (newEnemy.angle == 1) {
            newEnemy.img = "./enemyA2.png";
        } else if (newEnemy.angle == 2) {
            newEnemy.img = "./enemyA3.png";
        } else if (newEnemy.angle == 3) {
            newEnemy.img = "./enemyA4.png";
        }
    } else if (newEnemy.type == 1) {
        newEnemy.speed = 0.8;
        newEnemy.width = 1 * (tileSize - imageBuffer);
        newEnemy.height = 1 * (tileSize - imageBuffer);
        if (newEnemy.angle == 0) {
            newEnemy.img = "./enemyB.png";
        } else if (newEnemy.angle == 1) {
            newEnemy.img = "./enemyB2.png";
        } else if (newEnemy.angle == 2) {
            newEnemy.img = "./enemyB3.png";
        } else if (newEnemy.angle == 3) {
            newEnemy.img = "./enemyB4.png";
        }
    }

    return newEnemy;
}

//Spawns a new enemy at the edge of the board
function makeEnemy() {
    let eSide = enemySide();
    let eStart = enemyStart();

    //Primary Setup
    let enemy = {
        alive: true,
        type : enemyType(),
        speed: 1,
        x: 0,
        y: 0,
        angle: eSide,
        width: 1,
        height: 1,
        img: "./enemyA.png",
        name: " ",
        display: new Image()
    }

    //Secondary Setup
    if (eSide == 0) {
        enemy.y = 0;
        enemy.x = (eStart * tileSize) - 1;
    } else if (eSide == 1) {
        enemy.x = 0;
        enemy.y = (columns - 1) * tileSize;
    } else if (eSide == 2) {
        enemy.y = (rows - 1) * tileSize;
        enemy.x = (eStart * tileSize) - 1;
    } else {
        enemy.x = (rows - 1) * tileSize;
        enemy.y = (eStart * tileSize) - 1;
    }

    enemy = enemyDetails(enemy);
    enemy.name = (overallTimer / 1000).toString() + "s";
    enemy.display.src = enemy.img;

    //Random Variance
    if (allowPhases == false && overallTimer >= 60000) {
        enemy.speed += ((Math.floor(Math.random() * 20)) * 0.1);
    }

    //Final Setup
    enemyArray.push(enemy);
}