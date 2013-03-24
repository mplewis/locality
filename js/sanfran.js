// hacky addon for when i'm in san fran ;)
// replaces locality.js

// meat'n'potatoes. this script handles basically all the important things on the page! hooray!

// settings for google latitude
// get your user id from https://latitude.google.com/latitude/b/0/apps
var latitudeUserId = "6143439630895179517";

// settings for place validation and place not recognized text
var maxDistToValidateLoc = .094697; // miles = 500 ft
var somewhereElseTitle = 'Somewhere else!';

// settings for last.fm api and text
var lastFmUsername = "trickybeta";
var lastFmApiKey = "5c14ae46a8579d7c453edf696ce5efed";
var listeningText = "♫ Right now I'm listening to ♪";

// locations to show on the page and their coordinates
// right now they're loaded from locations.js by index.html into the var 'locations'

// returns the distance between two lat/lon points in miles
// uses the script from http://www.movable-type.co.uk/scripts/latlong.html to calculate distance
function distMiLatLon(lat1, lon1, lat2, lon2) {
    var rMi = 3963.1676; // earth's radius in miles
    var p1 = new LatLon(lat1, lon1, rMi);
    var p2 = new LatLon(lat2, lon2, rMi);
    return p1.distanceTo(p2);
}

// get Latitude data as JSON
var latitudeUrl = 'https://latitude.google.com/latitude/apps/badge/api?user=' + latitudeUserId + '&type=json';
// use Yahoo YQL to proxy the JSON, otherwise I can't use it because of CORS!
var yahooYqlUrl = 'http://query.yahooapis.com/v1/public/yql?callback=?'

// .timeline-container is a container that holds all the locations in a bar
var timeline = $('.timeline-container');

