import { me } from "companion";
import * as messaging from "messaging";
import { API } from "./api.js"


let Api = new API();

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  // Ready to send or receive messages
  console.log("  sendUserData();");
  sendUserData();

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

function sendUserData() {
  var entry = null;
  var entries;
  Api.fetchUser().then(function(data) {
    //console.log ("data -> length: " + data.length);
  //  console.log (JSON.parse(data).time_entries);
    entries = JSON.parse(data).data.time_entries;
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {

      console.log("Send to UI");
//      console.log (JSON.stringify(entries));
      if (!!entries) {
        entry = entries.find(te => te.duration < 0) || null;
      }
      console.log("Send to UI 2");
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
      console.log("Send to UI 3");
 //     console.log (JSON.stringify(obj));
      messaging.peerSocket.send(JSON.stringify(obj));
      console.log("Send to UI 4");
      //messaging.peerSocket.send("entry");
    }
  }).catch(function (e) {
    console.log("error");
    console.log(e)
  });
}