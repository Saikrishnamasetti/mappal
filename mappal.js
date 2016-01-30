if (!Meteor.isServer) {
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
        notMain: function()
        {
            return Session.get("view") != "main";
        },

        getView: function()
        {
            return Template[Session.get("view")];
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
