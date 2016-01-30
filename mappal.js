if (Meteor.isCordova) {
    function onMove(acc)
    {
        Session.set("accX", acc.x);
        Session.set("accY", acc.y);
        Session.set("accZ", acc.z);
    }

    function onFail()
    {
        alert("onFail!");
    }

    Template.body.helpers({
        getView: function()
        {
            return Session.get("view");
        },

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

    Template.body.events({
        "click .navigate": function(event)
        {
            var dest = event.target.id;
            Session.set("view", dest);
            console.log(dest);
        }
    });

    Meteor.startup(function () {
        Session.set("view", "main");
        Session.set("sensitivity", 15);

        Session.set("accX", 0);
        Session.set("accY", 0);
        Session.set("accZ", 0);

        var accOpts = { frequency: 15 };
        navigator.accelerometer.watchAcceleration(onMove, onFail, accOpts);
    });
}
