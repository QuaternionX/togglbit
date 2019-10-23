/*
 * Entry point for the watch app
 */

import document from "document";
import * as messaging from "messaging";
import { UI } from "./ui.js";

console.log("App code started");
let ui = new UI();

ui.rect.onclick = function(e) {
  console.log("click UI STATUS");
  console.log(JSON.stringify(ui.entry))
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    var obj = {
      "type": (!!ui.entry) ? "stop": "start",
      "data": ui.entry
    };

    messaging.peerSocket.send(obj);
  }
}

ui.syncButton.onclick = function(e) {
  ui.syncSpinner();
  var obj = {
    "type": "sync"
  };

  messaging.peerSocket.send(obj);
}

let list = document.getElementById("entries-list");
let items = list.getElementsByClassName("item");

items.forEach((element, index) => {
  let touch = element.getElementById("touch-me");
  touch.onclick = (evt) => {
    console.log(`touched: ${index}`);
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      console.log("index: " + index);
      console.log(JSON.stringify(ui.recentEntries));
      console.log("--------------------------------------");
      console.log(JSON.stringify((ui.recentEntries[index])))
      messaging.peerSocket.send(ui.recentEntries[index]);
      ui.switchTo(0);
    }
  }
});

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
//  ui.updateUI("loading");
  console.log("HI CONNECTJK ");
//  messaging.peerSocket.send("Hi!");
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  console.log("UI onmessage");
  ui.updateUI(JSON.parse(evt.data));
  console.log(evt.data);
  if (!!JSON.parse(evt.data).data)
    console.log(JSON.parse(evt.data).data.description);
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  //ui.updateUI("error");
  console.log("Connection error: " + err.code + " - " + err.message);
}