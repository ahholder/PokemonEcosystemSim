//Independent Variables Variables
const listCount = 151; //Number of potential species in pool
let invulCount = 60; //default invul timer
let initialMons = 6; //Number of pokemon spawned (typically squared), optimal performance value = 6, all original pokemon value = 13
let squareMons = true; //Ensures initial mons are squared at startup
let matchTimeout = 5; //When match times-out from being unresolved, listed in minutes

//Miscellaneous Variables
var listed = {}; // {"name" : "string", "img" : url, "type" : {"type 1", "type 2"}, "description" : "string", "speed" : int}
let selected = -1; //monster.id of last clicked creature
var pending = {}; //available pool of pokemon species
let totalMons = -1; //number of active creatures
let tmTypes = 18; //pokemon types
let eventMsgs = 0; //count of displayed messages
let frameTally = 0; //number of elapsed frames
let gameOver = false; //game state of active or finished
let gamePaused = false; //game state of paused or unpaused

//Board Variables
let tileSize = 25;
let grassSize = tileSize * 3;
let columns = 30;
let rows = 30;
let board;
let board2;
let boardWidth = columns * tileSize;
let boardHeight = rows * tileSize;
let context;
let context2;
let overlay;

//Creature Variables
let mSize = 25;
let mHP = 4;
let mMoves = 5;
let mXP = 3;
let mDMG = 2;
let mRXP = 1;
let mRinterval = 600; //Timer for update message gain
let xpRinterval = 900; //Timer for xp gain
var monsters = {}; //{"species": int, "hp": int, "xp": int, "x": real, "y": real, "up": int, "right": int, "alive": bool, "invul": int}

//Initial startup
window.onload = async function () {
    //Setting Board + Overlay + Description Box
    overlay = document.getElementById("overlay");
    overlay.width = boardWidth;
    overlay.height = boardHeight;

    board = document.getElementById("board");
    board.width = boardWidth + 4;
    board.height = boardHeight + 6;
    context = board.getContext("2d");

    board2 = document.getElementById("board2");
    board2.width = boardWidth + 4;
    board2.height = boardHeight + 6;
    context2 = board2.getContext("2d");

    let desc = document.getElementById("desc-box");
    desc.innerText = defaultDesc();

    //Alert Loading with Message
    eventMsgs += 1;
    let item = document.createElement("div");
    item.id = "m" + eventMsgs.toString();
    item.innerText = "Now Loading " + listCount + " Pokemon...";
    item.classList.add("item-loadin");
    document.getElementById("item-list").prepend(item);

    //Create Tall Grass
    for (let i = 0; i < boardWidth / grassSize; i++) {
        for (let i2 = 0; i2 < boardHeight / grassSize; i2++) {
            let grass = document.createElement("img");
            grass.id = "g" + (i + i2).toString();
            grass.src = "./Tall_Grass.png";
            grass.style = "width: " + grassSize + "px; height: " + grassSize + "px; left: " + ((i * grassSize) + 3) + "px; top: " + ((i2 * grassSize) + 3) + "px; z-index: 1; position: absolute; opacity: 0.4;";
            overlay.append(grass);
        }
    }

    //API info gathered
    for (let i = 1; i <= listCount; i++) {
        await getItem(i);
        pending[i - 1] = i;
    }

    //Make Initial Spawns
    let starts = 13;
    if (squareMons == true) {
        initialMons *= initialMons; //square initialMons for equal rows & columns
        starts = Math.sqrt(initialMons); //Use 13 if using all 151
    }
    let intervals = boardWidth / starts;
    let maximum = listCount - 1;
    let pendingCreations = initialMons;

    //Announce Match Beginning
    eventMsgs += 1;
    let itemz = document.createElement("div");
    itemz.id = "m" + eventMsgs.toString();
    itemz.innerText = "Spawning " + initialMons + " Pokemon!\nMatch begins!";
    itemz.classList.add("item-opening");
    document.getElementById("item-list").prepend(itemz);

    for (let i = 0; i < starts - 1; i++) {
        let monX = (intervals * i) * 1.1; //x-coord
        for (let i2 = 0; i2 < starts; i2++) {
            let monY = intervals * i2; //y-coord
            let rId = 1;
            let tempId = 1;
            if (pendingCreations > -1 && (i * starts) + i2 <= listCount) {
                if (pendingCreations > -1) {
                    rId = Math.floor(Math.random() * (maximum));
                    rId += 1;
                    tempId = pending[rId];
                    pending[rId] = pending[maximum];
                    maximum -= 1;
                    pendingCreations -= 1;
                } else {
                    rId = pending[0];
                    maximum -= 1;
                    pendingCreations -= 1;
                }
                if (rId < 1) {
                    rId = 1;
                    maximum -= 1;
                    pendingCreations -= 1;
                }
                createMon(monX, monY, tempId);
            }
        }
    }

    //Establish Global Event Listeners + Standard Updates
    document.addEventListener("keydown", pauser);
    board.addEventListener("click", getInfo);
    requestAnimationFrame(update);

}

