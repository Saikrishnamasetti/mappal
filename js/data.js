Data = new Mongo.Collection("data");

var curr_lat = 36.9719;
var curr_long = 122.0264;
var counter = 0;

var person = null;
//var testsession = null;

Data.schema = new SimpleSchema({
    text: {type: String},
    name: {type: String},
    start_lat: {type: Number},
    start_long: {type: Number},
    stop_lat: {type: Number},
    stop_long: {type: Number},
    route_qual: {type: Number},
    route_grade: {type: Number},
    route_start: {type: String},
    route_end: {type: String},
    createdAt: {type: Date}
 });



/*function showPosition(position){
     Data.insert({
         text: "" + curr_lat + "_" + curr_long + "%%" + position.coords.latitude + "_" + position.coords.longitude,
         name: "test " + counter,
         start_lat: curr_lat,
         start_long: curr_long,
         stop_lat: position.coords.latitude,
         stop_long: position.coords.longitude,
         route_qual: 1.0,
         route_grade: 1.0,
         createdAt: new Date()
     });

    curr_lat = position.coords.latitude;
    curr_long = position.coords.longitude;
}

function tagLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);

    }
}
*/

if(Meteor.isServer)
{
    Meteor.publish("points", function() {
        return Data.find({}, {sort: {createdAt: -1}});
    })
}

if (!Meteor.isServer)
{

    Template.data.events({
        "click #start": function()
        {
            var ll = Geolocation.latLng();
            Session.set("curr_long", ll.lng);
            Session.set("curr_lat", ll.lat);
            var old_lat = Session.get("curr_lat");
            var old_long = Session.get("curr_long");
            var thisLocation = "" + ll.lng + "," + ll.lat;
            Session.set("locations", thisLocation);
            Session.set("starting", thisLocation);
            Session.set("curr_long", ll.lng);
            Session.set("curr_lat", ll.lat);
            console.log(thisLocation);

        },
        "click #checkpoint": function()
        {
            var locs = Session.get("locations");
            var old_lat = Session.get("curr_lat");
            var old_long = Session.get("curr_long");
            var latLng = Geolocation.latLng();
            var thisLocation = "" + latLng.lng + "," + latLng.lat;
            Session.set("locations", locs + ";" + thisLocation);
            Data.insert({
                text: thisLocation,
                name: thisLocation,
                start_lat: old_lat,
                start_long: old_long,
                stop_lat: latLng.lat,
                stop_long: latLng.lng,
                route_qual: 1.0,
                route_grade: 1.0,
                route_start: Session.get("starting"),
                route_end: " ",
                createdAt: new Date()

            });
            Session.set("curr_lat", latLng.lat);
            Session.set("curr_lng", latLng.lng);
            console.log(locs + ";" + thisLocation);
            //add in the graph


        },
        "click #stop": function()
        {

            var locs = Session.get("locations");
            var old_lat = Session.get("curr_lat");
            var old_long = Session.get("curr_long");
            var latLng = Meteor.call("loc");
            var thisLocation = "" + latLng.lng + "," + latLng.lat;
            Session.set("ending", thisLocation);
            Session.set("locations", locs + ";" + thisLocation);
            Data.insert({
                text: thisLocation,
                name: thisLocation,
                start_lat: old_lat,
                start_long: old_long,
                stop_lat: latLng.lat,
                stop_long: latLng.lng,
                route_qual: 1.0,
                route_grade: 1.0,
                route_start: Session.get("starting"),
                route_end: thisLocation,
                createdAt: new Date()

            });
            Session.set("curr_lat", latLng.lat);
            Session.set("curr_lng", latLng.lng);
            console.log(thisLocation);

            //add in the graph
        }
    });

}
