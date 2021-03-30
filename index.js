const fullDashArray = 283;
let timerInterval;
let isRunning = true;
let flag = false;
const {
    audio,
    settings,
    startStop,
    shadow,
    submit,
    timerInput,
    autoStart,
    changeTheme,
    timerButton,
    baseTimerLabel,
} = globalThis;

timerButton.addEventListener("pointerdown", switchTimer);
settings.addEventListener("pointerdown", switchSetting);
shadow.addEventListener("pointerdown", settingsHidden);
submit.addEventListener("pointerdown", changeTimer);
autoStart.addEventListener("pointerdown", switchFlag);
changeTheme.addEventListener("pointerdown", switchFlag);
startStop.addEventListener("pointerdown", switchStartStop);

function switchTimer(event) {
    if (event.target.tagName != "BUTTON") return;
    let permission = confirm("do you want to switch timer? ")
    if(permission){
        onTimesUp();
        nexStepTimer(event.target.dataset.name);
        appTimer.currentRound = 0;
    }   
}



function switchStartStop() {

    if (!isRunning) {
        document.querySelector(".pause-start").innerHTML = "pause";
        startTimer(appTimer.currentTimer);
        isRunning = true;
    } else {
        document.querySelector(".pause-start").innerHTML = "start"
        onTimesUp();
        isRunning = false;
    }
}

function startTimer(timer) {
    timerInterval = setInterval(() => {
        timer.timePassed = timer.timePassed += 1;
        timer.timeLeft = timer.time - timer.timePassed;
        if (!timer.timeLeft) {
            audio.play();
        } ;
        baseTimerLabel.innerHTML = formatTime(timer.timeLeft);
        if (timer.timeLeft === -1) {
            onTimesUp();
            appTimer.currentRound++;
            appTimer.loopTimer();
            timer.timeLeft = timer.time;
            timer.timePassed = 0;
        }
        setCircleDasharray(timer);
        setRemainingPathColor(timer);
    }, 1000);
}

function setCircleDasharray(timer) {
    const circleDasharray = `${(
        calculateTimeFraction(timer) * fullDashArray
    ).toFixed(0)} 283`;
    document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
}

function calculateTimeFraction(timer) {
    const rawTimeFraction = timer.timeLeft / timer.time;
    return rawTimeFraction - (1 / timer.time) * (1 - rawTimeFraction);
}

function switchFlag(event) {
    if (!this == event.target) return;
    this.classList.toggle("button-left");
    if (this.id == "changeTheme") document.body.classList.toggle("light");
    else flag = true;
}

function switchSetting() {
    shadow.hidden = !shadow.hidden;
}
function settingsHidden(event) {
    if (shadow == event.target || event.target.closest("#closeSetting"))
        switchSetting();
}

function changeTimer() {
    appTimer.updateTimer();
    if(flag) appTimer.autoStart = !appTimer.autoStart;
    flag = false;
    switchSetting();
}

class Timer {
    constructor(name, time) {
        this.name = name,
        this.time = time,
        this.timeLeft = time,
        this.timePassed = 0;
    }
    setNewTime(time) {
        this.time = time;
        this.timeLeft = time;
        this.timePassed = 0;
    }
}

class App {
    constructor() {
        this.arrTimer = [],
        this.autoStart = false,
        this.repeatLongBreak = 2;
        this.currentRound = 1;
    }
    addTimer(timers) {
        this.arrTimer = this.arrTimer.concat(timers);
    }
    updateTimer() {
        this.arrTimer.forEach((timer) => {
            const timerName = document.getElementById(timer.name);
            let seconds = Array.from(
                timerName.querySelectorAll("input")
            ).reduce((sum, input, index) => {
                let seconds = Number(input.value);
                if (index == 0) seconds *= 60;
                return (sum += seconds);
            }, 0);
            timer.setNewTime(seconds);
        });
    }
    getTimer(name) {
        this.arrTimer.forEach((timer) => {
            if (timer.name == name) {
                this.currentTimer = Object.assign({}, timer);
            }
        });
        return this.currentTimer;
    }

    loopTimer() {
        if (this.repeatLongBreak * 2 === this.currentRound) {
            nexStepTimer("longBreak");
            this.currentRound = 0;
            return;
        }
        if (this.currentRound % 2) {
            nexStepTimer("timerPomodoro");
        }
        if (!(this.currentRound % 2)) {
            nexStepTimer("sortBreak");
        }
    }
}

function nexStepTimer(name){
    if(!appTimer.autoStart) isRunning = false;
    changeClassTimer(appTimer.currentTimer.name);
    let timer = appTimer.getTimer(name);
    changeClassTimer(appTimer.currentTimer.name);
    baseTimerLabel.innerHTML = formatTime(timer.timeLeft);
    setCircleDasharray(timer);
    if (appTimer.autoStart) startTimer(timer);
}

function changeClassTimer(name){
    document.body
        .querySelector(`[data-name=${name}]`)
        .classList.toggle("selected-timer");
}

const timerPomodoro = new Timer("timerPomodoro", 3);
const sortBreak = new Timer("sortBreak", 2);
const longBreak = new Timer("longBreak", 12);

const appTimer = new App();
appTimer.addTimer([timerPomodoro, sortBreak, longBreak]);
appTimer.getTimer("timerPomodoro");


colorCalculation = {
    warningThreshold(){
        return Math.floor(appTimer.currentTimer.time / 2);
    },
    alertThreshold(){
        return Math.floor(appTimer.currentTimer.time / 3);
    }
}

const COLOR_CODES = {
    info: {
        color: "lightOrange",
    },
    warning: {
        color: "orange",
        threshold: colorCalculation.warningThreshold(),
    },
    alert: {
        color: "red",
        threshold: colorCalculation.alertThreshold(),
    },
};

let remainingPathColor = COLOR_CODES.info.color;

function onTimesUp() {
    clearInterval(timerInterval);
}

function formatTime(time) {
    let minutes = Math.floor(time / 60);

    let seconds = time % 60;

    seconds = check(seconds);
    minutes = check(minutes);

    return `${minutes}:${seconds}`;

    function check(num){
        if (num < 10) {
            num = `0${num}`;
        }
        return num;
    }
}


function setRemainingPathColor(timer) {
    const { alert, warning, info } = COLOR_CODES;
    const runTimer = document.getElementById("base-timer-path-remaining");
    if (timer.timeLeft <= alert.threshold) {
        runTimer.classList.remove(warning.color);
        runTimer.classList.add(alert.color);
            
    } 
    if (timer.timeLeft <= warning.threshold) {
        runTimer.classList.remove(info.color);
        runTimer.classList.add(warning.color);
    }
    else if(timer.timeLeft >= warning.threshold){
        runTimer.classList.remove(alert.color);
        runTimer.classList.remove(warning.color);
        runTimer.classList.add(info.color);
    }
}

document
    .getElementById("base-timer-path-remaining")
    .classList.add(remainingPathColor);

appTimer.loopTimer();
