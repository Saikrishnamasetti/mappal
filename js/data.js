Segments    = new Mongo.Collection("segments");
Points      = new Mongo.Collection("points");
AccelEvents = new Mongo.Collection("accel");

Segments.schema = new SimpleSchema(
    { startPt:   {type: Object}
    , endPt:     {type: Object}
    , quality:   {type: Number}
    , grade:     {type: Number}
    , samples:   {type: Number}
    , createdAt: {type: Date}
 });

Points.schema = new SimpleSchema(
    { center: {type: Object}
    , count:  {type: Number}
});

AccelEvents.schema = new SimpleSchema(
    { segID:     {type: String}
    , x:         {type: Number}
    , y:         {type: Number}
    , z:         {type: Number}
    , createdAt: {type: Date}
});

//////////////////////////////////////////

function latLngToMeters(latLng)
{
    var x = latLng.lat * 111130;
    var y = latLng.lng * (111320 * Math.cos(latLng.lat * Math.PI / 180));
    console.log(latLng.lat + " -> " + x);
    console.log(latLng.lng + " -> " + y);
    return { x: x, y: y };
}

function metersToLatLng(pt)
{
    var lat = pt.x / 111130;
    var lng = pt.y / (111320 * Math.cos(lat * Math.PI / 180));
    return { lat: lat, lng: lng };
}

function getLatLng(id)
{
    var pt = Points.findOne({ _id: id });
    return metersToLatLng(pt.center);
}

// dist in meters
function sqDist(ptA, ptB)
{
    var sq = function(x) { return Math.pow(x, 2); };
    return sq(ptA.x - ptB.x) + sq(ptA.y - ptB.y);
}

function withinDist(ptA, ptB, dist)
{
    var sq     = function(x) { return Math.pow(x, 2); };
    var sqDist = sq(ptA.x - ptB.x) + sq(ptA.y - ptB.y);
    console.log(sqDist);
    return sqDist < sq(dist);
}

function insertGeoPoint()
{
    var latLng    = Geolocation.latLng();
    var newPt     = latLngToMeters(latLng);
    var allPoints = Points.find({});
    var ptID      = -1;
    var marker    = L.marker([latLng.lat, latLng.lng]).addTo(map);

    allPoints.forEach(function(pt) {
        if (withinDist(newPt, pt.center, 5)) {
            ptID = pt._id;
        }
    });

    if (ptID === -1) {
        ptID = Points.insert(
            { center: newPt
            , count:  1
        });
    } else {
        var pt = Points.findOne({ _id: ptID });
        var newCenter =
            { x: (newPt.x + (pt.count * pt.center.x)) / (pt.count + 1)
            , y: (newPt.y + (pt.count * pt.center.y)) / (pt.count + 1)
            };

        Points.update({ _id: ptID },
            { $set: { center: newCenter }
            , $inc: { count:  1 }
        });
    }

    return ptID;
}

function drawPaths()
{
    var test1 = L.latLng(36.99985, -122.06221);
    var test2 = L.latLng(37.00016, -122.06103);
    var test3 = L.latLng(36.99979, -122.05908);
    var test4 = L.latLng(37.00000, -122.05687);
    var testarr = [test1, test2, test3, test4];

    var pl = L.polyline(testarr).addTo(map);
    console.log("rip");
}

function endSegment(id)
{
    var segment = Segments.findOne(
        { startPt: Session.get("startPt")
        , endPt:   id
    });

    var segID;

    if (segment) {
        segID = segment._id;
        Segments.update({ _id: segID }, { $inc: { count: 1 }});
    } else {
        segID = Segments.insert(
            { startPt:   Session.get("startPt")
            , endPt:     id
            , quality:   0
            , grade:     0
            , samples:   1
            , createdAt: new Date()
        });
    }

    return segID;
}

