var data; //[business_id, name, lon, lat]

d3.json("./az100.json", function(error, json) {
    if (error) return console.warn(error);
    data = json; 
      
    // create a map in the "map" div, set the view to a given place and zoom
    lon = data[0][2]
    lat = data[0][3]
    var map = L.map('map').setView([lon, lat], 10);

    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // add markers
    function onClick(e) {
        plotByID(this._leaflet_id);
    }

    var markers = []
    for (var i = 0; i < data.length; i ++) {
         var marker = L.marker([data[i][2], data[i][3]]).on('click', onClick);
         marker._leaflet_id = data[i][0];
         marker.addTo(map);
         markers[markers.length] = marker
    }

    // custom marker for selected restaurant
    var redMarker = L.icon({
        iconUrl: './leaflet-0.8-dev/images/marker-red.png',
        shadowUrl: './leaflet-0.8-dev/images/marker-shadow.png',

        iconSize:    [25, 41],
        iconAnchor:  [12, 41],
        popupAnchor: [1, -34],
        shadowSize:  [41, 41]
    });

    // area selection
    var SelectedMarkerIndex = new Array();
    var AddedRedMarkers = new Array();
    map.on("boxzoomend", function(e) {
        for (var i = 0; i < markers.length; i++) {
            
            // in the selection area and not been selected
            if (e.boxZoomBounds.contains(markers[i].getLatLng()) && !SelectedMarkerIndex.hasOwnProperty(i)) {
                map.removeLayer(markers[i]); 
                SelectedMarkerIndex.push(i);                   

                var marker = L.marker(markers[i].getLatLng(), {icon: redMarker}).on('click', onClick);
                marker._leaflet_id = markers[i]._leaflet_id;
                marker.addTo(map);
                AddedRedMarkers.push(marker);
            }  
        }

    });

    // reset selection
    d3.select("#reset")
        .on("click", function() {
            for (var i = 0; i < AddedRedMarkers.length; i ++) {
                map.removeLayer(AddedRedMarkers[i])
                markers[SelectedMarkerIndex[i]].addTo(map);
            }

            AddedRedMarkers = [];
            SelectedMarkerIndex = [];
            
        }); 

});  