//Creates a new pokemon at a specific board position
function createMon(mx, my, mid) {
    //Create Mon Details
    totalMons += 1;
    let up = Math.floor(Math.random() * mMoves) + 1;
    let right = Math.floor(Math.random() * mMoves) + 1;
    let dir = Math.floor(Math.random() * 2);
    if (dir != 0) {
        up *= -1;
    }
    dir = Math.floor(Math.random() * 2);
    if (dir != 0) {
        right *= -1;
    }
    let monster = { "species": mid, "hp": mHP, "xp": 0, "x": mx, "y": my, "up": up, "right": right, "alive": true, "invul": (invulCount * 2) };
    monsters[totalMons] = monster;
    mx += 15;
    my += 15;

    //Create Mon Appearance
    let newMon = overlay.appendChild(document.createElement("div"));
    newMon.id = totalMons;
    newMon.src = listed[mid]["img"];
    newMon.classList.add("test-img");
    newMon.style = "width: " + mSize + "px; height: " + mSize + "px; left: " + mx + "px; top: " + my + "px; z-index: 4; position: absolute;";
    newMon.addEventListener("click", getInfo);
    let newShow = new Image();
    newShow.src = newMon.src;
    let testX = newMon.style.left;
    let testY = newMon.style.top;
    testX.replace("px", "");
    testY.replace("px", "");
    if (newShow.complete) {
        context.drawImage(newShow, parseInt(testX), parseInt(testY), mSize, mSize);
    } else {
        newShow.onload = function () {
            context.drawImage(newShow, parseInt(testX), parseInt(testY), mSize, mSize);
        }
    }
}

//Added to check on EventListener Options -- New Code
function getInfo() {
    let box = document.getElementById("desc-box");
    if (this.id == "board" || this.id == "item-list" || this.id == "overlay" || this.id > totalMons || this.id < 0 || this.id == null || monsters[this.id].alive == false) {
        box.style["font-size"] = "18px";
        box.innerText = defaultDesc();
        selected = -1;
        return;
    }


    box.style["font-size"] = "36px";
    let mon = monsters[this.id];
    let subject = listed[monsters[parseInt(this.id)]["species"]];
    let monName = subject["name"].toUpperCase();
    box.innerText = monName + ":";
    let monTyping = "";
    for (let i = 0; i < subject["types"].length; i++) {
        if (i > 0) {
            monTyping += " / ";
        }
        let continuationText = subject["types"][i]["type"]["name"].toUpperCase();
        monTyping += continuationText;
    }
    box.innerText += "\n\n" + monTyping;
    box.innerText += "\nHP: " + mon.hp + " / " + mHP;
    box.innerText += "\nXP: " + mon.xp + " / " + mXP;

    selected = this.id;
}

