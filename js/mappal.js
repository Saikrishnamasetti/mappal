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
        },


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
        Mapbox.load();
    });

    Template.directions.rendered = function () {
        this.autorun(function () {
            if (Mapbox.loaded()) {
                L.mapbox.accessToken = 'pk.eyJ1IjoiZXZhbmZyYXdsZXkiLCJhIjoiY2lqemV0cDJpMmx2a3Z3bTV2dGh1bmt0MSJ9.gJsWsiu3AareD8XkI1-0Aw';
                var map = L.mapbox.map('map-dir', "mapbox.streets").setView([37.0000, -122.06], 13);
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
}



Meteor.methods({
    clearAccData: function()
    {
        return AccelEvents.remove({});
    }
});
