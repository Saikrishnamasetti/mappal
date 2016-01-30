if (Meteor.isCordova) {
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

    Template.accel.events({
        "click .navigate": function(event)
        {
            var dest = event.target.id;
            Session.set("view", dest);
            console.log(dest);
        }
    });
}
