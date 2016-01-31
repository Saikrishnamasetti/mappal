if (!Meteor.isServer) {
    Template.segChart.helpers({
        chart: function() {
            var id = Session.get("currSegID");
            console.log(id);
            var data = new Array();
            var sq = function(x) { return Math.pow(x, 2); };
            var accelEvents = AccelEvents.find({ segID: id }, { sort: { createdAt: 1 }});

            console.log(accelEvents.count());
            accelEvents.forEach(function(acc) {
                data.push(Math.sqrt(sq(acc.x) + sq(acc.y) + sq(acc.z)) - 9.81);
            });

            return {
                chart: {
                    type: 'area',
                    backgroundColor: "#d7d7d7",
                    style: {
                        fontFamily: "Cantarell",
                        fontStyle: "italic",
                        plotBackgroundColor: "#93daf4",
                        borderWidth: 3,
                        borderColor: "#151515"
                    },
                },

                title: "Acceleration",

                credits: {
                    enabled: false
                },

                xAxis: {
                    allowDecimals: true,
                    labels: {
                        formatter: function() {
                            return this.value / 10;
                        }
                    },
                    title: "Time (seconds)",

                },

                yAxis: {
                    allowDecimals: false,
                    labels: {
                        formatter: function() {
                            return this.value;
                        }
                    },
                    title: "Acceleration (m/s/s)"
                },

                plotOptions: {
                    area: {
                        pointStart: 0,
                        marker: {
                            enabled: false,
                            symbol: 'circle',
                            radius: 2,
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        }
                    }
                },

                series: [{ name: "Acceleration", data: data }]
            }
        }
    });
}
