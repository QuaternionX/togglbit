export function API(apiKey) {
};

let ApiUrl = "https://toggl.com/api/v8";
let ApiUrlV9 = "https://toggl.com/api/v9";
let UserData;
let CreatedWith = "TogglBit-1.0";
let credentials;
let entryDescription = "";

API.prototype.setDescription = function(description) {
  console.log("API: set entry description - " + description);
  entryDescription = description;
}

API.prototype.setToken = function(token) {
  console.log("API: set token - " + token);
  credentials = 'Basic ' + btoa(token + ':api_token');
}

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
        'Authorization': credentials
    }};
    
    fetch(url, obj)
    .then(response => response.json())
    .then(data => {
      UserData = data.data;
      //console.log("Got JSON response from server:" + JSON.stringify(data));
      console.log(".............................");
      //console.log("22Got JSON response from server:" + JSON.parse(JSON.stringify(data)).data.time_entries[0].id);
      resolve(JSON.stringify(data));
    }).catch(function (error) {
      reject(error);
    });
  });
}

API.prototype.stopEntry = function(timeEntry) {
  let self = this;
  console.log("API - Stop Entry");
  return new Promise(function(resolve, reject) {
    let url = ApiUrlV9 + "/time_entries/" + timeEntry.id;
    const stopTime = new Date();
    const startTime = new Date(-timeEntry.duration * 1000);
    const entry = {
      stop: stopTime.toISOString(),
      duration: Math.floor((stopTime - startTime) / 1000)
    };
    
    var obj = {  
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials
      },
      body: JSON.stringify(entry)
    }
    console.log(JSON.stringify(obj));

    console.log("StopENTRY - 7");
    fetch(url, obj)
    .then(response => response.json())
    .then(data => {
      console.log("STOPP Got JSON response from server:" + JSON.stringify(data));
      console.log(".............................");
      //console.log("22Got JSON response from server:" + JSON.parse(JSON.stringify(data)).data.time_entries[0].id);
      resolve(JSON.stringify(data));
    }).catch(function (error) {
      reject(error);
    });
  });

}

API.prototype.startEntry = function(timeEntry) {
  let self = this;
  console.log("API - Start Entry");
  return new Promise(function(resolve, reject) {
    let url = ApiUrlV9 + "/time_entries";
    console.log("START ENTRY - 1");
    console.log(JSON.stringify(UserData));
    console.log("START ENTRY - 2");
    const start = new Date();
    console.log("START ENTRY - 3");
    console.log("START ENTRY - " + UserData.default_wid);
    let entry;

    if (!!timeEntry) {
      console.log(JSON.stringify(timeEntry));
      console.log("START ENTRY - 34");
      entry = {
        start: start.toISOString(),
        stop: null,
        duration: -parseInt(start.getTime() / 1000, 10),
        description: timeEntry.description,
        pid: timeEntry.pid,
        tid: timeEntry.tid || null,
        wid: timeEntry.wid || UserData.default_wid,
        tags: timeEntry.tags || null,
        billable: timeEntry.billable || false,
        created_with: CreatedWith
      };

      console.log("START ENTRY - 35");
    } else {
      entry = {
        start: start.toISOString(),
        stop: null,
        duration: -parseInt(start.getTime() / 1000, 10),
        description: entryDescription,
        pid: null,
        tid: null,
        wid: UserData.default_wid,
        tags: null,
        billable: false,
        created_with: CreatedWith
      };
    }

    console.log("START ENTRY - 4");

    var obj = {  
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': credentials
      },
      body: JSON.stringify(entry)
    };
    console.log("START ENTRY - 5");
    console.log(JSON.stringify(obj));
    
    fetch(url, obj)
    .then(response => response.json())
    .then(data => {
      console.log("Got JSON response from server:" + JSON.stringify(data));
      console.log(".............................");
      //console.log("22Got JSON response from server:" + JSON.parse(JSON.stringify(data)).data.time_entries[0].id);
      resolve(JSON.stringify(data));
    }).catch(function (error) {
      console.log(JSON.stringify(error))
      reject(error);
    });
  });
}
