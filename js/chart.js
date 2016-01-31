if (!Meteor.isServer) {
    Template.chart.accelChart = function() {
        var data = new Array();
        var sq = function(x) { return Math.pow(x, 2); };
        var accelEvents = AccelEvents.find({}, { sort: { createdAt: 1 }});

        accelEvents.forEach(function(acc) {
            data.push(Math.sqrt(sq(acc.x) + sq(acc.y) + sq(acc.z)) - 9.81);
        });

        return {
            chart: {
                type: 'area'
            },

            title: "Acceleration",

            credits: {
                enabled: false
            },

            xAxis: {
                allowDecimals: true,
                labels: {
                    formatter: function() {
                        return this.value;
                    }
                }
            },

            yAxis: {
                allowDecimals: false,
                labels: {
                    formatter: function() {
                        return this.value;
                    }
                }
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

            series: [{
                name: null,
                data: data,
            }]
        };
    }
}
