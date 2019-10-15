import document from "document";
import clock from "clock";

clock.granularity = "seconds";

var runningEntry = null
var durationLabel = null;

export function UI() {
  this.status = document.getElementById("status");
  this.circle = document.getElementById("circle");
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

  runningEntry = data;
  this.entry = data;
  this.status.text = (!!data) ? "Stop": "Start";
  if (!!data) {
    console.log("Description - " + data.description);
    this.entryLabel.text = data.description;
    this.circle.style.fill = "red";
  } else {
    durationLabel.text = "";
    this.entryLabel.text = "";
    this.circle.style.fill = "#228B22";
  }
}

var updateDuration = function() {
  //console.log("Calc duration");
  let duration = new Date() - new Date(runningEntry.start);
  let seconds = parseInt((duration / 1000) % 60, 10);
  let minutes = parseInt((duration / (1000 * 60)) % 60, 10);
  let hours = parseInt(duration / (1000 * 60 * 60), 10);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  durationLabel.text = hours + ':' + minutes + ':' + seconds;
}

clock.ontick = e => {
  if (!!runningEntry) {
    updateDuration();
  }
  
}