function onMove(acc)
{
    AccelEvents.insert(
        { segID:     "active"
        , x:         acc.x
        , y:         acc.y
        , z:         acc.z
        , createdAt: new Date()
    });
}

function onFail()
{
    alert("onFail!");
}

function associateActiveEvents(segID)
{
    var activeEvents = AccelEvents.find({ segID: "active" });
    activeEvents.forEach(function(acc) {
        AccelEvents.update({ _id: acc._id }, { $set: { segID: segID }});
    });
}

function removeActiveEvents()
{
    var activeEvents = AccelEvents.find({ segID: "active" });
    activeEvents.forEach(function(acc) {
        AccelEvents.remove({ _id: acc._id });
    });
}

if(Meteor.isServer)
{
    Meteor.publish("points", function() {
        return Data.find({}, {sort: {createdAt: -1}});
    })
}

if (!Meteor.isServer)
{
    var didStart = false;
    Template.data.helpers({
        error: function () {
            var err = Geolocation.error();
            if (err) {
                return err;
            }

            if (!Geolocation.latLng()) {
                return {message: "GPS not ready"};
            }
        },
        start: function () {
            return !Session.get('active');
        }
    });

    var map = null;


    Template.data.rendered = function () {
        this.autorun(function () {
            if (Mapbox.loaded()) {
                L.mapbox.accessToken = 'pk.eyJ1IjoiZXZhbmZyYXdsZXkiLCJhIjoiY2lqemV0cDJpMmx2a3Z3bTV2dGh1bmt0MSJ9.gJsWsiu3AareD8XkI1-0Aw';
                map = L.mapbox.map('map-data', "mapbox.streets").setView([37.0000, -122.06], 13);
                L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZXZhbmZyYXdsZXkiLCJhIjoiY2lqemV0cDJpMmx2a3Z3bTV2dGh1bmt0MSJ9.gJsWsiu3AareD8XkI1-0Aw', {
                    attribution: 'Map data &copy; <a href="http://mapbox.com">MapBox</a> ' +
                    'contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/"></a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                    maxZoom: 18,
                    id: 'evanfrawley.p1djfdfo',
                    accessToken: 'pk.eyJ1IjoiZXZhbmZyYXdsZXkiLCJhIjoiY2lqemV0cDJpMmx2a3Z3bTV2dGh1bmt0MSJ9.gJsWsiu3AareD8XkI1-0Aw'
                }).addTo(map);

            }
        });
    };



    Template.data.events({
        "click #start": function()
        {
            var id     = insertGeoPoint();
            var latLng = getLatLng(id);
            Session.set("startPt", id);
            Session.set("active", true);

            var marker = L.marker([latLng.lat, latLng.lng]).addTo(map);
            drawPaths();
            var opts = { frequency: 100 };
            if (navigator.accelerometer) {
                var id = navigator.accelerometer.watchAcceleration(onMove, onFail, opts);
                Session.set("watchID", id);
                console.log(id);
            }

            console.log("latLng: " + latLng.lat + ", " + latLng.lng);
        },

        "click #checkpoint": function()
        {
            var id     = insertGeoPoint();
            var latLng = getLatLng(id);

            if (id === Session.get("startPt")) {
                //console.log("End point = Start point");
                //console.log("latLng: " + latLng.lat + ", " + latLng.lng);
                removeActiveEvents();
                return;
            }

            var segID = endSegment(id);
            Session.set("startPt", id);

            associateActiveEvents(segID);

            console.log(id, latLng);
        },

        "click #stop": function()
        {
            var id     = insertGeoPoint();
            var latLng = getLatLng(id);

            if (navigator.accelerometer) {
                navigator.accelerometer.clearWatch(Session.get("watchID"));
            }

            Session.set("active", false);

            if (id === Session.get("startPt")) {
                removeActiveEvents();
                return;
            }

            var segID = endSegment(id);
            associateActiveEvents(segID);
            console.log(id, latLng);
        }
    });
}