// get the json data
$.getJSON(yahooYqlUrl, {
    q: 'select * from json where url="' + latitudeUrl + '"',
    format: 'json'
}, function(response) {
    // process the data; yahoo wraps the json stuff in some other YQL stuff
    var data = response.query.results.json;

    // get the coords out; they're strings in the json data
    var currLongitude = parseFloat(data.features.geometry.coordinates[0]);
    var currLatitude = parseFloat(data.features.geometry.coordinates[1]);

    // locName is something like "Minneapolis, Minnesota"
    var locName = data.features.properties.reverseGeocode;
    console.log(locName);

    if (locName.indexOf("San Francisco") > -1) {

        var sanFranBox = $('.san-fran');

        console.log("MATT'S IN SAN FRANCISCO!");

        sanFranBox.append('<h1 class="blink perfect rainbowed" style="color: #0f0; margin-top: -40px;"><!--YEAH, WE\'RE GOING THERE--><blink>San Francisco!</blink></h1>');
        sanFranBox.append('<iframe class="rainbow-bordered" style="margin-top: 60px;" src="http://latitude.google.com/latitude/apps/badge/api?user=6143439630895179517&type=iframe&maptype=roadmap" width="480" height="400" frameborder="0"></iframe>');

    } else {
        
        // iterate through locations and create their items in the timeline-container div
        for (var i = 0; i < locations.length; i++) {
            var loc = locations[i];
            timeline.append('<div class="timeline-data"><p>' + loc.name + '</p></div>');
        };

        // add the "somewhere else" one and control its right side border
        timeline.append('<div class="timeline-data no-right-border somewhere-else"><p>' + somewhereElseTitle + '</p></div>');

        // holds the locations, sorted by my distance from them
        var locSorted = [];

        // add the distance to each object and push'em into an array            
        for (var i = 0; i < locations.length; i++) {
            loc = locations[i];
            locLatitude = loc.coordinates.latitude;
            locLongitude = loc.coordinates.longitude;
            var distance = distMiLatLon(currLatitude, currLongitude, locLatitude, locLongitude)
            locSorted.push({
                locObj: loc,
                distance: distance
            });
        };
        
        // sort locations by increasing distance from current Google Latitude coords
        locSorted.sort(function(item1, item2) {return item1.distance - item2.distance});

        // if no location is validated, validatedLoc will remain as 'null'
        var validatedLoc = null;

        // check the closest place and see if i'm close enough
        var loc = locSorted[0];
        var dist = loc.distance;
        var name = loc.locObj.name;
        // if the closest location is close enough to validate...
        if (dist < maxDistToValidateLoc) {
            // soulja boy tell'em (where i'm located)
            // (where "'em" means the end user's javascript console)
            console.log('Validated location:', validatedLoc);
            // make the name all pretty-like
            validatedLoc = name;
            name = name.toUpperCase();
            // figure out which box has the place at which I am
            // this is kinda lazy code, ima be honest witchu
            var dataBoxes = $('.timeline-data');
            for (var i = 0; i < dataBoxes.length; i++) {
                var dataBox = dataBoxes[i];
                var jqDataBox = $(dataBox);
                var dataBoxText = jqDataBox.text().trim();
                if (dataBoxText.indexOf(validatedLoc) > -1) {
                    // put my face on it. todo: maybe put a bird on it? i like putting a bird on it
                    jqDataBox.append('<div class="face" />');
                    // fade it in all sexy-like
                    $('.face').fadeIn('slow');
                }
            };
        } else { // no location was validated
            // aww. i'm not at a place. i'm somewhere else. make sure to tell'em that
            var jqSomewhereElseBox = $($('.somewhere-else'));
            jqSomewhereElseBox.append('<div class="face" />');
            $('.face').fadeIn('slow');
        }

        // now that my face is in place, check if i'm listening to music
        $.getJSON("http://ws.audioscrobbler.com/2.0/",
            {
                method: "user.getrecenttracks",
                user: lastFmUsername,
                api_key: lastFmApiKey,
                format: "json",
                // have to request at least 2 tracks to make sure the data's returned in the same form each time.
                // if you just request one, sometimes it returns your last track, and sometimes it returns your
                // last track AND your currently playing track. it's a bit annoying, and there is most likely
                // a better way to do this but i kinda like the ghetto elegance of this solution. ghettelegant.
                limit: 2
            },
            function(data) {
                // parse out the cool data i want from the last.fm api. i like you api guys, thanks for the swag api
                var track = data["recenttracks"]["track"][0]

                var artist = track["artist"]["#text"];
                var artistMbid = track["artist"]["mbid"];
                var title = track["name"];
                var trackUrl = track["url"];
                
                // so: most last.fm tracks have the date scrobbled attached.
                // however, if they don't, that means the track is being played right now,
                // and that's the only type of track about which i care
                if (!("date" in track)) {
                    // soulja boy tell'em (that i'm listening to music)
                    console.log('Listening now!');
                    // put my face on it
                    $('.face').append('<p class="now-playing bubble-twitter" style="display: none;"><strong>' + listeningText + '</strong><br />' + title + ' by ' + artist + '</p>');
                    // fade it in yo
                    $('.now-playing').fadeIn('slow');
                } else {
                    // soulja boy tell'em (that i'm actually not listening to music)
                    console.log('Not listening right now.');
                }
            }
        );
    }
});

// handle the modal box i want to pop up with my latitude location badge when you click it
$('.latitude-popup').click(function() {
    var messiHtml = '<iframe src="http://latitude.google.com/latitude/apps/badge/api?user=6143439630895179517&type=iframe&maptype=roadmap" width="480" height="400" frameborder="0"></iframe>';
    new Messi(messiHtml, {title: 'Google Latitude', modal: true});
});

// make my face go down when you hover over the bar so you can read the text! cuuute
$('.timeline-data').hover(function() {
    $('.face').addClass('face-hover');
}, function() {
    $('.face').removeClass('face-hover');
});

// that's all folks. www.kesdev.com, matt@mplewis.com, @kesdev and such. <3