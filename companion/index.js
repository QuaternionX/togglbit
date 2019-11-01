import { me } from "companion";
import * as messaging from "messaging";
import { API } from "./api.js"
import { settingsStorage } from "settings";

let Api = new API();
let userData;
const apiError = "Sync error - please make sure you have set up Toggl API token in Fitbit mobile app";

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  // Ready to send or receive messages
  restoreSettings();
  getUserData();
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  // Output the message to the console
  //console.log("COMPANION MESSAGE");
  //console.log(JSON.stringify(evt.data));
  if (evt.data.type === "stop") {
    stopEntry(evt.data.data)
  } else if (evt.data.type === "sync") {
    getUserData();
  } else {
    startEntry(evt.data);
  }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}

function startEntry(entry) {
  let te, p, c;
  if (!!entry) {
    te = findById(entry.id, userData.data.time_entries);
  }
  Api.startEntry(te).then(function(data) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      var entry = JSON.parse(data);
      var obj = {
        "type": "current-entry",
        "data": {
          "id": entry.id,
          "description": entry.description,
          "duration": entry.duration,
          "start": entry.start
        }
      }
      if (!!entry) {
        p = findById(entry.pid, userData.data.projects);
        if (!!p) {
          c = p.hex_color;
          p = p.name;
        } else {
          p = "";
        }
        obj.data.project = p;
      }

      if (!!c) {
        obj.data.c = c;
      }
      messaging.peerSocket.send(JSON.stringify(obj));
    }
  }).catch(function (e) {
    console.log("error");
    console.log(e)

    var obj = {
      "type": "error",
      "data": {
        "message": apiError
      }
    };
    messaging.peerSocket.send(JSON.stringify(obj));
  });
}

function stopEntry(entry) {

  Api.stopEntry(entry).then(function(data) {
    var obj = {
      "type": "entry-stop"
    };
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(JSON.stringify(obj));
    } else {
      console.log("Error (stopEntry) - socket not open");
    }
  }).catch(function (e) {
    console.log("error");
    console.log(e)
  });
}

function getUserData() {
  var entry = null,
    entries,
    p,
    c;
  Api.fetchUser().then(function(data) {
    userData = JSON.parse(data);
    entries = JSON.parse(data).data.time_entries;
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {


      if (!!entries) {
        entry = entries.find(te => te.duration < 0) || null;
      }
      var obj = {
        "type": "current-entry",
        "data": null
      };

      if (!!entry) {
        p = findById(entry.pid, userData.data.projects);
        if (!!p) {
          c = p.hex_color;
          p = p.name;
        } else {
          p = "";
        }
        obj = {
          "type": "current-entry",
          "data": {
            "id": entry.id,
            "description": entry.description,
            "duration": entry.duration,
            "start": entry.start,
            "project": p
          }
        };
        if (!!c) {
          obj.data.c = c;
        }
      }
      messaging.peerSocket.send(JSON.stringify(obj));
      var d = JSON.parse(data).data;

      setTimeout(function(){
        generateRecentEntries(d);
      }, 100);

      setTimeout(function(){
        calculateSummary();
      }, 100);
    }
  }).catch(function (e) {
    console.log("error");
    console.log(e)
    var obj = {
      "type": "error",
      "data": {
        "message": apiError
      }
    };
    messaging.peerSocket.send(JSON.stringify(obj));
  });
}

// A user changes Settings
settingsStorage.onchange = evt => {
  if (evt.key === "token") {
    // Settings page sent us an Api token
    let data = JSON.parse(evt.newValue);
    Api.setToken(data.name);
    getUserData();
  }
};

// Restore previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key && key === "token") {
      // We already have a token, get it
      let data = JSON.parse(settingsStorage.getItem(key))
      Api.setToken(data.name);
    }
    if (key && key === "description") {
      // We already have a token, get it
      let data = JSON.parse(settingsStorage.getItem(key))
      Api.setDescription(data.name);
    }
  }
}

function findById(id, array) {
  let key;
  for (key in array) {
    if (array.hasOwnProperty(key) && array[key].id === id) {
      return array[key];
    }
  }

  return undefined;
}