//Original API list gatherer and populator -- PokeDex Code, Updated
async function getItem(num) {
    //Gather data from API
    let url = "https://pokeapi.co/api/v2/pokemon/" + num.toString();
    let res = await fetch(url);
    let product = await res.json();

    let name = product["name"].charAt(0).toUpperCase() + product["name"].slice(1);
    let types = product["types"];
    let image = product["sprites"]["front_default"];
    let speed = product["stats"][5]["base_stat"];

    res = await fetch(product["species"]["url"]);
    let longDesc = await res.json();

    longDesc = longDesc["flavor_text_entries"][9]["flavor_text"];
    longDesc = longDesc.replace('', ' ');
    longDesc = longDesc.replace(/(\r\n|\n|\r)/gm, " ");

    listed[num] = { "name": name, "img": image, "types": types, "desc": longDesc, "spd": speed }
}

//Allows the game to be paused -- D&Dodge code, Updated
function pauser(e) {
    if (gameOver) {
        return;
    }
    if (e.code == "Space" || e.code == "KeyZ") {
        if (gamePaused == true) {
            gamePaused = false;

            eventMsgs += 1;
            let itemz = document.createElement("div");
            itemz.id = "m" + eventMsgs.toString();
            itemz.innerText = "Game Unpaused!";
            itemz.classList.add("item-pause");
            document.getElementById("item-list").prepend(itemz);
        } else if (gamePaused == false) {
            gamePaused = true;

            eventMsgs += 1;
            let itemz = document.createElement("div");
            itemz.id = "m" + eventMsgs.toString();
            itemz.innerText = "Game Paused!";
            itemz.classList.add("item-pause");
            document.getElementById("item-list").prepend(itemz);
        }
    }
}

//Provide Default Info
function defaultDesc() {
    let def = "Click on a Pokemon for details";
    def += "\nPause the simulation with the SPACEBAR";
    def += "\n-------------------------------------------------------";
    def += "\nSimulation ends when one species remains";
    def += "\nor no pokemon can deal more than 1 damage";
    def += "\n-------------------------------------------------------";
    def += "\nPokemon ignore their own species.";
    def += "\nXP is gained dealing damage and over time.";
    def += "\nPokemon spawn every " + mXP + " XP.";
    def += "\n-------------------------------------------------------";
    def += "\nPokemon have " + mHP + " HP.";
    def += "\nPokemon take " + mDMG + " base damage from hits.";
    def += "\nPokemon types modify base damage.";
    def += "\nPokemon do damage of their best type.";
    def += "\n-------------------------------------------------------";
    def += "\nPokemon are invulnerable for 1 second";
    def += "\nafter spawning or battling";
    def += "\n-------------------------------------------------------";
    def += "\nPokemon change direction after battling";
    def += "\nor hitting the edge of the board";
    return def;
}

