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
    var x = latLng.lat / 111130;
    var y = latLng.lng / (111320 * Math.cos(latLng.lat));
    return { x: x, y: y };
}

function metersToLatLng(pt)
{
    var lat = pt.x * 111130;
    var lng = pt.y * (111320 * Math.cos(lat));
    return { lat: lat, lng: lng };
}

function getLatLng(id)
{
    var pt = Points.findOne({ _id: id });
    return metersToLatLng(pt.center);
}

// dist in meters
function withinDist(ptA, ptB, dist)
{
    var sq = function(x) { return Math.pow(x, 2); };
    return (sq(ptA.x - ptB.x) + sq(ptA.y - ptB.y)) < sq(dist);
}

function insertGeoPoint()
{
    var latLng    = Geolocation.latLng();
    var newPt     = latLngToMeters(latLng);
    var allPoints = Points.find({});
    var ptID      = -1;

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
    Template.data.helpers({
        error: function()
        {
            var err = Geolocation.error();
            if (err) {
                return err;
            }

            if (!Geolocation.latLng()) {
                return { message: "GPS not ready" };
            }
        }
    });

    Template.data.events({
        "click #start": function()
        {
            var id     = insertGeoPoint();
            var latLng = getLatLng(id);
            Session.set("startPt", id);

            var opts = { frequency: 100 };
            var id   = navigator.accelerometer.watchAcceleration(onMove, onFail, opts);
            Session.set("watchID", id);

            console.log(id, latLng);
        },

        "click #checkpoint": function()
        {
            var id     = insertGeoPoint();
            var latLng = getLatLng(id);

            if (id === Session.get("startPt")) {
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

            if (id === Session.get("startPt")) {
                removeActiveEvents();
                return;
            }

            var segID = endSegment(id);

            navigator.accelerometer.clearWatch(Session.get("watchID"));
            associateActiveEvents(segID);

            console.log(id, latLng);
        }
    });
}
