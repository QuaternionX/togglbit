import document from "document";
import clock from "clock";

clock.granularity = "seconds";

var runningEntry = null;
var durationLabel = null;
var lastTo = 0;

const ENTRY_COUNT = 10;

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
  this.entriesList = document.getElementById("entriesList");
  this.views = document.getElementById("views");
  this.todayLabel = document.getElementById("today-total");
  this.weekLabel = document.getElementById("week-total");
  this.syncButton = document.getElementById("sync-button");
  this.syncArc = document.getElementById("sync-arc");
  this.notification = document.getElementById("notification");

  this.timer = null;
  this.entry = null;
  this.recentEntries = [];

  // Recent entries
  this.tiles = [];

  let list = document.getElementById("entries-list");
  this.tiles = list.getElementsByClassName("item");

  // Summary Day Pies
  this.dayPies = [];
  this.dayPies = document.getElementsByClassName("total-pie-day");

/*
  // Summary Week Pies
  this.weekPies = [];
  this.weekPies = document.getElementsByClassName("total-pie-week");
  */
}

UI.prototype.updateUI = function(data) {
  //console.log("updateUI");
  if (data.type === "current-entry") {
    this.updateNotification(null);
    this.updateTimer(data.data);
  } else if (data.type === "entry-stop") {
    this.updateTimer(null);
  } else if (data.type === "unique") {
    this.updateRecentList(data.data);
  } else if (data.type === "summary") {
    this.updateSummary(data.data);
  } else if (data.type === "error") {
    this.updateNotification(data.data.message);
  }
}

UI.prototype.updateNotification = function(message) {
  console.log("Update notification: " + message);
  this.notification.text = message;
  this.notification.style.display = !!message ? "inline": "none";
}

UI.prototype.syncSpinner = function(index) {
  //console.log("sync");
  this.syncArc.animate("enable");
}

UI.prototype.switchTo = function(index) {
  this.views.value = index;
}

UI.prototype.updateTimer = function(data) {
  var label,
    color = "#ffffff";

  runningEntry = data;
  this.entry = data;
  if (!!data) {
    //Running entry
    label = data.description;
    if (!!data.project) {
      label += " • " + data.project;
      color = data.c;
    }
    this.entryLabel.style.fill = color;
    console.log("Description - " + label);
    this.entryLabel.text = label;
    this.circle.style.fill = "#db1e1e";
    toggleRunning(true);
  } else {
    durationLabel.text = "";
    this.entryLabel.text = "";
    this.circle.style.fill = "#228B22";
    toggleRunning(false);
    this.updateNotification("No Running Time entry.\nTap on play button to start");
  }
}

UI.prototype.updateRecentList = function(data) {
  this.recentEntries = data;
  for (let i = 0; i < ENTRY_COUNT; i++) {
    let tile = this.tiles[i];
    if (!tile) {
      continue;
    }

    const entry = data[i];
    if (!entry) {
      tile.style.display = "none";
      continue;
    }

    tile.style.display = "inline";
    tile.getElementById("desc").text = entry.d;
    if (!!entry.p) {
      tile.getElementById("proj").text = "• " +entry.p;
      tile.getElementById("proj").style.fill = entry.c;
    }
  }
}

UI.prototype.updateSummary = function(data) {
  this.todayLabel.text = data.today;
  this.weekLabel.text = data.week;


  // Setup Pie chart
  /*
  let c = 1;
  let key;
  let array = data.todayPie;
  let arc;
  let anim;

  for (key in array) {
    if (array.hasOwnProperty(key)) {
      arc = this.dayPies[c].getElementById("total-arc");
      console.log(c + ".) " + key + " | " + arc.style.fill);
      arc.style.fill = array[key].c;
      console.log(c + ".) " + key + " | " + arc.style.fill);

      
      anim = this.dayPies[c].getElementById("anim");
      anim.from = parseInt(array[key].f);
      anim.to = parseInt(array[key].t);
      
      this.dayPies[c].animate("enable");
      console.log(array[key].c + " -> (" + anim.from +" - " + anim.to +")");
      c++;
    }
  }
*/
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
  //console.log ("Angle: " + angle);
  return angle > 360 ? 360 : angle;
}

clock.ontick = e => {
  if (!!runningEntry) {
    updateDuration();
  }
}