//Primary updates for game activity -- D&Dodge code, Updated
async function update() {
    if (gameOver == true) {
        return;
    }
    requestAnimationFrame(update);

    if (gamePaused == false) {
        //Global Upkeep -- Frame Count Inc., Timer Count Displayed, Board Cleared
        frameTally += 1;
        timeKeeper();
        context.clearRect(0, 0, board.width, board.height);

        //Announce Periodic XP Gain
        if (frameTally % xpRinterval == 0 && frameTally > 1) {
            eventMsgs += 1;
            let xpMsgz = document.createElement("div");
            xpMsgz.id = "m" + eventMsgs.toString();
            xpMsgz.innerText = "All pokemon gain + " + mRXP + " XP!";
            xpMsgz.classList.add("item-xp");
            document.getElementById("item-list").prepend(xpMsgz);
        }

        //Announce Periodic Update
        if (frameTally % mRinterval == 0 && frameTally > 1) {
            periodicInfoMsg();
        }

        //Redraw Canvas - Enemy
        for (let i = 0; i < totalMons + 1; i++) {
            let mainEnemy = monsters[i];
            let swapDir = false;

            if (mainEnemy.alive == true) {


                //Active
                if (mainEnemy.x > boardWidth - mSize || mainEnemy.x < 0 || mainEnemy.y > boardHeight - mSize || mainEnemy.y < 0) {
                    if (mainEnemy.x > boardWidth - mSize) {
                        mainEnemy.x = boardWidth - mSize;
                        mainEnemy.right *= -1;
                    }
                    if (mainEnemy.x < 0) {
                        mainEnemy.x = 0;
                        mainEnemy.right *= -1;
                    }
                    if (mainEnemy.y > boardHeight - mSize) {
                        mainEnemy.y = boardHeight - mSize;
                        mainEnemy.up *= -1;
                    }
                    if (mainEnemy.y < 0) {
                        mainEnemy.y = 0;
                        mainEnemy.up *= -1;
                    }
                }

                //Invul Timer Reduction
                mainEnemy.invul -= 1;
                if (mainEnemy.invul <= 0) {
                    mainEnemy.invul = 0;
                }

                //Global XP Gain
                if (frameTally % xpRinterval == 0 && frameTally > 1) {
                    mainEnemy.xp += mRXP;
                }

                //Check Collisions
                for (var i2 = 0; i2 < totalMons + 1; i2++) {
                    let rival = monsters[i2];
                    if (rival != mainEnemy && rival.alive == true && mainEnemy.alive == true && mainEnemy.invul == 0 && rival.invul == 0) {
                        if (checkCollision(mainEnemy, rival)) {
                            if (rival["species"] != mainEnemy["species"]) {
                                swapDir = true;
                                mainEnemy.invul = invulCount;
                                rival.invul = invulCount;
                                let dmg1 = await fight(mainEnemy, rival);
                                let dmg2 = await fight(rival, mainEnemy);

                                if (dmg1 >= 1) {
                                    rival.hp -= dmg1;
                                    mainEnemy.xp += dmg1;
                                }
                                if (dmg2 >= 1) {
                                    mainEnemy.hp -= dmg2;
                                    rival.xp += dmg2;
                                }

                                let fightReadout = listed[mainEnemy.species]["name"] + " dealt " + dmg1.toString() + " damage to " + listed[rival.species]["name"] + "!";
                                fightReadout += "\n" + listed[rival.species]["name"] + " dealt " + dmg2.toString() + " damage to " + listed[mainEnemy.species]["name"] + "!";
                                eventMsgs += 1;
                                let item = document.createElement("div");
                                item.id = "m" + eventMsgs.toString();
                                item.innerText = fightReadout;
                                item.classList.add("item-dmg");
                                document.getElementById("item-list").prepend(item);

                                rival.right *= -1;
                                rival.up *= -1;

                            }
                        }
                    }
                }

                //Swap Direction
                if (swapDir == true) {
                    mainEnemy.right *= -1;
                    mainEnemy.up *= -1;
                }

                //Movement
                mainEnemy.x += mainEnemy["right"] * 0.3;
                mainEnemy.y += mainEnemy["up"] * 0.3;

            }

        }

        let checkEnding = true;
        let checkedWinner = -1;

        //Process Monsters
        for (let i = 0; i < totalMons + 1; i++) {
            //Determine if alive
            if (monsters[i]["hp"] < 1 || monsters[i].alive == false) {
                //Process Death
                if (monsters[i].alive == true) {
                    monsters[i].alive = false;
                    if (selected == i) {
                        selected = -1;

                        let desc = document.getElementById("desc-box");
                        desc.innerText = defaultDesc();
                        desc.style["font-size"] = "18px";
                    }

                    eventMsgs += 1;
                    let itemz = document.createElement("div");
                    itemz.id = "m" + eventMsgs.toString();
                    itemz.innerText = listed[monsters[i].species]["name"] + " dies!";
                    itemz.classList.add("item-ko");
                    document.getElementById("item-list").prepend(itemz);

                    let oldDiv = document.getElementById(i);
                    let maxDiv = document.getElementById(totalMons);

                    monsters[i] = monsters[totalMons];

                    maxDiv.id = oldDiv.id;
                    oldDiv.remove();

                    totalMons -= 1;
                    i -= 1;
                }

            } else {
                //Process Life

                //Determine if game is won
                if (checkedWinner == -1) {
                    checkedWinner = monsters[i]["species"];
                } else {
                    if (monsters[i]["species"] != checkedWinner) {
                        checkEnding = false;
                    }

                }

                //Adjust divs
                let picto = document.getElementById(i);
                picto.style.left = monsters[i].x.toString() + "px";
                picto.style.top = monsters[i].y.toString() + "px";

                let newShow = new Image();
                newShow.src = picto.src;
                let testX = picto.style.left;
                let testY = picto.style.top;
                testX.replace("px", "");
                testY.replace("px", "");
                if (newShow.complete) {
                    context.drawImage(newShow, parseInt(testX), parseInt(testY), mSize, mSize);
                } else {
                    newShow.onload = function () {
                        context.drawImage(newShow, parseInt(testX), parseInt(testY), mSize, mSize);
                    }
                }

                //Spawn Check
                if (monsters[i].xp >= mXP) {
                    monsters[i].xp -= mXP;
                    createMon(monsters[i].x, monsters[i].y, monsters[i].species);

                    eventMsgs += 1;
                    let itemz = document.createElement("div");
                    itemz.id = "m" + eventMsgs.toString();
                    itemz.innerText = "A new " + listed[monsters[i].species]["name"] + " hatches!";
                    itemz.classList.add("item-spawn");
                    document.getElementById("item-list").prepend(itemz);
                }
            }
        }

        if (checkEnding == true && frameTally > 100) {
            endGame(checkedWinner);
        }
    }
}

