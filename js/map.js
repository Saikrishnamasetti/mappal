var id = 0;

function Node(pt)
{
    this.id        = id++;
    this.pt        = pt;
    this.neighbors = [];

    this.addNeighbor = function(n)
    {
        if (!isNeighbor(this, n)) {
            this.neighbors.push(n);
        }
    }
}

function isNeighbor(node, neighbor)
{
    for (var i = 0; i < node.neighbors.length; i++) {
        var n = node.neighbors[i];
        if (n.id === neighbor.id) {
            return true;
        }
    }
    return false;
}

function findNode(nodes, pt)
{
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.pt == pt) {
            return n;
        }
    }
    return null;
}

function removeNode(nodes, n)
{
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].id === n.id) {
            nodes.splice(i, 1);
            return;
        }
    }
}

function createPath(prev, node)
{
    var path = new Array();
    var curr = node;

    do {
        path.push(curr.pt);
        var tmp = prev[curr.id][0];
        if (prev[curr.id].length > 1) {
            prev[curr.id].splice(0, 1);
        } else if (prev[curr.id].length === 0) {
            tmp = null;
        }
        curr = tmp;
        console.log("3");
    } while (curr);

    return path;
}

function getPaths(ptA, ptB)
{
    var segments = Segments.find({});
    var nodes    = new Array();
    var paths    = new Array();
    var dist     = new Object();
    var prev     = new Object();

    segments.forEach(function(seg) {
        var start = findNode(nodes, seg.startPt);
        var end   = findNode(nodes, seg.endPt);
        if (start) {
            if (!end) {
                end = new Node(seg.endPt);
                nodes.push(end);
            }
            start.addNeighbor(end);
            end.addNeighbor(start);
        } else {
            if (!end) {
                end = new Node(seg.endPt);
                nodes.push(end);
            }
            start = new Node(seg.startPt);
            nodes.push(start);
            start.addNeighbor(end);
            end.addNeighbor(start);
        }
    });

    var startNode = findNode(nodes, ptA._id);
    var endNode   = findNode(nodes, ptB._id);

    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        dist[n.id] = Number.POSITIVE_INFINITY;
        prev[n.id] = new Array();
    }

    dist[startNode.id] = 0;

    while (nodes.length > 0) {
        nodes = nodes.sort(function(a, b) { return dist[b.id] - dist[a.id]; });
        var u = nodes.pop();
        console.log("1");

        for (var i = 0; i < u.neighbors.length; i++) {
            console.log("2");
            var n = u.neighbors[i];
            for (var j = 0; j < prev[u.id].length; j++) {
                if (prev[u.id][j].id === n.id) {
                    continue;
                }
            }
            if (n.id === startNode.id) {
                continue;
            }

            var alt = dist[u.id] + 1;
            if (alt < dist[n.id]) {
                dist[n.id] = alt;
            }
            prev[n.id].push(u);

            if (n.id === endNode.id) {
                paths.push(createPath(prev, n));
                return paths;
                if (paths.length > 3) {
                    return paths;
                }
            }
        }
    }

    return paths;
}

function latLngToMeters(latLng)
{
    var x = latLng.lat * 111130;
    var y = latLng.lng * (111320 * Math.cos(latLng.lat * Math.PI / 180));
    //console.log(latLng.lat + " -> " + x);
    //console.log(latLng.lng + " -> " + y);
    return { x: x, y: y };
}

function metersToLatLng(pt)
{
    var lat = pt.x / 111130;
    var lng = pt.y / (111320 * Math.cos(lat * Math.PI / 180));
    return { lat: lat, lng: lng };
}

function getLatLng(id)
{
    var pt = Points.findOne({ _id: id });
    return metersToLatLng(pt.center);
}

// dist in meters
function sqDist(ptA, ptB)
{
    var sq = function(x) { return Math.pow(x, 2); };
    return sq(ptA.x - ptB.x) + sq(ptA.y - ptB.y);
}

function getNearestPoint(latLng)
{
    var nPt  = latLngToMeters(latLng);
    var rPt  = null
    var dist = Number.POSITIVE_INFINITY;

    Points.find({}).forEach(function(pt) {
        var sd = sqDist(nPt, pt.center);
        if (sd < dist) {
            rPt  = pt;
            dist = sd;
        }
    });

    return rPt;
}

function onMarkerClick(e)
{
    if (!e.target.pathed) {
        var latLng = Geolocation.latLng() || { lat: 0, lng: 0 };
        var start  = getNearestPoint(latLng);
        var end    = getNearestPoint(e.latlng);
        var paths  = getPaths(start, end);

        var tulipText = '';
        for (var i = 0; i < paths.length; i++) {
            tulipText = tulipText + '<div class="path" id="' + i + '">Path ' + i + '</div>';
        }

        e.target.bindPopup(tulipText);
        e.target.openPopup();
        e.target.pathed = true;
    }
}

if (!Meteor.isServer) {
    Template.body.events({
        "click .path": function(event) {
            var path = event.target.id;
        }
    });
    Template.directions.rendered = function () {
        this.autorun(function () {
            if (Mapbox.loaded()) {
                L.mapbox.accessToken = 'pk.eyJ1IjoiZXZhbmZyYXdsZXkiLCJhIjoiY2lqemV0cDJpMmx2a3Z3bTV2dGh1bmt0MSJ9.gJsWsiu3AareD8XkI1-0Aw';
                map = L.mapbox.map('map-dir', "mapbox.streets").setView([37.0000, -122.06], 13);
                L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZXZhbmZyYXdsZXkiLCJhIjoiY2lqemV0cDJpMmx2a3Z3bTV2dGh1bmt0MSJ9.gJsWsiu3AareD8XkI1-0Aw', {
                        attribution: 'Map data &copy; <a href="http://mapbox.com">MapBox</a> ' +
                        'contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/"></a>, ' +
                        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                        maxZoom: 18,
                        id: 'evanfrawley.p1djfdfo',
                        accessToken: 'pk.eyJ1IjoiZXZhbmZyYXdsZXkiLCJhIjoiY2lqemV0cDJpMmx2a3Z3bTV2dGh1bmt0MSJ9.gJsWsiu3AareD8XkI1-0Aw'
                        }).addTo(map);
                var geocoder = L.mapbox.geocoder('mapbox.places');
                map.addControl(L.mapbox.geocoderControl('mapbox.places'));
            }
        });

        Points.find({}).forEach(function(pt) {
            var latLng = metersToLatLng(pt.center);
            var marker = L.marker([latLng.lat, latLng.lng]).addTo(map);
            marker.on('click', onMarkerClick)
            //marker.bindPopup(
            //    '<div class="path" id="1">Path 1</div>'
            //    + '<div class="path" id="2">Path 2</div>'
            //    + '<div class="path" id="3">Path 3</div>'
            //    );
        });
    };
}

