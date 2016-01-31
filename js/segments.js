if (!Meteor.isServer) {
    Template.segment.events({
        "click .seg-item": function() {
            Session.set("currSegID", this._id);
            Session.set("view", "segChart");
        }
    });

    Template.segments.helpers({
        segments: function() {
            return Segments.find({});
        }
    });


    Template.segments.onRendered(function() {
        var segments = Segments.find({});
        segments.forEach(function(seg) {
            Session.set(seg._id, false);
        });
    });
}
