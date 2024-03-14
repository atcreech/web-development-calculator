let calcText = document.querySelector('#calc-text');
let historyText = document.querySelector('#history-text');
let operationButtons = document.querySelectorAll('.calc-button-operation');
let operation = 'none';
let opLock = false;
let num1 = null;
let num2 = null;
let error = false;
let operationDefaultColor = 'rgb(140, 140, 140)';
let operationActiveColor = 'orange';
let historyColor = false;
let readyHistory = true;
let finished = true;
let num1dec = false;
let num2dec = false;

// Function to add two numbers
function evaluatePlus(exp1, exp2) {
    // Have to convert from string to number
    let first = + exp1;
    let second = + exp2;
    let result = first + second;
    return result;
}

// Subtracts exp2 from exp1
function evaluateMinus(exp1, exp2) {
    let result = exp1 - exp2;
    return result;
}

// Multiplies exp1 and exp2
function evaluateTimes(exp1, exp2) {
    let result = exp1 * exp2;
    return result;
}

// Divides exp1 by exp2
function evaluateDivide(exp1, exp2) {
    let result = exp1 / exp2;
    return result;
}

// Calculates x^y recursively
function power(x, y) {
    if (y < 0) {
        return 0;
    }
    if (y === 0) {
        return 1;
    }
    if (y === 1) {
        return x;
    }
    return x * power(x, y - 1);
}

// Calculates x! recursively
function factorial(x) {
    if (x < 0) {
        return 0;
    }
    if (x === 0) {
        return;
    }
    if (x === 1) {
        return 1;
    }
    return x * factorial(x - 1);
}

// Evaluates an operation and determines the result based on a given
// operation, exp1, and exp2
function evaluateOperation(operation, exp1, exp2) {
    let result = null;
    if (operation === '+') {  // Add
        result = evaluatePlus(exp1, exp2);
    } else if (operation === '-') {  // Subtract
        result = evaluateMinus(exp1, exp2);
    } else if (operation === 'X') {  // Multiply
        result = evaluateTimes(exp1, exp2);
    } else if (operation === '/') {  // Divide
        result = evaluateDivide(exp1, exp2);
    } else if (operation === '^') {  // Exponent
        let newExp1 = + exp1;
        let newExp2 = + exp2;
        result = power(newExp1, newExp2);
        // Only works with integer values at the moment
        num1dec = false;
        num2dec = false;
    } else if (operation === '!') {  // Factorial
        let newExp1 = + exp1;
        result = factorial(newExp1);
    } else if (operation === '1/x') {  // Divides 1 by exp1
        result = evaluateDivide('1', exp1);
    } else {  // Invalid operation
        calcText.setAttribute('value', 'Error');
        error = true;
        return;
    }
    
    // Error if result is invalid
    if (result !== result || result === Infinity || result === undefined || result === null) {
        calcText.setAttribute('value', 'Error');
        error = true;
        return;
    } else {
        return result;
    }
}

// Determines if a decimal point can be added
function determineDot() {
    if (error === true) {  // Don't run if there is an error
        return;
    }

    // If the first number can have a decimal point added
    if (num2 === null && num1dec === false && num1 !== null && operation === 'none' && finished !== true) {
        num1dec = true;
        num1 += '.';
        calcText.setAttribute('value', calcText.getAttribute('value') + '.');
    } else if (num2 !== null && num2dec === false && finished !== true) {  // If the second number can have a decimal point added
        num2dec = true;
        num2 += '.';
        calcText.setAttribute('value', calcText.getAttribute('value') + '.');
    }
}

