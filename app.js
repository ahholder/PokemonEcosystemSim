console.log("Hello World!\n==========\n");

// Exercise 1 Section
console.log("EXERCISE 1:\n==========\n");
function printOdds(count) {
    let negative = false;
    if (count < 0) negative = true;
    if (count < 0) count = count * -1;
    for (let i = 0; i <= count; i++) {
        if (i % 2 != 0) {
            if (negative == false) console.log(i);
            if (negative == true) console.log(i * -1);
        }
    }
}
//printOdds(10); //Test
//printOdds(5); //Test
//printOdds(-20); //Test

// Exercise 2 Section
console.log("EXERCISE 2:\n==========\n");
function checkAge(name, age = 1) {
    function aboveSixteen(age) {
        if (age > 16) return true;
        return false;
    }
    function belowSixteen(age) {
        if (age < 16) return true;
        return false;
    }
    let isSixteen = false;
    if (aboveSixteen(age) == false && belowSixteen(age) == false) isSixteen = true;
    if (isSixteen == true) {
        console.log(`Congrats ${name}, you can drive!`);
    } else if (aboveSixteen(age) == true) {
        console.log(`Congrats ${name}, you can drive!`);
    } else {
        console.log(`Sorry ${name}, but you can't drive until you're 16!`);
    }
}

//checkAge("Alex", 27); //Test
//checkAge("Danny Phantom", 13); //Test

// Exercise 3 Section
console.log("EXERCISE 3:\n==========\n");
function whichQuadrant(x, y) {
    if (x == 0 && y == 0) {
        console.log(`(${x}, ${y}) is on the x axis and on the y axis.`);
    } else if (x == 0) {
        console.log(`(${x}, ${y}) is on the x axis.`);
    } else if (y == 0) {
        console.log(`(${x}, ${y}) is on the y axis.`);
    } else if (x > 0 && y > 0) {
        console.log(`(${x}, ${y}) is is Quadrant 1.`);
    } else if (x < 0 && y > 0) {
        console.log(`(${x}, ${y}) is is Quadrant 2.`);
    } else if (x < 0 && y < 0) {
        console.log(`(${x}, ${y}) is is Quadrant 3.`);
    } else if (x > 0 && y < 0) {
        console.log(`(${x}, ${y}) is is Quadrant 4.`);
    } else {
        console.log(`(${x}, ${y}) is an Invalid Input`);
    }
}

//whichQuadrant(0, 0); //Test
//whichQuadrant(-5, 0); //Test
//whichQuadrant(0, 15); //Test
//whichQuadrant(1, 3); //Test
//whichQuadrant(-1, 30); //Test
//whichQuadrant(15, -10); //Test
//whichQuadrant(-12, -8); //Test
//whichQuadrant("Test", "Input"); //Test

// Exercise 4 Section
console.log("EXERCISE 4:\n==========\n");
function triangle(side1, side2, side3) {
    function validTriangle(side1, side2, side3) {
        if (side1 + side2 > side3) return true;
        if (side1 + side3 > side2) return true;
        if (side2 + side3 > side1) return true;
        return false;
    }
    function isosceles(side1, side2, side3) {
        if ((side1 == side2 && side2 != side3) || (side1 == side3 && side3 != side2) || (side2 == side3 && side3 != side1)) return true;
        return false;
    }
    function equilateral(side1, side2, side3) {
        if (side1 == side2 && side2 == side3) return true;
        return false;
    }
    function scalene(side1, side2, side3) {
        if (side1 != side2 && side2 != side3 && side1 != side3) return true;
        return false;
    }
    if (validTriangle(side1, side2, side3) == false) {
        console.log(`${side1}, ${side2}, and ${side3} make an invalid triangle!`);
    } else {
        if (isosceles(side1, side2, side3) == true) console.log(`${side1}, ${side2}, and ${side3} make an isosceles triangle!`);
        if (equilateral(side1, side2, side3) == true) console.log(`${side1}, ${side2}, and ${side3} make an equilateral triangle!`);
        if (scalene(side1, side2, side3) == true) console.log(`${side1}, ${side2}, and ${side3} make a scalene triangle!`);
    }
}

//triangle(5, 5, 5); //Test
//triangle(10, 20, 5); //Test
//triangle(10, 10, 20); //Test
//triangle(0, 0, 0); //Test

// Bonus Exercise 5 Section
console.log("EXERCISE 5:\n==========\n");
function cellphone(planLimit, day, usage) {
    let daily = planLimit / 30;
    let current = usage / day;
    let projection = ((current * (30 - day)) + usage) - planLimit;
    let correction = (planLimit - usage) / (30 - day);
    console.log(`${day} day(s) used, ${30 - day} day(s) remaining`);
    console.log(`Average daily use: ${current} GB/day`);
    if (current > daily) console.log(`You are exceeing your daily use (${daily} GB/day)! Continuing this high usage, you'll exceed your data plan by ${projection} GB.`);
    console.log(`To stay below your data plan, use no more than ${correction} GB/day.`);
}

//cellphone(1000, 1, 0); //Test
//cellphone(1000, 10, 500); //Test
//cellphone(500, 20, 500); //Test
//cellphone(600, 15, 330); //Test
