import document from "document";
import clock from "clock";

clock.granularity = "seconds";

var runningEntry = null
var durationLabel = null;
export function UI() {
  this.container = document.getElementById("container");
  this.status = document.getElementById("status");
  this.entry = document.getElementById("entry");
  durationLabel = document.getElementById("duration");
  this.runningEntry = null;
  this.timer = null;

  this.container.onclick = function(e) {
    console.log("click");
    var a = this.status.text;
    this.status.text = a + ".";
  }
}

UI.prototype.updateUI = function(data) {
  console.log("updateUI");
  console.log(typeof data);
  if (data.type === "current-entry") {
    this.updateTimer(data.data);
  }
}

var updateDuration = function() {
  console.log("Calc duration");
  let duration = new Date() - new Date(runningEntry.start);
  let seconds = parseInt((duration / 1000) % 60, 10);
  let minutes = parseInt((duration / (1000 * 60)) % 60, 10);
  let hours = parseInt(duration / (1000 * 60 * 60), 10);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  durationLabel.text = hours + ':' + minutes + ':' + seconds;
}  


UI.prototype.updateTimer = function(data) {
  console.log("UPdate timer");

  runningEntry = data;
  this.status.text = (!!data) ? "Stop": "Start";
  if (!!data) {
    console.log("Description - " + data.description);
    this.entry.text = data.description;
  }
}

clock.ontick = e => {
  if (!!runningEntry) {
    updateDuration();
  }
  
}
