/// global variables
let timer;
let phase = "pomodoro";


/// DOM functions

function displayDigits(time){
    let min = time.min;
    let sec = time.sec;
    if (min < 10) min = "0".concat(min);
    if (sec < 10) sec = "0".concat(sec);

    $("#display-min").text(min);
    $("#display-sec").text(sec);
}

function displayProgress(percent){
    $("#pomodoro-progress").css("width", percent+"%");
}

function setColor(color){
    let addGreen = (color == "green");
    $("#timer").toggleClass("green-timer",addGreen);
    $("#pomodoro-progress").toggleClass("green-progress",addGreen);
    $("#timer").toggleClass("red-timer",!addGreen);
    $("#pomodoro-progress").toggleClass("red-progress",!addGreen);
}

function setTitle(txt) {
    $("#app-title").text(txt);
}

function getConfig(){
    const pomodoroVal = $("#pomodoro-num").val();
    const breakVal = $("#break-num").val();
    const incremental = $("#incr-checkbox")[0].checked;

    return {pomodoro : pomodoroVal,
            break : breakVal,
            incremental : incremental};
}

/// user interactions

// call the given handler in case of input change
function onConfigChange(handler){
    [$("#pomodoro-num"), $("#break-num"), $("#incr-checkbox")]
    .forEach(
        (node) => node.change(
            () => handler()));
}

// set event handlers
$("#start-btn").click(start);
$("#stop-btn").click(stop);
onConfigChange(stop);


/// Timing functions

function startTimer(handler){
    timer = setInterval(handler,1000);
}

function stopTimer(){
    clearInterval(timer);
}

/// Calculation functions

function calcProgress(endTime,currentTime){
    let end = endTime.min * 60 + endTime.sec;
    let current = currentTime.min * 60 + currentTime.sec;
    return current / end * 100;
}

function increment(t){
    let m = t.min;
    let s = t.sec;

    if (s == 59){
        s = 0;
        m++;
    }else{
        s++;
    }
    return {min : m, sec : s};
}

function decrement(t){
    let m = t.min;
    let s = t.sec;

    if (s == 0){
        s = 59;
        m--;
    }else{
        s--;
    }
    return {min : m, sec : s};
}


/// something

function startPomodoro(){
    setTitle("Pomodoro Time !");
    setColor("green");
}

function startBreak(){
    setTitle("Break Time !");
    setColor("red");
}

function start(){
    const conf = getConfig();
    const startTime =
          conf.incremental ?
          {min : 0 , sec : 0} :
          {min: conf.pomodoro, sec : 0};
    const endTime =
          conf.incremental ?
          {min : conf.pomodoro, sec : 0} :
          {min : 0, sec : 0};

    let time = startTime;
    let progress = 0;

    startTimer(function(){
        if (phase == "pomodoro")
            startPomodoro();
        else
            startBreak();

        if (conf.incremental)
            time = increment(time);
        else
            time = decrement(time);
        displayDigits(time);

        if (!conf.incremental)
            progress = calcProgress(startTime,time);
        else
            progress = calcProgress(endTime,time);

        displayProgress(progress);

        if (time.min == endTime.min
            && time.sec == endTime.sec){
            if (phase == "pomodoro") {
                phase = "break";
                time = startTime;
                progress = 0;
            }else{
                stop();
            }
        }
    });
}

function stop(){
    displayDigits({min : 0, sec : 0});
    displayProgress(0);
    stopTimer();
    phase = "pomodoro";
    setTitle("Pomodoro App");
}