function generateRecentEntries(data) {
  var entries = data.time_entries,
    listEntries = [],
    i,
    obj,
    te;

  var checkUnique = function (te, listEntries) {
    var j, obj, p;

    if (!te.description && !te.pid) {
      return false;
    }

    if (listEntries.length > 0) {
      for (j = 0; j < listEntries.length; j++) {
        if (!!te.description && listEntries[j].d === te.description
            && listEntries[j].pid === te.pid ) {
          return false;
        }
        if (te.id == listEntries[j].id) {
          return false;
        }
      }
    }

    obj = {
      "id": te.id,
      "d": te.description
    };

    p = findById(te.pid, userData.data.projects);

    if (!!p) {
      obj.p = p.name;
      obj.pid = te.pid;
      obj.c = p.hex_color;
    }
    listEntries.push(obj);
    return te;
  };

  for (i = entries.length - 1; i >= 0; i--) {
    te = checkUnique(entries[i], listEntries);
    if (listEntries.length >= 5) {
      break;
    }
  }

  obj = {
    "type": "unique",
    "data": listEntries
  };

  sendRecentEntries(JSON.stringify(obj));
}

function sendRecentEntries(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    setTimeout(function(){
      sendRecentEntries(data);      
    }, 100);
  }
}

function calculateSummary() {
  let todaySum = 0;
  let weekSum = 0;
  let todayItems = 0;
  let weekItems = 0;
  let dur;
  let p;
  let pname;
  const timeEntries = userData.data.time_entries || [];

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Get today's date at midnight for the local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Get today's date at midnight for the local timezone

  const getWeekStart = function (d) {
    const startDay = userData.data.beginning_of_week;
    const day = d.getDay();
    const diff = d.getDate() - day + (startDay > day ? startDay - 7 : startDay);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(now);
  let todayPie = {};
  let weekPie = {};

  timeEntries.forEach(function (entry) {
    // Calc today total
    if (new Date(entry.start).getTime() > today.getTime()) {
      if (entry.duration < 0) {
        dur = ((new Date() - new Date(entry.start)) / 1000);
      } else {
        dur = entry.duration;
      }
      todaySum += dur;

      // Today Pie - project name, color, total duration
      p = findById(entry.pid, userData.data.projects);
      pname = "No project";
      if (!!p) {
        pname = p.name;
      }

      if (!todayPie[pname]) {
        todayItems++;
        todayPie[pname] = { 
          d: 0,
          c: (!!p) ? p.hex_color: "#ffffff"
        };
      }
      todayPie[pname].d += dur;
    }

    // Calc week total
    if (new Date(entry.start).getTime() > weekStart.getTime()) {
      if (entry.duration < 0) {
        dur = ((new Date() - new Date(entry.start)) / 1000);
      } else {
        dur = entry.duration;
      }
      weekSum += dur;

      // Week Pie - project name, color, total duration
      p = findById(entry.pid, userData.data.projects);
      pname = "No project";
      if (!!p) {
        pname = p.name;
      }

      if (!weekPie[pname]) {
        weekItems++;
        weekPie[pname] = { 
          d: 0,
          c: (!!p) ? p.hex_color : "#ffffff"
        };
      }
      weekPie[pname].d += dur;
    }
  });

  let from = 0;
  let c = 1;

  // Today pie
  for (const index in todayPie) {
    if (todayPie.hasOwnProperty(index)) {
      todayPie[index]["f"] = from;
      
      if (todayItems == c) {
        todayPie[index]["t"] = 359;
      } else {
        todayPie[index]["t"] = from + parseInt(todayPie[index].d / todaySum * 360, 10);
      }
      from = todayPie[index]["t"];
      c++;
    }
  }

  // Week pie
  /*
  weekPie.forEach((element, index) => {

  })
*/
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    var obj = {
      "type": "summary",
      "data": {
        today: secToHHMM(todaySum),
        week: secToHHMM(weekSum),
        todayPie: {}, //todayPie,
        weekPie: {} //weekPie
      }
    };
    
    messaging.peerSocket.send(JSON.stringify(obj));
  }
     
}

function secToHHMM(sum) {
  const hours = Math.floor(sum / 3600);
  const minutes = Math.floor((sum % 3600) / 60);
  return hours + 'h ' + minutes + 'm';
}