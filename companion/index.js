import { me } from "companion";
import * as messaging from "messaging";
import { API } from "./api.js"
import { settingsStorage } from "settings";

let Api = new API();

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
  if (!!evt.data) {
    stopEntry(evt.data)
  } else {
    startEntry();
  }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}

function startEntry() {
  Api.startEntry().then(function(data) {
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
  var entry = null;
  var entries;
  Api.fetchUser().then(function(data) {
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
        obj = {
          "type": "current-entry",
          "data": {
            "id": entry.id,
            "description": entry.description,
            "duration": entry.duration,
            "start": entry.start
          }
        };
      }
      messaging.peerSocket.send(JSON.stringify(obj));
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