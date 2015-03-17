var curTrack = null;
var curBridge = '';
var username = '';
var lastTime = 0;
var hrtInterval;
var prevValues = [];
var lightids = [];
var numSources = 4;

function initPrevValues() {
  for (var i = 0; i < lightids.length; i++) {
    prevValues.push({
      on: null,
      hue: null,
      sat: null,
      bri: null
    });
  }
}

function setTrack(track) {
  curTrack = track;
}

function setBridge(bridge) {
  curBridge = bridge;
}

function setUsername(name) {
  username = name;
}

function setLights(lights) {
  lightids = lights;
}

function setTransitionTime(source, time) {
  if (isNaN(source)) {
    return;
  }

  var url = 'http://' + curBridge + '/api/' + username + '/lights/' + source + '/state';

  $.ajax({
    type: "PUT",
    url: url,
    data: JSON.stringify({
      transitiontime: time
    }),
    complete: function(data, statusText) {
      // console.log(statusText);
    },
    dataType: "json"
  }); 
}

function setSourceColor(source, index, hue, sat, bri) {
  if (isNaN(source)) {
    return;
  }

  var body = {};
  var on = !(hue == 0 && sat == 0 && bri == 0);
  var url = 'http://' + curBridge + '/api/' + username + '/lights/' + source + '/state';
  // console.log(url);
  $("#source"+source).css("background-color", "hsl("+hue+","+sat+"%,"+bri+"%)");

  if (prevValues[index]['on'] == null || prevValues[index]['on'] != on) {
    body['on'] = on;
    prevValues[index]['on'] = on;
  }

  if (prevValues[index]['hue'] == null || prevValues[index]['hue'] != hue) {
    body['hue'] = hue*182;
    prevValues[index]['hue'] = hue;
  }

  if (prevValues[index]['sat'] == null || prevValues[index]['sat'] != sat) {
    body['sat'] = sat*2;
    prevValues[index]['sat'] = sat;
  }

  if (prevValues[index]['bri'] == null || prevValues[index]['bri'] != bri) {
    body['bri'] = parseInt(bri*1.5, 10);
    prevValues[index]['bri'] = bri;
  }

  if (body.length === 0) {
    return;
  }

  $.ajax({
    type: "PUT",
    url: url,
    data: JSON.stringify(body),
    complete: function(data, statusText) {
      // console.log(statusText);
    },
    dataType: "json"
  });
}

function parsehrt(hrtFile) {
  var reader = new FileReader();
  var hrtjson = [];
  reader.readAsText(hrtFile);

  reader.onload = function(e) {
    var commands = reader.result.split("!");
    for (var i = 0; i < commands.length; i++) {
      commands[i]=commands[i].trim();
      var commandObj = {};
      var rules = commands[i].split(";");

      rules[0] = rules[0].trim();
      var timestamp = 0;
      var timeParts = rules[0].split(":");
      timestamp = timestamp + parseInt(timeParts[3],10);
      timestamp = timestamp + parseInt(timeParts[2],10) * 1000;
      timestamp = timestamp + parseInt(timeParts[1],10) * 60 * 1000;
      timestamp = timestamp + parseInt(timeParts[0],10) * 60 * 60 * 1000;
      commandObj["timestamp"] = timestamp - 200;
      if (rules.length > 1){
        commandObj["light_cmds"] = [];
      }
      for (var j = 1; j< rules.length-1; j++) {
        rules[j] = rules[j].trim();
        var controlsParts = rules[j].split(",");
        commandObj["light_cmds"].push({
          "id": parseInt(controlsParts[0],10),
          "h": parseInt(controlsParts[1],10),
          "s": parseInt(controlsParts[2],10),
          "v": parseInt(controlsParts[3],10),
        });
      }
      hrtjson.push(commandObj);
    }

    // call hooks here
    setTrack(hrtjson);
  }
}

function updateHrtFrame() {
  if (curTrack === null) {
    return;
  }

  var currentTime = $('#hrt-player')[0].currentTime * 1000;
  var currentPosition = null;

  if (lastTime > currentTime) {
    lastTime = 0;
  }

  // console.log(currentTime);


  for (var i = 0; i < curTrack.length; i++) {
    if (curTrack[i].timestamp <= currentTime && curTrack[i].timestamp > lastTime) {
      currentPosition = curTrack[i];
    }
  }

  if (currentPosition !== null) {
    for (var i = 0; i < lightids.length; i++) {
      var source = currentPosition.light_cmds[(i % currentPosition.light_cmds.length)];
      setSourceColor(lightids[i], i, source.h, source.s, source.v);
    }
  }

  lastTime = currentTime;
};

