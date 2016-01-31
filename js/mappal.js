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
}

Meteor.methods({
    clearAccData: function()
    {
        return AccelEvents.remove({});
    }
});