//Determines if an enemy reaches the player -- D&Dodge code, Updated
function checkCollision(a, b) {
    let hits = false;
    if (a.x < b.x + mSize && a.x + mSize > b.x && a.y < b.y + mSize && a.y + mSize > b.y) {
        hits = true;
    }
    return hits;
}

//Causes both creatures to fight -- New Code
async function fight(a, b) {
    //a is attacker, b is defender
    let pwr = [];
    pwr[0] = 0.0;
    pwr[1] = 0.0;
    let typingA = listed[a.species]["types"];
    let typingB = listed[b.species]["types"];
    let elmsA = [];
    let elmsB = [];

    //Convert Numerics
    for (var i = 0; i < typingA.length; i++) {
        elmsA[i] = typeNum(listed[a.species]["types"][i]["type"]["name"]);
    }
    for (var i = 0; i < typingB.length; i++) {
        elmsB[i] = typeNum(listed[b.species]["types"][i]["type"]["name"]);
    }

    //Calculate Damage
    for (var i = 0; i < elmsA.length; i++) {
        pwr[i] = mDMG;
        for (var i2 = 0; i2 < elmsB.length; i2++) {
            pwr[i] *= effectiveness(elmsA[i], elmsB[i2]);
        }
    }

    //Apply Damage
    let finalDmg = 0;
    if (pwr[0] >= pwr[1]) {
        if (pwr[0] >= 1) {
            finalDmg = pwr[0];
        }
    } else {
        if (pwr[1] >= 1) {
            finalDmg = pwr[1];
        }
    }

    //XP Gain and Return

    if (finalDmg > mHP) {
        finalDmg = parseInt(mHP);
    }

    return finalDmg;
}


