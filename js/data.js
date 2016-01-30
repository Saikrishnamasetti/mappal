Data = new Mongo.Collection("data");

var curr_lat = 36.9719;
var curr_long = 122.0264;
var counter = 0;

Data.schema = new SimpleSchema({
    text: {type: String},
    name: {type: String},
    start_lat: {type: Number},
    start_long: {type: Number},
    stop_lat: {type: Number},
    stop_long: {type: Number},
    route_qual: {type: Number},
    route_grade: {type: Number},
    createdAt: {type: Date}
 });


function showPosition(position){
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

if(Meteor.isServer)
{
    Meteor.publish("points", function() {
        return Data.find({}, {sort: {createdAt: -1}});
    })
}

if (!Meteor.isServer)
{
    Template.data.helpers({
        tests: function()
        {
            return Data.find({}, {sort: {createdAt: -1}});
        }
    });

    Template.data.events({
        "click .button": function()
        {

            tagLocation();
            console.log("going through");
            counter++;
        }
    });
}
