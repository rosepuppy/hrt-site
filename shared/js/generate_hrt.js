
var hrtText = '';
var hrtFile = null;
var hrtProcessInterval;
var processedHRT;

function RGBtoHSV(rgb_arr) {
    var min, max, delta;
    var h, s, v;
    var r = rgb_arr[0];
    var g = rgb_arr[1];
    var b = rgb_arr[2];

    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    v = max - 15 < 0 ? 0 : max - 15;
    delta = max - min;

    if(max !== 0)
        s = (delta / max + 0.05) % 1.0;       // s
    else {
        // r = g = b = 0        // s = 0, v is undefined
        s = 0;
        h = -1;
        return [h,s,v];
    }
    if (r == max) {
        h = ( g - b ) / delta;     // between yellow & magenta
    } else if (g == max) {
        h = 2 + ( b - r ) / delta; // between cyan & yellow
    } else {
        h = 4 + ( r - g ) / delta; // between magenta & cyan
    }
    h *= 60;               // degrees

    if (h < 0) {
        h += 360;
    }

    return [h,s,v];
}

// Use color thief to retrieve the 3 dominant colours
function colorThiefVideoHRT() {
    var video = $('#vidprocessor')[0];
    var thief = new ColorThief();
    // get 3 colours in a colour palette
    var palette = thief.getPalette(video, 2);

    // convert to hsv
    for (var i = 0; i < 3; i++) {
        palette[i] = RGBtoHSV(palette[i]);
    }

    return palette;
}

// process the hrt for this video
function processVideoHRT() {
    var currentTime = $('#vidprocessor')[0].currentTime * 1000;
    var palette = colorThiefVideoHRT();

    writeHRT(palette, currentTime);

    // Once we are finished writing the lines for hrt, advance the time by 1/2 second
    $('#vidprocessor')[0].currentTime = (currentTime + 500) / 1000;
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
