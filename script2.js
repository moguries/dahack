var map;
var directionsService;
var directionsDisplay;
var markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 1.2963, lng: 103.8502 },
    zoom: 15,
  });

  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById("directionsPanel"));
}

function findNearestPoliceStn() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      console.log(userLocation);

      createMarkerAtCurrentLocation(userLocation);
      map.setCenter(userLocation);
    //   clearMarkers();
      calculateNearestPoliceStn(userLocation);
    }, function() {
      alert('Geolocation service failed. Please enable location services in your browser.');
    });
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

function createMarkerAtCurrentLocation(userLocation) {
  var marker = new google.maps.Marker({
    position: userLocation,
    map: map,
    title: 'Your Current Location',
    animation: google.maps.Animation.DROP
  });
}

function calculateNearestPoliceStn(userLocation) {
  var policestns = [
    { name: 'AMK Police Division HQ', lat: 1.3849, lng: 103.8451 },
    { name: 'Hougang NPC', lat: 1.3743, lng: 103.8850 }, 
    { name: 'AMK South NPC', lat: 1.3699, lng: 103.8517 }, 
    { name: 'Punggol NPC', lat: 1.3978, lng: 103.9139 }, 
    { name: 'Serangoon NPC', lat: 1.3516, lng: 103.8704 }, 
    { name: 'Sengkang NPC', lat: 1.3927, lng: 103.8941 }, 
    { name: 'Bedok Division HQ', lat: 1.3327, lng: 103.9371 },
    { name: 'Changi NPC', lat: 1.3446, lng: 103.9548 },
    { name: 'Geylang NPC', lat: 1.3110, lng: 103.8861},
    { name: 'Marine Parade NPC', lat: 1.3063, lng: 103.9146},
    { name: 'Pasir Ris NPC', lat: 1.3684, lng: 103.9596},
    { name: 'Tampines NPC', lat: 1.3463, lng: 103.8387},
    { name: 'Bukit Panjang North NPC', lat: 1.3867, lng: 103.7715 },
    { name: 'Bukit Timah NPC', lat: 1.3228, lng: 103.8124 },
    { name: 'Central Police Division HQ', lat: 1.2786, lng: 103.8397},
    { name: 'Choa Chu Kang NPC', lat: 1.3951, lng: 103.7448},
    { name: 'Geylang NPC', lat: 1.3110, lng: 103.8861},
    { name: 'Jurong Police Division HQ', lat: 1.3511, lng: 103.7025},
    { name: 'Kampong Java NPC', lat: 1.3120, lng: 103.8465},
    { name: 'Orchard NPC', lat: 1.2990, lng: 103.8398},
    { name: 'Bukit Merah East NPC', lat: 1.2785, lng: 103.8394},
    { name: 'Marina Bay NPC', lat: 1.2746, lng: 103.8489},
    { name: 'Rochor NPC', lat: 1.3076, lng: 103.8543},
    { name: 'Clementi NPC', lat: 1.3220, lng: 103.7601},
    { name: 'Bukit Merah West NPC', lat: 1.2856, lng: 103.8233},
    { name: 'Jurong East NPC', lat: 1.3401, lng: 103.7372},
    { name: 'Queenstown NPC', lat: 1.2883, lng: 103.8029},
    { name: 'Nanyang NPC', lat: 1.3511, lng: 103.7025},
    { name: 'Bukit Batok NPC', lat: 1.3491, lng: 103.7585},
    { name: 'Bukit Panjang NPC', lat: 1.3868, lng: 103.7716},
    { name: 'Choa Chu Kang NPC', lat: 1.3948, lng: 103.7448},
    { name: 'Jurong West NPC', lat: 1.3493, lng: 103.7144},
    { name: 'Hong Kah North NPC', lat: 1.3600, lng: 103.7493},
    { name: ‘Woodlands West NPC', lat: 1.4334, lng: 103.7788},
    { name: ‘Sembawang NPC', lat: 1.4452, lng: 103.8196},
    { name: ‘Woodlands East NPC', lat: 1.4388, lng: 103.8023},
    { name: ‘Yishun North NPC', lat: 1.4293, lng: 103.8402},
    { name: ‘Yishun South NPC', lat: 1.4153, lng: 103.8348},
    { name: ‘Kampong Java NPC', lat: 1.3119, lng: 103.8464},
    { name: ‘Bishan NPC', lat: 1.3578, lng: 103.8477},
    { name: ‘Bukit Timah NPC', lat: 1.3225, lng: 103.8123},
    { name: ‘Toa Payoh NPC', lat: 1.3346, lng: 103.8505},
    { name: ‘River Valley NPC', lat: 1.2918, lng: 103.8265},
  ];

  var nearestPoliceStn;
  var nearestDistance = Number.MAX_VALUE;

  policestns.forEach(function(station) {
    var distance = haversineDistance(userLocation, { lat: station.lat, lng: station.lng });
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestPoliceStn = station;
    }
  });

  console.log(nearestPoliceStn);
  calculateAndDisplayRoute(userLocation, nearestPoliceStn);
}

function haversineDistance(point1, point2) {
  var lat1 = point1.lat;
  var lon1 = point1.lng;
  var lat2 = point2.lat;
  var lon2 = point2.lng;
  var R = 6371; 
  var dLat = (lat2 - lat1) * (Math.PI / 180);
  var dLon = (lon2 - lon1) * (Math.PI / 180);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = R * c;
  return distance;
}

function calculateAndDisplayRoute(origin, destination) {
  var request = {
    origin: origin,
    destination: destination,
    travelMode: 'DRIVING'
  };
  console.log(request);

  directionsService.route(request, function(result, status) {
    console.log(result);
    console.log(status);
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(result);
    } else {
      alert('Directions request failed due to ' + status);
    }
  });
}

function clearMarkers() {
  markers.forEach(function(marker) {
    marker.setMap(null);
  });
  markers = [];
  directionsDisplay.setMap(null);
}
