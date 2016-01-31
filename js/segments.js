if (!Meteor.isServer) {
    Template.segment.events({
        "click .seg-item": function() {
            Session.set("currSegID", this._id);
            Session.set("view", "segChart");
        }
    });

    Template.segments.helpers({
        segments: function() {
            var points = Session.get("pathPoints");
            var segs   = new Array();
            for (var i = 0; i < points.length - 1; i++) {
                console.log(points[i]);
                var next = i + 1;
                console.log(points[next]);
                var seg = Segments.findOne(
                    { startPt: points[next]
                    , endPt:   points[i]
                });
                if (!seg) {
                    seg = Segments.findOne(
                        { startPt: points[i]
                        , endPt:   points[next]
                    });
                }
                segs.push(seg);
            }
            console.log(segs);
            return segs;
            //return Segments.find({});
        }
    });


    Template.segments.onRendered(function() {
        var segments = Segments.find({});
        segments.forEach(function(seg) {
            Session.set(seg._id, false);
        });
    });
}
