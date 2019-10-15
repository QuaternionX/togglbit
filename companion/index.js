import { me } from "companion";
import * as messaging from "messaging";
import { API } from "./api.js"

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
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}

function sendUserData() {
  let Api = new API();
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
      var obj = {
        "type": "current-entry",
        "data": {
          "id": entry.id,
          "description": entry.description,
          "duration": entry.duration,
          "start": entry.start
        }
      }
 //     console.log (JSON.stringify(obj));
      messaging.peerSocket.send(JSON.stringify(obj));
      //messaging.peerSocket.send("entry");
    }
  }).catch(function (e) {
    console.log("error");
    console.log(e)
  });
}