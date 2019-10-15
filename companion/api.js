
import { Config } from "./config.js";

export function API(apiKey) {
};

let ApiUrl = "https://toggl.com/api/v8";
let ApiUrlV9 = "https://toggl.com/api/v9";
let UserData;
let CreatedWith = "TogglBit 1.0";
let config = new Config();

console.log("Credentials: " + config.credentials);

API.prototype.fetchUser = function() {
  let self = this;
  console.log("API - Fetch User Data");
  return new Promise(function(resolve, reject) {
    let url = ApiUrl + "/me?with_related_data=true";    

    var obj = {  
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(config.credentials)
    }};
    
    fetch(url, obj)
    .then(response => response.json())
    .then(data => {
      UserData = data.data;
      console.log("Got JSON response from server:" + JSON.stringify(data));
      console.log(".............................");
      //console.log("22Got JSON response from server:" + JSON.parse(JSON.stringify(data)).data.time_entries[0].id);
      resolve(JSON.stringify(data));
    }).catch(function (error) {
      reject(error);
    });
  });
}
/*
API.prototype.stopEntry = function(timeEntry) {
  let self = this;
  console.log("API - Stop Entry");
  return new Promise(function(resolve, reject) {
    let url = ApiUrlV9 + "/time_entries/" + entry.id;

    const stopTime = new Date();
    const startTime = new Date(-TogglButton.$curEntry.duration * 1000);
    const entry = {
      stop: stopTime.toISOString(),
      duration: Math.floor((stopTime - startTime) / 1000)
    };

    var obj = {  
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(config.credentials)
      },
      body: entry
    };
    
    fetch(url, obj)
    .then(response => response.json())
    .then(data => {
      console.log("Got JSON response from server:" + JSON.stringify(data));
      console.log(".............................");
      //console.log("22Got JSON response from server:" + JSON.parse(JSON.stringify(data)).data.time_entries[0].id);
      resolve(JSON.stringify(data));
    }).catch(function (error) {
      reject(error);
    });
  });

}

API.prototype.startEntry = function() {
  let self = this;
  console.log("API - Start Entry");
  return new Promise(function(resolve, reject) {
    let url = ApiUrlV9 + "/time_entries/" + entry.id;

    const start = new Date();
    const entry = {
      stop: start.toISOString(),
      stop: null,
      duration: -parseInt(start.getTime() / 1000, 10),
      description: '',
      pid: null,
      tid: null,
      wid: UserData.user.default_wid,
      tags: null,
      billable: false,
      created_with: CreatedWith
    };

    var obj = {  
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(config.credentials)
      },
      body: entry
    };
    
    fetch(url, obj)
    .then(response => response.json())
    .then(data => {
      console.log("Got JSON response from server:" + JSON.stringify(data));
      console.log(".............................");
      //console.log("22Got JSON response from server:" + JSON.parse(JSON.stringify(data)).data.time_entries[0].id);
      resolve(JSON.stringify(data));
    }).catch(function (error) {
      reject(error);
    });
  });
}
*/