let currMoleTile;
let currBadTile;
let score = 0;
let gameOver = false;
let moleTimer = 1000; //starting value, minimum 100
let badTimer = 2100; //starting value, minimum 125

window.onload = function () {
    setGame();
}

function setGame() {
    for (let i = 0; i < 9; i++) {
        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.addEventListener("click", selectTile);
        document.getElementById("board").appendChild(tile);
    }

    setMole();
    setBad();

    setInterval(setMole, moleTimer);
    setInterval(setBad, badTimer);
}

function getRandomTile() {
    let num = Math.floor(Math.random() * 9);
    return num.toString();
}

function setMole() {
    if (gameOver == true) {
        return;
    }
    if (currMoleTile) {
        currMoleTile.innerHTML = " ";
    }

    let mole = document.createElement("img");
    mole.src = "./Vega.png";

    let num = getRandomTile();
    if (currBadTile && currBadTile.id == num) {
        return;
    }

    currMoleTile = document.getElementById(num);
    currMoleTile.appendChild(mole);
}

function setBad() {
    if (gameOver == true) {
        return;
    }
    if (currBadTile) {
        currBadTile.innerHTML = " ";
    }

    let baddy = document.createElement("img");
    baddy.src = "./Rei.png";

    let num = getRandomTile();
    if (currMoleTile && currMoleTile.id == num) {
        return;
    }

    currBadTile = document.getElementById(num);
    currBadTile.appendChild(baddy);
}

function selectTile() {
    if (gameOver == true) {
        return;
    }
    if (this == currMoleTile) {
        score += 10;
        document.getElementById("score").innerText = "Score: " + score.toString();

        //Moves Vega + Rei on each successful click
        setMole();
        setBad();

        //Increases the jump interval for both Rei + Vega on each successful click
        if (moleTimer > 100) {
            moleTimer -= 25;
        }
        if (badTimer > 125) {
            badTimer -= 25;
        }
    } else if (this == currBadTile) {
        document.getElementById("score").innerText = "GAME OVER -- Final Score: " + score.toString();
        gameOver = true;
    }
}