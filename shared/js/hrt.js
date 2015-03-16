var curTrack = null;
var curBridge = '';
var username = '';
var lastTime = 0;
var hrtInterval;
var prevValues = [];
var lightids = [];
var numSources = 4;

for (var i = 0; i < numSources; i++) {
  prevValues.push({
    on: null,
    hue: null,
    sat: null,
    bri: null
  });
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

function setSourceColor(source, hue, sat, bri) {
  if (isNaN(source)) {
    return;
  }

  var body = {};
  var on = !(hue == 0 && sat == 0 && bri == 0);
  var url = 'http://' + curBridge + '/api/' + username + '/lights/' + source + '/state';
  // console.log(url);
  $("#source"+source).css("background-color", "hsl("+hue+","+sat+"%,"+bri+"%)");

  if (prevValues[source]['on'] == null || prevValues[source]['on'] != on) {
    body['on'] = on;
    prevValues[source]['on'] = on;
  }

  if (prevValues[source]['hue'] == null || prevValues[source]['hue'] != hue) {
    body['hue'] = hue*182;
    prevValues[source]['hue'] = hue;
  }

  if (prevValues[source]['sat'] == null || prevValues[source]['sat'] != sat) {
    body['sat'] = sat*2;
    prevValues[source]['sat'] = sat;
  }

  if (prevValues[source]['bri'] == null || prevValues[source]['bri'] != bri) {
    body['bri'] = parseInt(bri*1.5, 10);
    prevValues[source]['bri'] = bri;
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
      for (var j = 1; j< rules.length; j++) {
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
    var numLights = Math.min(currentPosition.light_cmds.length, lightids.length)
    for (var i = 0; i < currentPosition.light_cmds.length; i++) {
      var source = currentPosition.light_cmds[i];
      setSourceColor(lightids[source.id-1], source.h, source.s, source.v);
    }
  }

  lastTime = currentTime;
};

