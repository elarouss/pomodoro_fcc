import React, { Component } from 'react';
import {createStore} from 'redux';
import {connect,Provider} from 'react-redux';
import './App.css';

const INC_BREAK = 'INC_BREAK';
const INC_SESSION = 'INC_SESSION';
const DEC_BREAK = 'DEC_BREAK';
const DEC_SESSION = 'DEC_SESSION';
const PLAY_PAUSE = 'PLAY_PAUSE';
const RESET = 'RESET';
const UPDATE_TIME = 'UPDATE_TIME';
const TIME_OUT = 'TIME_OUT';
const PLAY_AUDIO = 'PLAY_AUDIO';
const STOP_AUDIO = 'STOP_AUDIO';

const SESSION_PHASE = 'SESSION_PHASE';
const BREAK_PHASE = 'BREAK_PHASE';

const incBreak = () => {
  return {type: INC_BREAK};
};

const incSession = () => {
  return {type: INC_SESSION};
};

const decBreak = () => {
  return {type: DEC_BREAK};
};

const decSession = () => {
  return {type: DEC_SESSION};
};

const playPause = () => {
  return {type: PLAY_PAUSE};
};

const reset = () => {
  return {type: RESET};
};

const updateTime = (min,sec) => {
  return {type : UPDATE_TIME,min,sec};
};

const timeOut = () => {
  return {type: TIME_OUT};
};

const playAudio = (audio) => {
  return {type: PLAY_AUDIO,audio};
};

const stopAudio = () => {
  return {type: STOP_AUDIO};
};

const defaultState =
  {sessionLength: 25,
   breakLength: 5,
   timer_min : 25,
   timer_sec : 0,
   running: false,
   phase: SESSION_PHASE,
   phaseShifted: false,
   audio: null};

const reducer = (state = defaultState,action) => {
  const newState = Object.assign({},state);
  switch (action.type) {
    case INC_SESSION:
      if (state.sessionLength < 60){
        const length = state.sessionLength + 1;
        newState.sessionLength = length;
        if (state.phase === SESSION_PHASE){
          newState.timer_min = length;
          newState.timer_sec = 0;
        }
      }
      return newState;
    case DEC_SESSION:
      if (state.sessionLength > 1){
        const length = state.sessionLength - 1;
        newState.sessionLength = length;
        if (state.phase == SESSION_PHASE){
          newState.timer_min = length;
          newState.timer_sec = 0;
        }
      }
      return newState;
    case INC_BREAK:
      if (state.breakLength < 60){
        const length = state.breakLength + 1;
        newState.breakLength = length;
        if (state.phase == BREAK_PHASE){
          newState.timer_min = length;
          newState.timer_sec = 0;
        }
      }
      return newState;
    case DEC_BREAK:
      if (state.breakLength > 1){
        const length = state.breakLength - 1;
        newState.breakLength = length;
        if (state.phase == BREAK_PHASE){
          newState.timer_min = length;
          newState.timer_sec = 0;
        }
      }
      return newState;
    case PLAY_PAUSE:
      newState.running = !state.running;
      if (!state.running)
        newState.phaseShifted = true; // to restart the timer
      return newState;
    case RESET:
      let s = {...defaultState};
      s.audio =  state.audio;
      return s;
    case UPDATE_TIME:
      newState.timer_min = action.min;
      newState.timer_sec = action.sec;
      newState.phaseShifted = false;
      return newState;

    case TIME_OUT:
      newState.timer_sec = 0;
      newState.phaseShifted = true;
      if (state.phase == SESSION_PHASE){
        newState.phase = BREAK_PHASE;
        newState.timer_min = state.breakLength;
      }else{
        newState.phase = SESSION_PHASE;
        newState.timer_min = state.sessionLength;
      }
      return newState;

    case PLAY_AUDIO:
      if (state.audio === null){
        newState.audio = action.audio;
        newState.audio.play();
      }else{
        state.audio.play();
      }

      return newState;

    case STOP_AUDIO:
      if (state.audio !== null){
        let audio = state.audio;
        audio.pause();
        audio.currentTime = 0;
        newState.audio = audio;
      }
      return newState;

    default:
      return state;
  }
};

const store = createStore(reducer);


class TimeSetter extends Component {
  constructor(props){
    super(props);
  }
  render()  {
    return(
      <div className="time-setter">
        <div id={this.props.labelId}>{this.props.label}</div>
        <div className="setter-controls">
          <a href="#" id={this.props.decId} onClick={this.props.dec}>
            <i className="fa fa-arrow-down arrow"></i>
          </a>
          <span id={this.props.lengthId}>{this.props.length}</span>
          <a href="#" id={this.props.incId} onClick={this.props.inc}>
            <i className="fa fa-arrow-up arrow"></i>
           </a>
        </div>
      </div>
    );
  }

}

