import { me } from "companion";
import * as messaging from "messaging";
import { API } from "./api.js"
import { settingsStorage } from "settings";

let Api = new API();
let userData;

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  // Ready to send or receive messages
  console.log("  getUserData();");
  restoreSettings();
  getUserData();
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  // Output the message to the console
  console.log("COMPANION MESSAGE");
  console.log(JSON.stringify(evt.data));
  if (evt.data.type === "stop") {
    stopEntry(evt.data.data)
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
      console.log("Send new entry to UI");
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
  });
}

function stopEntry(entry) {
  console.log ("index STOP data");
  Api.stopEntry(entry).then(function(data) {
    console.log ("STOP data -> length: " + data.length);
    console.log (JSON.parse(data));
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
      console.log("93 - " + p);
      var d = JSON.parse(data).data;
      setTimeout(function(){
        generateRecentEntries(d);
      }, 100);
      
      console.log("94");
    }
  }).catch(function (e) {
    console.log("error");
    console.log(e)
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
    console.log("XXXX -- generateRecentEntries");

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
  console.log("!! sendRecentEntries: ");
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    console.log("XXX - SEND unique - Len: " + data.length);
    console.log("Max message size=" + messaging.peerSocket.MAX_MESSAGE_SIZE);

    console.log(data);
    messaging.peerSocket.send(data);
  } else {
    setTimeout(function(){
      sendRecentEntries(data);      
    }, 100);
  }
}



/*

calc daily total and weekly total
 timeEntries.forEach(function (entry) {
      // Calc today total
      if (new Date(entry.start).getTime() > today.getTime()) {
        if (entry.duration < 0) {
          todaySum += ((new Date() - new Date(entry.start)) / 1000);
        } else {
          todaySum += entry.duration;
        }
      }

      // Calc week total
      if (new Date(entry.start).getTime() > weekStart.getTime()) {
        if (entry.duration < 0) {
          weekSum += ((new Date() - new Date(entry.start)) / 1000);
        } else {
          weekSum += entry.duration;
        }
      }

    });
    return {today: secToHHMM(todaySum), week: secToHHMM(weekSum)};

    */