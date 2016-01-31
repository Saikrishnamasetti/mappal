/**
 * Created by Evan on 1/29/2016.
 */

if (!Meteor.isServer) {
    Template.body.helpers({
        notMain: function () {
            return Session.get("view") != "main";
        },

        getView: function () {
            return Template[Session.get("view")];
        }

    });

    Template.body.events({
        "click .navigate": function (event) {
            var dest = event.target.id;
            Session.set("view", dest);
            console.log(dest);
        },

        "click .clear": function(event)
        {
            Meteor.call('clearAccData');
        }
    });

    Meteor.startup(function () {
        Session.set("view", "main");
    });

    Mapbox.load();

    Tracker.autorun(function () {
        if (Mapbox.loaded()) {
            L.mapbox.accessToken = 'pk.eyJ1IjoiZXZhbmZyYXdsZXkiLCJhIjoiY2lqemV0cDJpMmx2a3Z3bTV2dGh1bmt0MSJ9.gJsWsiu3AareD8XkI1-0Aw';
            var map = L.mapbox.map('map', 'evanfrawley.p1cmfm70');
        }
    });

}

Meteor.methods({
    clearAccData: function()
    {
        return AccelEvents.remove({});
    }
});