// Run whenever the enter key or the = button is pressed
function determineEquals() {
    if (error === true) {  // Don't run if error
        return;
    }

    // Reset button colors
    operationButtons.forEach((button) => {
        button.style['background-color'] = operationDefaultColor;
    });
    readyHistory = true;  // History can be clicked
    finished = true;  // Result can be overwritten

    // If there is nothing to calculate
    if (calcText.getAttribute('value') === null || calcText.getAttribute('value') === '') {
        return;
    } else if (operation !== 'none' && opLock === false) {  // If invalid operation
        calcText.setAttribute('value', 'Error');
        error = true;
    } else if (operation !== 'none' && opLock === true) {  // If valid operation
        let intermediate = evaluateOperation(operation, num1, num2);
        if (error === true) {  // Detect errors
            return;
        }
        let result = '' + intermediate;
        num1 = result;
        num1dec = (num1dec === true || num2dec == true ? true : false);  // Needed to determine if result is a float
        num2 = null;
        num2dec = false;
        calcText.setAttribute('value', result);  // Display result
        operation = 'none';
        opLock = false;
        if (operation === '!' || operation === '1/x') {  // Only works with integers
            num1dec = false;
        }
        let newHistory = document.createElement('p');  // Create history element
        if (historyColor === true) {  // Alternate background colors
            historyColor = false;
            newHistory.style['background-color'] = 'lightgray';
        } else {
            historyColor = true;
        }
        if (num1dec === true || num2dec === true) {  // Keeps track of float/int status
            newHistory.setAttribute('class', 'dec');
        }
        newHistory.innerText = calcText.getAttribute('value');
        newHistory.addEventListener('click', (f) => {  // Add event for when clicked
            if (calcText.getAttribute('value') === null) {
                calcText.setAttribute('value', '');
            }
            if (readyHistory === true && (num1 === null || finished === true)) {  // If the number can be added to current calculation num1
                num1 = newHistory.innerText;
                if (newHistory.getAttribute('class') === 'dec') {
                    num1dec = true;
                } else {
                    num1dec = false;
                }
                calcText.setAttribute('value', num1);
                finished = false;
            } else if (readyHistory === true && num2 === null) {  // If the number can be added to current calculation num2
                num2 = newHistory.innerText;
                if (newHistory.getAttribute('class') === 'dec') {
                    num2dec = true;
                } else {
                    num2dec = false;
                }
                opLock = true;
                calcText.setAttribute('value', calcText.getAttribute('value') + num2);
            }
            readyHistory = false;
        });
        historyText.appendChild(newHistory);
        historyText.scrollTop = historyText.scrollHeight;  // Keep history scrolled to bottom
    }
}

// Adds a number to the current calculation
function determineNumber(number) {
    if (error === true) {  // Doesn't run if there is an error
        return;
    }
    readyHistory = false;  // Cannot use history values
    if (calcText.getAttribute('value') === null) {
        calcText.setAttribute('value', '');
    }
    if (finished !== true) {  // Determines if value is replaced or added to
        calcText.setAttribute('value', calcText.getAttribute('value') + number);
    } else {
        calcText.setAttribute('value', number);
        num1 = null;
        num1dec = false;
        finished = false;
    }
    if (operation === 'none') {  // Determines whether first or second number is added to
        num1 = (num1 === null ? number : num1 + number);
    } else {
        num2 = (num2 === null ? number : num2 + number);
        opLock = true;
    }
}

// Clears the calculator and resets all values
function clearCalculator() {
    calcText.setAttribute('value', '');
    operation = 'none';
    error = false;
    opLock = false;
    num1 = null;
    num2 = null;
    num1dec = false;
    num2dec = false;
    readyHistory = true;
    operationButtons.forEach((button) => {
        button.style['background-color'] = operationDefaultColor;
    });
}

