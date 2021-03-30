const fullDashArray = 283;
let timerInterval;
let isRunning = true;

const {
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
        let timer = appTimer.getTimer(event.target.dataset.name);
        onTimesUp();
        baseTimerLabel.innerHTML = formatTime(timer.time);
        setCircleDasharray(timer);
        appTimer.currentRound = 0;
        appTimer.loopTimer(timer);
    }   
}

function switchStartStop() {
    console.log(isRunning);
    if (!isRunning) {
        console.log(appTimer.currentTimer);
        startTimer(appTimer.currentTimer);
        isRunning = true;
    } else {
        onTimesUp();
        isRunning = false;
    }
}

function startTimer(timer) {
    console.log(timer)
    baseTimerLabel.innerHTML = formatTime(timer.timeLeft);
    timerInterval = setInterval(() => {
        timer.timePassed = timer.timePassed += 1;
        timer.timeLeft = timer.time - timer.timePassed;
        if (timer.timeLeft === -1) {
            onTimesUp();
            appTimer.currentRound++;
            appTimer.loopTimer();
            timer.timeLeft = timer.time;
            timer.timePassed = 0;
        }
        if (timer.timePassed)
            baseTimerLabel.innerHTML = formatTime(timer.timeLeft);
        setCircleDasharray(timer);
        setRemainingPathColor(timer.timeLeft);
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
    else appTimer.autoStart != appTimer.autoStart;
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
    switchSetting();
}

class Timer {
    constructor(name, time) {
        (this.name = name),
            (this.time = time),
            (this.timeLeft = time),
            (this.timePassed = 0);
    }
    setNewTime(time) {
        this.time = time;
    }
}

class App {
    constructor() {
        (this.arrTimer = []),
            (this.autoStart = true),
            (this.repeatLongBreak = 2);
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
                let timer = changeTimer(2);
                if (this.autoStart) startTimer(timer);
                this.currentRound = 0;
                return;
            }
        if (this.currentRound % 2) {
            let timer = changeTimer(0);
            if (this.autoStart) startTimer(timer);
        }
        if (!(this.currentRound % 2)) {
            let timer = changeTimer(1);
            if (this.autoStart) startTimer(timer);
        }
    }
}

function changeTimer(num){
    if(!appTimer.autoStart) isRunning = false;
    let timer = appTimer.getTimer(appTimer.arrTimer[num].name);
    baseTimerLabel.innerHTML = formatTime(timer.timeLeft);
    setCircleDasharray(timer);
    return timer;
}

const timerPomodoro = new Timer("timerPomodoro", 3);
const sortBreak = new Timer("sortBreak", 2);
const longBreak = new Timer("longBreak", 12);

const appTimer = new App();
appTimer.addTimer([timerPomodoro, sortBreak, longBreak]);
appTimer.currentTimer;

const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
    info: {
        color: "green",
    },
    warning: {
        color: "orange",
        threshold: WARNING_THRESHOLD,
    },
    alert: {
        color: "red",
        threshold: ALERT_THRESHOLD,
    },
};

let remainingPathColor = COLOR_CODES.info.color;

function onTimesUp() {
    clearInterval(timerInterval);
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);

    let seconds = time % 60;

    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timer) {
    const { alert, warning, info } = COLOR_CODES;
    if (timer.timeLeft <= alert.threshold) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(warning.color);
        document
            .getElementById("base-timer-path-remaining")
            .classList.add(alert.color);
    } else if (timer.timeLeft <= warning.threshold) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(info.color);
        document
            .getElementById("base-timer-path-remaining")
            .classList.add(warning.color);
    }
}

document
    .getElementById("base-timer-path-remaining")
    .classList.add(remainingPathColor);

appTimer.loopTimer();
