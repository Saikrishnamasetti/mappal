AccelEvents = new Mongo.Collection("accel");
var watchID;

if (Meteor.isServer) {
    (function() {
        var accelEvents = AccelEvents.find({}, { sort: { createdAt: -1 }});
        accelEvents.observeChanges({
            added: function(doc) {
                console.log("Added!");
            }
        });
    })();
}

if (!Meteor.isServer) {
    function onMove(acc)
    {
        Session.set("accX", acc.x);
        Session.set("accY", acc.y);
        Session.set("accZ", acc.z);

        AccelEvents.insert({
            x: acc.x,
            y: acc.y,
            z: acc.z,
            createdAt: new Date()
        });
    }

    function onFail()
    {
        alert("onFail!");
    }

    Template.accel.helpers({
        accX: function()
        {
            return Session.get("accX");
        },

        accY: function()
        {
            return Session.get("accY");
        },

        accZ: function()
        {
            return Session.get("accZ");
        }
    });

    Template.accel.onRendered(function() {
        Session.set("accX", 0);
        Session.set("accY", 0);
        Session.set("accZ", 0);

        var accOpts = { frequency: 100 };
        watchID = navigator.accelerometer.watchAcceleration(onMove, onFail, accOpts);
    });

    Template.accel.onDestroyed(function() {
        console.log("DESTROYED!!!");
        navigator.accelerometer.clearWatch(watchID);
    });
}