// Calculates the operations for /, x, -, and +
function determineOperation(inputOp) {
    if (error === true) {  // Doesn't run if there is an error
        return;
    }
    let selectedButton = null;
    operationButtons.forEach((e) => {  // Find selected button
        if (inputOp === e.innerText) {
            selectedButton = e;
        }
    });
    finished = false;
    if (calcText.getAttribute('value').length === 0 && operation === 'none') {  // If there is no number
        return;
    } else if (operation === 'none' || opLock === false) {  // If there is one number
        readyHistory = true;
        operationButtons.forEach((button) => {  // Reset button color
            button.style['background-color'] = operationDefaultColor;
        });
        selectedButton.style['background-color'] = operationActiveColor;  // Highlight selected button
        let operationText = calcText.getAttribute('value');
        if (operation === 'none') {
            operationText += ' ' + inputOp + ' ';
        } else {
            operationText = operationText.slice(0, operationText.length - 2) + inputOp + ' ';
        }
        operation = inputOp;
        calcText.setAttribute('value', operationText);
    } else if (num2 !== null) {  // Additional operation, i.e. 1 + 1 +
        readyHistory = true;
        operationButtons.forEach((button) => {  // Reset button color
            button.style['background-color'] = operationDefaultColor;
        });
        if (selectedButton !== null) {  // Highlight selected button
            selectedButton.style['background-color'] = operationActiveColor;
        }
        let intermediate = evaluateOperation(operation, num1, num2);
        if (error === true) {  // Check for an error
            return;
        }
        let result = '' + intermediate;
        calcText.setAttribute('value', result);  // Display result
        let newHistory = document.createElement('p');
        if (historyColor === true) {  // Alternate history entry background color
            historyColor = false;
            newHistory.style['background-color'] = 'lightgray';
        } else {
            historyColor = true;
        }
        if (num1dec === true || num2dec === true) {  // Determine history entry float/int status
            newHistory.setAttribute('class', 'dec');
        }
        newHistory.innerText = result;
        newHistory.addEventListener('click', (f) => {  // Add click event for adding history entry to calculation
            if (calcText.getAttribute('value') === null) {
                calcText.setAttribute('value', '');
            }
            if (readyHistory === true && (num1 === null || finished === true)) {  // If history event can be added to num1
                num1 = newHistory.innerText;
                if (newHistory.getAttribute('class') === 'dec') {
                    num1dec = true;
                } else {
                    num1dec = false;
                }
                calcText.setAttribute('value', num1);
                finished = false;
            } else if (readyHistory === true && num2 === null) {  // If history event can be added to num2
                num2 = newHistory.innerText;
                if (newHistory.getAttribute('class') === 'dec') {
                    num2dec = true;
                } else {
                    num2dec = false;
                }
                opLock = true;
                calcText.setAttribute('value', calcText.getAttribute('value') + num2);
            }
            readyHistory = false;
        });
        historyText.appendChild(newHistory);
        historyText.scrollTop = historyText.scrollHeight;  // Keep history at bottom
        num1 = result;
        num1dec = (num1dec === true || num2dec == true ? true : false);  // Determine float/int status of result
        num2 = null;
        num2dec = false;
        operation = inputOp;
        // Show operation on calculator
        calcText.setAttribute('value', calcText.getAttribute('value') + ' ' + operation + ' ');
        opLock = false;
    }
}

// Flips the sign of a number between + and -
function flipSign() {
    if (error === true) {  // Doesn't run if there is an error
        return;
    }
    if (num1 !== null && num2 === null) {  // If num1 but not num2
        let currText = calcText.getAttribute('value');
        if (num1[0] === '-') {  // If num1 is negative
            num1 = num1.slice(1, num1.length);
            calcText.setAttribute('value', currText.slice(1, currText.length));
        } else {  // If num1 is positive
            num1 = '-' + num1;
            calcText.setAttribute('value', '-' + currText);
        }
    } else if (num2 !== null) {  // If num2 needs to be updated
        let currText = calcText.getAttribute('value');
        if (num2[0] === '-') {  // If num2 is negative
            num2 = num2.slice(1, num2.length);
            calcText.setAttribute('value', currText.slice(0, currText.length - num2.length - 1) + num2);
        } else {  // If num2 is positive
            num2 = '-' + num2;
            calcText.setAttribute('value', currText.slice(0, currText.length - num2.length + 1) + num2);
        }
    }
}

