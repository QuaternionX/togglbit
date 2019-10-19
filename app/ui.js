import document from "document";
import clock from "clock";

clock.granularity = "seconds";

var runningEntry = null;
var durationLabel = null;
var lastTo = 0;

const secondsContainer = document.getElementById("arc-seconds");
const secondsContainerBack = document.getElementById("arc-seconds-back");
const secondsAnim = secondsContainer.getElementById("anim");
const secondsArc = secondsContainer.getElementById("arc");

const playIcon = document.getElementById("play-icon");
const stopIcon = document.getElementById("stop-icon");

export function UI() {
  this.status = document.getElementById("status");
  this.circle = document.getElementById("circle");
  this.rect = document.getElementById("play-rect");
  this.entryLabel = document.getElementById("entry");
  durationLabel = document.getElementById("duration");
  this.timer = null;
  this.entry = null;
}

UI.prototype.updateUI = function(data) {
  console.log("updateUI");
  if (data.type === "current-entry") {
    this.updateTimer(data.data);
  } else if (data.type === "entry-stop") {
    this.updateTimer(null);
  }
}

UI.prototype.updateTimer = function(data) {
  console.log("Update timer");
  console.log(JSON.stringify(data));
  var label;

  runningEntry = data;
  this.entry = data;
  if (!!data) {
    //Running entry
    label = data.description;
    if (!!data.project) {
      label += " • " + data.project;
      this.entryLabel.style.fill = data.c;
    }
    console.log("Description - " + label);
    this.entryLabel.text = label;
    this.circle.style.fill = "#db1e1e";
    toggleRunning(true);
  } else {
    durationLabel.text = "";
    this.entryLabel.text = "";
    this.circle.style.fill = "#228B22";
    toggleRunning(false);
  }
}

var toggleRunning = function(running) {
  if (running) {
    secondsContainer.style.display = "inline";
    secondsContainerBack.style.display = "inline";
    playIcon.style.display = "none";
    stopIcon.style.display = "inline";
  } else {
    secondsContainer.style.display = "none";
    secondsContainerBack.style.display = "none";
    stopIcon.style.display = "none";
    playIcon.style.display = "inline";
  }
}

var updateDuration = function() {
  //console.log("Calc duration");
  let duration = new Date() - new Date(runningEntry.start);
  let seconds = parseInt((duration / 1000) % 60, 10);
  let minutes = parseInt((duration / (1000 * 60)) % 60, 10);
  let hours = parseInt(duration / (1000 * 60 * 60), 10);

  // circle animation
  secondsAnim.to = calcArc(seconds, 60);
  secondsAnim.from = lastTo;

  if (secondsAnim.to == 0 && lastTo != 0) {
    secondsAnim.to = 360;
    lastTo = 0;
  } else {
    lastTo = secondsAnim.to;
  }

  //console.log(secondsAnim.from + " -> " + secondsAnim.to + " = " + seconds);
  secondsContainer.animate("enable");

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  durationLabel.text = hours + ':' + minutes + ':' + seconds;
}

function calcArc(current, steps) {
  let angle = (360 / steps) * current;
  console.log ("Angle: " + angle);
  return angle > 360 ? 360 : angle;
}

clock.ontick = e => {
  if (!!runningEntry) {
    updateDuration();
  }
}
