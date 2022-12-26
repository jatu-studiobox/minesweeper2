const loadGameArea = (gameType) => {
    // Gathering element html
    const gridPlay = document.getElementById("gridPlay");
    const bombAmountMonitor = document.getElementById("bombAmountMonitor");
    const minutesTimer = document.getElementById("minutesTimer");
    const secondsTimer = document.getElementById("secondsTimer");
    const modalResult = document.getElementById("modalResult");
    const textResult = document.getElementById("textResult");
    const btnViewResult = document.getElementById("btnViewResult");
    const btnNewGame = document.getElementById("btnNewGame");
    const menu = document.querySelector(".menu");

    let width = 0;
    let height = 0;
    let bombAmount = 0;
    let level = "";

    // check game type for setting game dimemsion and bomb amount
    switch (parseInt(gameType)) {
        case 2: 
            width = 16;
            height = 16;
            bombAmount = 40;
            level = "medium";
            break;
        case 3:
            width = 30;
            height = 16;
            bombAmount = 99;
            level = "hard";
            break;
        default:
            width = 9;
            height = 9;
            bombAmount = 10;
            level = "easy";
            break;
    }

    // set checked values
    const checkedLeft = 0;
    const checkedAboveRight = width - 1;
    const checkedAbove = width;
    const checkedAboveLeft = width + 1;
    const checkedRight = (width * height) - 2;
    const checkedBottomLeft = (width * height) - width;
    const checkedBottomRight = (width * height) - width - 2;
    const checkedBottom = (width * height) - width - 1;

    // add css class size to grid play area
    gridPlay.classList.add(level);

    let flags = 0;
    let squares = [];
    let isGameOver = false;
    let kickOff = true;

    let totalSeconds = 0;
    let timeId;

    // create Board
    function createBoard() {
        // get shuffled game array with random bombs
        // Array(..) create array by specific size
        const bombsArray = Array(bombAmount).fill('bomb');
        const emptyArray = Array((width * height) - bombAmount).fill('valid');
        // join arrays
        const gameArray = emptyArray.concat(bombsArray);
        // shuffled array by use built-in array sort function with Math random function
        const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

        for (let i = 0; i < width * height; i++) {
            const square = document.createElement("div");
            square.setAttribute("id", i);
            square.classList.add(shuffledArray[i]);
            gridPlay.appendChild(square);
            squares.push(square);

            // normal click
            square.addEventListener('click', (e) => {
                startTrigger();
                click(square);
            });

            // control and left click
            // add function at build-in 'oncontextmenu'
            square.oncontextmenu = function (e) {
                e.preventDefault();
                startTrigger();
                checkFlag(square);
            }

            // double click
            square.addEventListener('dblclick', (e) => {
                e.preventDefault();
                startTrigger();
                doubleClick(square);
                clearSelection();
            });
        }

        // Add number (count around bombs) in each square
        for (let i = 0; i < squares.length; i++) {
            // total count bombs around each square
            let total = 0;
            // check left edge square,
            const isLeftEdge = (i % width === 0);
            // check right edge square,
            const isRightEdge = (i % width === width - 1);

            if (squares[i].classList.contains('valid')) {
                // check bomb left
                if (i > checkedLeft && !isLeftEdge && squares[i - 1].classList.contains("bomb")) total++;
                // check bomb above-right
                if (i > checkedAboveRight && !isRightEdge && squares[i + 1 - width].classList.contains("bomb")) total++;
                // check bomb above
                if (i >= checkedAbove && squares[i - width].classList.contains("bomb")) total++;
                // check bomb above-left
                if (i >= checkedAboveLeft && !isLeftEdge && squares[i - 1 - width].classList.contains("bomb")) total++;
                // check bomb right
                if (i <= checkedRight && !isRightEdge && squares[i + 1].classList.contains("bomb")) total++;
                // check bomb bottom-left
                if (i < checkedBottomLeft && !isLeftEdge && squares[i - 1 + width].classList.contains("bomb")) total++;
                // check bomb bottom-right
                if (i <= checkedBottomRight && !isRightEdge && squares[i + 1 + width].classList.contains("bomb")) total++;
                // check bomb bottom
                if (i <= checkedBottom && squares[i + width].classList.contains("bomb")) total++;

                squares[i].setAttribute('data', total);
                // console.log(squares[i]);
            }
        }

        // Set display flag count
        setBombMonitor();
    }

    createBoard();

    function startTrigger() {
        // check if click off
        if (kickOff) {
            // start Timer
            timeId = setInterval(startTimer, 1000);
            kickOff = false;
        }
    }

    function startTimer() {
        ++totalSeconds;
        secondsTimer.innerHTML = String(totalSeconds % 60).padStart(2, '0');
        minutesTimer.innerHTML = String(parseInt(totalSeconds / 60)).padStart(2, '0');
    }

    function stopTimer() {
        clearInterval(timeId);
    }

    // for clear text selection
    function clearSelection() {
        if (document.selection && document.selection.empty) {
            document.selection.empty();
        } else if (window.getSelection) {
            var sel = window.getSelection();
            sel.removeAllRanges();
        }
    }

    // for set display remain marked flags
    function setBombMonitor() {
        // set default display bomb amount monitor
        bombAmountMonitor.innerHTML = String(bombAmount - flags).padStart(3, '0');
    }

    // function for add Flag
    function addFlag(square) {
        square.classList.add('flag');
        square.innerHTML = '🚩';
        flags++;
        setBombMonitor();
    }

    // function for remove Flag
    function removeFlag(square) {
        square.classList.remove('flag');
        square.innerHTML = '';
        flags--;
        setBombMonitor();
    }

    // Add flag with right click
    function checkFlag(square) {
        // Case 'Game Over', do nothing
        if (isGameOver) return;
        if (!square.classList.contains('checked') && (flags < bombAmount)) {
            if (!square.classList.contains('flag')) {
                addFlag(square);
                checkForWin();
            } else {
                removeFlag(square);
            }
        } else if (flags === bombAmount) {  // case marked flags equal to bomb amount, but not all matches
            if (square.classList.contains('flag')) {
                removeFlag(square);
            }
        }
    }

    // click on square actions
    function click(square) {
        let currentId = square.id;
        // check game over do nothing
        if (isGameOver) return;
        // check if square is checked or flagged, do nothing
        if (square.classList.contains('checked') || square.classList.contains('flag')) return;
        // if (square.classList.contains('checked')) return;

        // if square has flag, then remove
        // if (square.classList.contains('flag')) {
        //     removeFlag(square);
        // }

        // if square has bome, then game over
        if (square.classList.contains("bomb")) {
            gameOver(square);
        } else {
            let total = square.getAttribute('data');
            if (total != 0) {
                square.classList.add('checked');
                square.classList.add('block-number');
                square.classList.add('color' + total);
                square.innerHTML = total;
                return; // for break loop;
            }

            checkSquare(square, currentId);

        }
        square.classList.add('checked');
    }

    function doubleClick(square) {
        // check game over do nothing
        if (isGameOver) return;

        const data = parseInt(square.getAttribute('data'));
        // if square has checked
        if (square.classList.contains('checked') && data > 0) {
            let totalMarkedFlag = 0;
            const currentId = parseInt(square.getAttribute('id'));

            // check left edge square,
            const isLeftEdge = (currentId % width === 0);
            // check right edge square,
            const isRightEdge = (currentId % width === width - 1);

            // check marked flag left
            if (currentId > checkedLeft && !isLeftEdge && squares[currentId - 1].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag above-right
            if (currentId > checkedAboveRight && !isRightEdge && squares[currentId + 1 - width].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag above
            if (currentId >= checkedAbove && squares[currentId - width].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag above-left
            if (currentId >= checkedAboveLeft && !isLeftEdge && squares[currentId - 1 - width].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag right
            if (currentId <= checkedRight && !isRightEdge && squares[currentId + 1].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag bottom-left
            if (currentId < checkedBottomLeft && !isLeftEdge && squares[currentId - 1 + width].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag bottom-right
            if (currentId <= checkedBottomRight && !isRightEdge && squares[currentId + 1 + width].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag bottom
            if (currentId <= checkedBottom && squares[currentId + width].classList.contains("flag")) totalMarkedFlag++;

            console.log("totalMarkedFlag: ", totalMarkedFlag);
            // if square data equal to summary around marked flags
            if (totalMarkedFlag === data) {
                setTimeout(() => {
                    if (currentId > checkedLeft && !isLeftEdge) {
                        // get new square from left
                        const newId = squares[parseInt(currentId) - 1].id;
                        const newSquare = document.getElementById(newId);
                        click(newSquare);
                    }
                    if (currentId > checkedAboveRight && !isRightEdge) {
                        // get new square from above-right
                        const newId = squares[parseInt(currentId) + 1 - width].id;
                        const newSquare = document.getElementById(newId);
                        click(newSquare);
                    }
                    if (currentId >= checkedAbove) {
                        // get new square from above
                        const newId = squares[parseInt(currentId) - width].id;
                        const newSquare = document.getElementById(newId);
                        click(newSquare);
                    }
                    if (currentId >= checkedAboveLeft && !isLeftEdge) {
                        // get new square from above-left
                        const newId = squares[parseInt(currentId) - 1 - width].id;
                        const newSquare = document.getElementById(newId);
                        click(newSquare);
                    }
                    if (currentId <= checkedRight && !isRightEdge) {
                        // get new square from right
                        const newId = squares[parseInt(currentId) + 1].id;
                        const newSquare = document.getElementById(newId);
                        click(newSquare);
                    }
                    if (currentId < checkedBottomLeft && !isLeftEdge) {
                        // get new square from bottom-left
                        const newId = squares[parseInt(currentId) - 1 + width].id;
                        const newSquare = document.getElementById(newId);
                        click(newSquare);
                    }
                    if (currentId <= checkedBottomRight && !isRightEdge) {
                        // get new square from bottom-right
                        const newId = squares[parseInt(currentId) + 1 + width].id;
                        const newSquare = document.getElementById(newId);
                        click(newSquare);
                    }
                    if (currentId <= checkedBottom) {
                        // get new square from bottom
                        const newId = squares[parseInt(currentId) + width].id;
                        const newSquare = document.getElementById(newId);
                        click(newSquare);
                    }
                }, 10);
            }
        }
    }

    // check neighbouring squares once square is clicked
    function checkSquare(square, currentId) {
        // check left edge square,
        const isLeftEdge = (currentId % width === 0);
        // check right edge square,
        const isRightEdge = (currentId % width === width - 1);

        setTimeout(() => {
            if (currentId > checkedLeft && !isLeftEdge) {
                // get new square from left
                const newId = squares[parseInt(currentId) - 1].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId > checkedAboveRight && !isRightEdge) {
                // get new square from above-right
                const newId = squares[parseInt(currentId) + 1 - width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId > checkedAbove) {
                // get new square from above
                const newId = squares[parseInt(currentId) - width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId > checkedAboveLeft && !isLeftEdge) {
                // get new square from above-left
                const newId = squares[parseInt(currentId) - 1 - width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId <= checkedRight && !isRightEdge) {
                // get new square from right
                const newId = squares[parseInt(currentId) + 1].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId < checkedBottomLeft && !isLeftEdge) {
                // get new square from bottom-left
                const newId = squares[parseInt(currentId) - 1 + width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId <= checkedBottomRight && !isRightEdge) {
                // get new square from bottom-right
                const newId = squares[parseInt(currentId) + 1 + width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId <= checkedBottom) {
                // get new square from bottom
                const newId = squares[parseInt(currentId) + width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
        }, 10);
    }

    // game over
    function gameOver(square) {
        console.log('BOOM! Game Over!');
        stopTimer();
        isGameOver = true;
        setDisplayResult(false);
        setDisplayModalResult(true);

        // show ALL the bombs
        squares.forEach(square => {
            // if (square.classList.contains('bomb')) {
            if (square.classList.contains('bomb') && !square.classList.contains('flag')) {
                square.classList.add('checked');
                square.classList.add('block-bomb');
                // square.innerHTML = '💣';
            } else if (!square.classList.contains('bomb') && square.classList.contains('flag')) {
                square.classList.add('false-flag');
            }
        });

        // mark current square bomb
        square.classList.add('boom');
    }

    // check for win
    function checkForWin() {
        let matches = 0;
        for (let i = 0; i < squares.length; i++) {
            if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
                matches++;
            }
            if (matches == bombAmount) {
                console.log("You WIN!");
                stopTimer();
                setDisplayResult(true);
                setDisplayModalResult(true);
                gameOver = true;
            }
        }
    }

    function setDisplayResult(isWin) {
        textResult.className = "";
        if (isWin) {
            textResult.innerHTML = "Congratulations!";
            textResult.classList.add("result-message-win");
        } else {
            textResult.innerHTML = "Better Luck Next Time!";
            textResult.classList.add("result-message-lost");
        }
    }

    function setDisplayModalResult(bValue) {
        modalResult.style.display = bValue ? "block" : "none";
    }

    // Disabled right click on playing area
    gridPlay.addEventListener('contextmenu', e => e.preventDefault());

    btnViewResult.addEventListener('click', e => {
        setDisplayModalResult(false);
    });

    btnNewGame.addEventListener('click', e => {
        setDisplayModalResult(false);
        setDisplaySettingsModal(true);
    });

    menu.addEventListener('click', e => {
        setDisplaySettingsModal(true);
    });
};

const setHeaderTitle = (gameType) => {
    const headerTitle = document.querySelector(".header-title");
    // check game type for setting game dimemsion and bomb amount
    switch (parseInt(gameType)) {
        case 2: 
            headerTitle.innerHTML = "Medium 16 x 16";
            break;
        case 3:
            headerTitle.innerHTML = "Hard 30 x 16";
            break;
        default:
            headerTitle.innerHTML = "Easy 9 x 9";
            break;
    }
};

const setDisplaySettingsModal = (bValue) => {
    const modalSettings = document.getElementById("modalSettings");
    modalSettings.style.display = bValue ? "block" : "none";
};

const clearGameArea = () => {
    console.log("Clear game area");
    const gridPlay = document.getElementById("gridPlay");
    gridPlay.classList.remove("easy");
    gridPlay.classList.remove("medium");
    gridPlay.classList.remove("hard");
    gridPlay.innerHTML = "";
};

const bindGameTypeButton = () => {
    var btnList = document.querySelectorAll('.game-type-button');
    btnList.forEach(btn => {
        btn.addEventListener('click', (e) => {
            setDisplaySettingsModal(false);
            setHeaderTitle(btn.dataset.gameType);
            clearGameArea();
            loadGameArea(btn.dataset.gameType);
        });
    });
};

// DOMContentLoaded - all html files have loaded before reading javascript
document.addEventListener("DOMContentLoaded", () => {
    setDisplaySettingsModal(true);

    // bind Game Type selected button click
    bindGameTypeButton();
});