// Keyboard support, runs operations when keys are pressed in a manner similar
// to how the buttons on the calculator are pressed
calcText.addEventListener('keydown', (e) => {
    e.preventDefault();
    switch(e.key) {
        case '`':
            flipSign();
            break;
        case '7':
            determineNumber('7');
            break;
        case '8':
            determineNumber('8');
            break;
        case '9':
            determineNumber('9');
            break;
        case '/':
            determineOperation('/');
            break;
        case '4':
            determineNumber('4');
            break;
        case '5':
            determineNumber('5');
            break;
        case '6':
            determineNumber('6');
            break;
        case '*':
            determineOperation('X');
            break;
        case '1':
            determineNumber('1');
            break;
        case '2':
            determineNumber('2');
            break;
        case '3':
            determineNumber('3');
            break;
        case '-':
            determineOperation('-');
            break;
        case 'C':
            clearCalculator();
            break;
        case 'c':
            clearCalculator();
            break;
        case '0':
            determineNumber('0');
            break;
        case '.':
            determineDot();
            break;
        case '+':
            determineOperation('+');
            break;
        case '=':
            determineEquals();
            break;
        case 'Enter':
            determineEquals();
            break;
        default:
    }
});

// +/- button on the calculator
document.querySelector('#flip-sign-button').addEventListener('click', (e) => {
    if (error === true) {  // Doesn't run if there is an error
        return;
    }
    flipSign();
});

// x^y button on the calculator
document.querySelector('#power').addEventListener('click', (e) => {
    if (error === true) {  // Doesn't run if there is an error
        return;
    }
    if (finished === true && num1dec === false) {  // If an integer result was just calculated
        finished = false;
        operation = '^';
        opLock = true;
        calcText.setAttribute('value', calcText.getAttribute('value') + ' ^ ');
        num2dec = true;
    } else if (num1 !== null && operation === 'none' && num1dec === false) {  // If only num1 has been entered and is an integer, no operation is selected
        operation = '^';
        opLock = true;
        calcText.setAttribute('value', calcText.getAttribute('value') + ' ^ ');
        num2dec = true;
    }
});

// x! button on the calculator
document.querySelector('#factorial').addEventListener('click', (e) => {
    if (error === true) {  // Doesn't run if there is an error
        return;
    }
    if (num1 !== null && operation === 'none' && num2 === null) {  // If there is only one number entered
        finished = false;
        operation = '!';
        opLock = true;
        determineEquals();
    }
});

// 1/x button on the calculator
document.querySelector('#one-over').addEventListener('click', (e) => {
    if (error === true) {  // Doesn't run if there is an error
        return;
    }
    if (num1 !== null && operation === 'none' && num2 === null) {  // If there is only one number entered
        finished = false;
        operation = '1/x';
        opLock = true;
        determineEquals();
    }
});

// . button on the calculator
document.querySelector('.calc-button-dot').addEventListener('click', (e) => {
    determineDot();
});

// = button on the calculator
let equalButton = document.querySelector('#equals-button');
equalButton.addEventListener('click', (e) => {
    determineEquals();
});


// Number buttons 0-9 on the calculator
document.querySelectorAll('.calc-button-number').forEach((e) => {
    e.addEventListener('click', (f) => {
        determineNumber(e.innerText);
    });
});

// C (clear) button on the calculator
document.querySelector('.calc-button-clear').addEventListener('click', (e) => {
    clearCalculator();
});

// Clear history button, deletes inner elements of the history box
document.querySelector('#clear-history').addEventListener('click', (e) => {
    historyText.innerText = '';
    historyColor = false;
});

// /, x, -, and + buttons on the calculator
operationButtons.forEach((e) => {
    e.addEventListener('click', (f) => {
        determineOperation(e.innerText);
    })
});