//Returns values on type effectiveness chart -- New Code
function effectiveness(a, b) {
    var t = [];
    t[0] = [1, 1, 1, 1, 1, 0.5, 1, 0, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1]; //normal
    t[1] = [2, 1, 0.5, 0.5, 1, 2, 0.5, 0, 2, 1, 1, 1, 1, 0.5, 2, 1, 2, 0.5]; //fighting
    t[2] = [1, 2, 1, 1, 1, 0.5, 2, 1, 0.5, 1, 1, 2, 0.5, 1, 1, 1, 1, 1]; //flying
    t[3] = [1, 1, 1, 0.5, 0.5, 0.5, 1, 0.5, 0, 1, 1, 2, 1, 1, 1, 1, 1, 2]; //poison
    t[4] = [1, 1, 0, 2, 1, 2, 0.5, 1, 2, 2, 1, 0.5, 2, 1, 1, 1, 1, 1]; //ground
    t[5] = [1, 0.5, 2, 1, 0.5, 1, 2, 1, 0.5, 2, 1, 1, 1, 1, 2, 1, 1, 1]; //rock
    t[6] = [1, 0.5, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 0.5, 1, 2, 1, 2, 1, 1, 2, 0.5]; //bug
    t[7] = [0, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 0.5, 1]; //ghost
    t[8] = [1, 1, 1, 1, 1, 2, 1, 1, 0.5, 0.5, 0.5, 1, 0.5, 1, 2, 1, 1, 2]; //steel
    t[9] = [1, 1, 1, 1, 1, 0.5, 2, 1, 2, 0.5, 0.5, 2, 1, 1, 2, 0.5, 1, 1]; //fire
    t[10] = [1, 1, 1, 1, 2, 2, 1, 1, 1, 2, 0.5, 0.5, 1, 1, 1, 0.5, 1, 1]; //water
    t[11] = [1, 1, 0.5, 0.5, 2, 2, 0.5, 1, 0.5, 0.5, 2, 0.5, 1, 1, 1, 0.5, 1, 1]; //grass
    t[12] = [1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 2, 0.5, 0.5, 1, 1, 0.5, 1, 1]; //electric
    t[13] = [1, 2, 1, 2, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 0.5, 1, 1, 0, 1]; //psychic
    t[14] = [1, 1, 2, 1, 2, 1, 1, 1, 0.5, 0.5, 0.5, 2, 1, 1, 0.5, 2, 1, 1]; //ice
    t[15] = [1, 1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 1, 1, 2, 1, 0]; //dragon
    t[16] = [1, 0.5, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 0.5, 0.5]; //dark
    t[17] = [1, 2, 1, 0.5, 1, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 1, 1, 2, 2, 1]; //fairy
    let pwr = t[a][b];
    return pwr;
}

//Returns numeric value for different types -- New Code
function typeNum(type) {
    if (type == "normal") return 0;
    if (type == "fighting") return 1;
    if (type == "flying") return 2;
    if (type == "poison") return 3;
    if (type == "ground") return 4;
    if (type == "rock") return 5;
    if (type == "bug") return 6;
    if (type == "ghost") return 7;
    if (type == "steel") return 8;
    if (type == "fire") return 9;
    if (type == "water") return 10;
    if (type == "grass") return 11;
    if (type == "electric") return 12;
    if (type == "psychic") return 13;
    if (type == "ice") return 14;
    if (type == "dragon") return 15;
    if (type == "dark") return 16;
    if (type == "fairy") return 17;
    return 18;
}

//Returns name value for numeric types -- New Code
function typeName(type) {
    if (type == 0) return "normal";
    if (type == 1) return "fighting";
    if (type == 2) return "flying";
    if (type == 3) return "poison";
    if (type == 4) return "ground";
    if (type == 5) return "rock";
    if (type == 6) return "bug";
    if (type == 7) return "ghost";
    if (type == 8) return "steel";
    if (type == 9) return "fire";
    if (type == 10) return "water";
    if (type == 11) return "grass";
    if (type == 12) return "electric";
    if (type == 13) return "psychic";
    if (type == 14) return "ice";
    if (type == 15) return "dragon";
    if (type == 16) return "dark";
    if (type == 17) return "fairy";
    return "unknown";
}