class BreakControls extends Component {
  constructor(props){
    super(props);
  }
  render(){
    return(
      <TimeSetter
        labelId="break-label"
        label="Break Length"
        incId="break-increment"
        decId="break-decrement"
        lengthId="break-length"
        length={this.props.length}
        dec={this.props.dec}
        inc={this.props.inc} />
    );
  }
}

class SessionControls extends Component {
  constructor(props){
    super(props);
  }
  render(){
    return(
      <TimeSetter
         labelId="session-label"
         label="Session Length"
         incId="session-increment"
         decId="session-decrement"
         lengthId="session-length"
         length={this.props.length}
         dec={this.props.dec}
         inc={this.props.inc}/>
    );
  }
}

class Timer extends Component {
  constructor(props){
    super(props);

    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.t = null;
  }

  startTimer(){
    this.stopTimer();
    this.t = setInterval(() =>{
      let mins = this.props.min;
      let secs = this.props.sec;
      secs--;
      if (secs == -1){
        mins--;
        secs = 59;
      }
      this.props.updateTime(mins,secs);
      if (mins == -1 && secs == 59) {
        this.stopTimer();
        this.props.timeOut();
        this.props.playAudio(this.refs.beep);
      }
    },1000);
  }

  stopTimer(){
    if (this.t)
      clearInterval(this.t);
  }

  render(){
    if (this.props.phaseShifted)
      this.startTimer();

    if (!this.props.running)
      this.stopTimer();

    const mins = (this.props.min < 10)?
       "0"+this.props.min:this.props.min;
    const secs = (this.props.sec < 10)?
       "0"+this.props.sec:this.props.sec;
    return(
      <div>
        <audio
          id="beep"
           ref="beep"
           preload="auto"
           src="https://goo.gl/65cBl1" />
        <div id="time-left">{mins + ":" + secs}</div>
      </div>
    );
  }


}

class Display extends Component {
  constructor(props){
    super(props);
  }
  render(){
    const timerLabel = (this.props.phase == SESSION_PHASE)?
                      "Session":"Break";
    return(
      <div id="display">
        <div id="timer-label">{timerLabel}</div>
        <Timer
           min={this.props.min}
           sec={this.props.sec}
           updateTime={this.props.updateTime}
           timeOut={this.props.timeOut}
           running={this.props.running}
           phaseShifted={this.props.phaseShifted}
           playAudio={this.props.playAudio}/>
      </div>
    );
  }
}

class PomodoroControls extends Component {
  constructor(props){
    super(props);

    this.handleReset = this.handleReset.bind(this);
  }

  handleReset(){
    this.props.stopAudio();
    this.props.reset();
  }

  render(){
    const classes = (this.props.running)? "fa fa-pause":"fa fa-play";
    return(
      <div id="pomodoro-controls">
        <i id="start_stop"
           className={classes}
           onClick={this.props.playPause} ></i>
        <i id="reset"
           className="fa fa-redo"
           onClick={this.handleReset}></i>
      </div>
    );
  }

}


class Pomodoro extends Component {
  constructor(props){
    super(props);
  }
  render(){
    return(
      <div id="pomodoro">

        <div id="time-controls">
          <BreakControls
             length={this.props.breakLength}
             dec={this.props.decBreak}
             inc={this.props.incBreak}/>
          <SessionControls
            length={this.props.sessionLength}
            dec={this.props.decSession}
            inc={this.props.incSession} />
        </div>
        <Display
           phase={this.props.phase}
           phaseShifted={this.props.phaseShifted}
           min={this.props.timer_min}
           sec={this.props.timer_sec}
           updateTime={this.props.updateTime}
           running={this.props.running}
           timeOut={this.props.timeOut}
           playAudio={this.props.playAudio}/>
        <PomodoroControls
          running={this.props.running}
          playPause={this.props.playPause}
          stopAudio={this.props.stopAudio}
          reset={this.props.reset}
           />
      </div>
    );
  }

}

const mapStateToProps = (state) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    incSession: () => dispatch(incSession()),
    decSession: () => dispatch(decSession()),
    incBreak: () => dispatch(incBreak()),
    decBreak: () => dispatch(decBreak()),
    playPause: () => dispatch(playPause()),
    reset: () => dispatch(reset()),
    updateTime: (min,sec) => dispatch(updateTime(min,sec)),
    timeOut: () => dispatch(timeOut()),
    playAudio: (audio) => dispatch(playAudio(audio)),
    stopAudio: () => dispatch(stopAudio())
  };
};

const Container = connect(mapStateToProps,mapDispatchToProps)(Pomodoro);

class App extends Component {
  render() {
    return (
      <div id="app">
        <header>Pomodoro Clock</header>
        <Provider store={store}>
          <Container />
        </Provider>
        <footer>
          <p>Made With <i className="fa fa-heart"></i>
           &nbsp; By <a href="https://www.github.com/elarouss">
            Oussama El Arbaoui</a></p>
          <p>&copy; 2018</p>
        </footer>
      </div>
    );
  }
}
// https://goo.gl/65cBl1
export default App;
