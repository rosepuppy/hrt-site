
var hrtText = '';
var hrtFile = null;
var hrtProcessInterval;
var processedHRT;

// Use color thief to retrieve the 3 dominant colours
function colorThiefVideoHRT() {
    var video = $('#vidprocessor')[0];
    var thief = new ColorThief();
    // get 3 colours in a colour palette
    var palette = thief.getPalette(video, 2);
    for (var i = 1; i <= 3; i++) {
        $('#colorthief' + i).css("background-color", "rgb("+
            palette[i-1][0]+","+palette[i-1][1]+","+palette[i-1][2]+")");
    }

    return palette;
}

// process the hrt for this video
function processVideoHRT() {
    var currentTime = $('#vidprocessor')[0].currentTime * 1000;
    var palette = colorThiefVideoHRT();

    writeHRT(palette, currentTime);

    // Once we are finished writing the lines for hrt, advance the time by 1/2 second
    $('#vidprocessor')[0].currentTime = (currentTime + 1000) / 1000;
}

// Palette should be array of 3 rgb colours
// e.g. [ [1,2,3], [4,5,6], [7,8,9]]
// timestamp = number of milliseconds
function writeHRT(palette, timestamp) {
    var millisecs = Math.floor(timestamp % 1000);
    timestamp = Math.floor(timestamp / 1000);
    var seconds = timestamp % 60;
    timestamp = Math.floor(timestamp / 60);
    var minutes = timestamp % 60;
    timestamp = Math.floor(timestamp / 60); // timestamp = hours

    hrtText += (timestamp + ":" + minutes + ":" + seconds + ":" + millisecs + ";\n")

    for (var i = 0; i < 3; i++) {
        hrtText += ((i+1) + "," + palette[i][0] + "," + palette[i][1] + "," +
        palette[i][2] + ";\n");
    }

    hrtText += "!\n";
}

function createHRTFile(text) {
    var hrtData = new Blob([text], {type: 'text/plain'});

    if (hrtFile !== null) {
        window.URL.revokeObjectURL(hrtFile);
    }

    hrtFile = window.URL.createObjectURL(hrtData);

    return hrtFile;
}