//Processes the end of the match
function endGame(winner) {
    gameOver = true;
    let closing = "AND THERE GOES THE BATTLE!";
    if (winner != -1) {
        let winnerName = listed[winner]["name"].toUpperCase();
        closing += "\n\n" + winnerName + "\nWINS!";
    }

    eventMsgs += 1;
    let itemz = document.createElement("div");
    itemz.id = "m" + eventMsgs.toString();
    itemz.innerText = closing;
    itemz.classList.add("item-gg");
    document.getElementById("item-list").prepend(itemz);
    timeKeeper();
}

//Visually shows time elapsed
function timeKeeper() {
    let timer = document.getElementById("time-keeper");
    let timez = (frameTally / 60).toFixed(2);
    timer.innerText = "Time Elapsed: " + timez + "s";
    if (gameOver == true) {
        timer.style["color"] = "red";
    }
}

//Gives periodic message update
async function periodicInfoMsg() {
    let timez = frameTally / 60;
    let lead = speciesLead();
    let fullMsg = "-" + timez + " seconds-\n\nTotal Pokemon: " + (totalMons + 1) + "\nTotal Species: " + speciesTally();
    fullMsg += "\nLead: " + listed[lead["num"]]["name"] + " (" + lead["counted"] + " alive)";
    eventMsgs += 1;
    let itemz = document.createElement("div");
    itemz.id = "m" + eventMsgs.toString();
    itemz.innerText = fullMsg;
    itemz.classList.add("item-counted");
    document.getElementById("item-list").prepend(itemz);
    let decider = await unwinnable();
    if (decider == true) {
        endGame(-1);
    }
}

//Returns number of unique species remaining
function speciesTally() {
    let present = [];
    let uniques = 0;
    for (let i = 1; i < listCount + 1; i++) {
        present[i] = false;
        for (let i2 = 0; i2 < totalMons + 1; i2++) {
            if (monsters[i2].species == i) {
                present[i] = true;
            }
        }
        if (present[i] == true) {
            uniques += 1;
        }
    }
    return uniques;
}

//Returns the most numerous species
function speciesLead() {
    let present = [];
    let species = 0;
    let tally = 0;
    for (let i = 1; i < listCount + 1; i++) {
        present[i] = 0;
        for (let i2 = 0; i2 < totalMons + 1; i2++) {
            if (monsters[i2].species == i) {
                present[i] += 1;
            }
        }
        if (present[i] >= tally) {
            species = i;
            tally = present[i];
        }
    }
    let lead = { "num": species, "counted": tally }
    return lead;
}

//Determines if a match cannot be won
async function unwinnable() {
    let outcome = false;
    let lowestHp = mHP;
    let highestDmg = 0;

    //Determine Base Properties
    for (let i = 0; i < totalMons + 1; i++) {
        let mon = monsters[i];

        //Determine lowest hp
        if (mon.hp < lowestHp) {
            lowestHp = mon.hp;
        }
        //Determine highest damage
        for (let i2 = 0; i2 < totalMons + 1; i2++) {
            let mon2 = monsters[i2];
            if (mon.species != mon2.species) {
                let sampleDmg = await fight(mon, mon2);
                if (sampleDmg > highestDmg) {
                    highestDmg = sampleDmg;
                }
            }
        }
    }

    //Determine if Winnable
    if (highestDmg < 2 || frameTally >= ((60 * 60) * matchTimeout)) {
        outcome = true;
    }

    //Process if Winnable
    if (outcome == true) {
        let fullMsg = "Indefinite Match Detected!";
        eventMsgs += 1;
        let itemz = document.createElement("div");
        itemz.id = "m" + eventMsgs.toString();
        itemz.innerText = fullMsg;
        itemz.classList.add("item-impossible");
        document.getElementById("item-list").prepend(itemz);
    }
    return outcome;
}

//Test Functions that load specific rosters
function testRoster(num) {
    let roster = [];
    if (num == 0) {
        roster[0] = [25, 26, 81, 82, 100, 101, 125, 135, 145];
    }
    return roster[num];
}