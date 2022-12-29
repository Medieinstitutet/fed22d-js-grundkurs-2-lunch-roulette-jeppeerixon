import './style/style.scss';

// ======= VARIABLAR ======// //======= VARIABLAR ======// //======= VARIABLAR ======// //======= VARIABLAR ======//

// Declare scope för eventuell import/export
declare global {
  interface Window {
    initMap: () => void;
  }
}

// Variabel för användarens nuvarande position
const userPosition = {
  lat: 0,
  lng: 0,
};

// variabel för sök radius
let chosenDistance: number;
const names: string[] = [];
const markers: google.maps.Marker[] = [];
let randomResturant: string = '';

// Variablar för användar input
const selectedDistance = document.querySelectorAll('input[name="distance"]') as NodeListOf<Element>;
const minRating = document.querySelector('#slideRating') as HTMLInputElement;
const outputRating = document.querySelector('#showRating') as HTMLElement;
const mapButton = document.querySelector('#showMap') as HTMLButtonElement;
const roulette = document.querySelector('#roulette') as HTMLElement;
const rouletteButton = document.querySelector('#showResult') as HTMLButtonElement;
const resultInfo = document.querySelector('#resultInfo') as HTMLElement;
const mapDiv = document.getElementById('map') as HTMLElement;

// Variblar för maps
declare let google: any;
let map: any;
let service: any;
let infowindow: any;

// ======= FUNKTIONER ======// //======= FUNKTIONER ======// //======= FUNKTIONER ======// //======= FUNKTIONER ======//

// tar värdet från valt avstånd
function getSelectedDistance(e: any) {
  if (e.currentTarget.checked) {
    chosenDistance = e.currentTarget.value;
  }
}

// skapar våra markers och inforutor
function createMarker(place: google.maps.places.PlaceResult) {
  names.push(place.name);
  let picture;

  picture = place.photos;

  if (picture !== undefined) {
    picture = picture[0].getUrl({ 'maxWidth': 100, 'maxHeight': 100 });
  }
  else {
    picture = 'no_resturant_picture.jpg';
  }

  const contentString: string = `<h4>${place.name}</h4>`
  + `<img height="100" src="${picture}" alt="${place.name}"> <br>`
  + `Betyg: ${place.rating}<br>`;

  if (!place.geometry || !place.geometry.location) {
    return;
  }

  const markerResult = new google.maps.Marker({
    map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP,
  });

  markers.push(markerResult);

  // här skapas logiken för inforutorna
  google.maps.event.addListener(markerResult, 'click', () => {
    infowindow = new google.maps.InfoWindow({
      content: contentString,
      ariaLabel: contentString,
    });
    infowindow.open({
      anchor: markerResult,
      map,
    });
  });

  // animation för vårt slumpade resultat
  if (place.name === randomResturant) {
    setTimeout(function() {markerResult.setAnimation(google.maps.Animation.BOUNCE)}, 1000);
  }
}

// Skriv ut resultaten på kartan
function handleResults(results: string | any[], status: any) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (let i = 0; i < results.length; i++) {
      // printa en kartnål för vårat slumpresultat
      if (results.length === 1) {
        createMarker(results[i]);
        map.setCenter(results[0].geometry!.location!);
      }
      // printar alla kartnålar
      if (results[i].rating >= minRating.value) {
        createMarker(results[i]);
      }
    }
  }
}

// Skapar kartan med våra värden
// zoom: högre värde mer zoom
// center: vart kartan ska fokusera
function initMap(): void {
  // nollställer variablar
  resultInfo.textContent = '';
  randomResturant = '';

  // skapande av kartan
  map = new google.maps.Map(
    document.getElementById('map') as HTMLElement,
    {
      zoom: 14,
      center: userPosition,
    },
  );

  // Marker for user position
  new google.maps.Marker({
    position: userPosition,
    map: map,
    icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  });

  // Leta närliggande restauranger inom radie utifrån användarens position
  const request = {
    location: userPosition,
    radius: chosenDistance,
    type: ['restaurant'],
  };

  // Gör en sökning… vänta på resultaten
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, handleResults);

  // Visar vår resultat ruta
  roulette.style.display = 'block';
  mapDiv.style.display = 'block';

  // scrollar till rätt plats
  mapDiv.scrollIntoView();
}

// Sets the map on all markers in the array.
function setMapOnAll(map: google.maps.Map | null) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers(): void {
  setMapOnAll(null);
}

// slumpar fram vår resturang
function rouletteLunch() {
  const randomNumber = Math.floor(Math.random() * names.length)
  randomResturant = names[randomNumber];
  resultInfo.scrollIntoView();
  hideMarkers();

  const request = {
    query: randomResturant,
    fields: ['name', 'rating', 'geometry', 'photos'],
  };

  // Gör en sökning… vänta på resultaten
  service = new google.maps.places.PlacesService(map);
  service.findPlaceFromQuery(request, handleResults);

  // lite delay för extra spänning
  resultInfo.textContent = '';
  setTimeout(function() {resultInfo.textContent = `Du ska äta på ${randomResturant}`}, 300);
}

// visar vår sliders värde
function updateRating() {
  const numrating = minRating.value;
  const resultRating = Number(numrating).toFixed(1);
  outputRating.textContent = resultRating;
}

// Position hittadn
function positionSuccess(position: any) {
  userPosition.lat = position.coords.latitude;
  userPosition.lng = position.coords.longitude;
}

// Hittade ingen position
function positionFailed() {
  resultInfo.textContent = 'Tillåt GPS för att använda hemsidan!';
}

// ===== PROGRAMLOGIK =====// //===== PROGRAMLOGIK =====// //===== PROGRAMLOGIK =====// //====== PROGRAMLOGIK =====//

// Koll om GPS-stöd finns OM stöd finns för GPS, hämta användarens position
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(positionSuccess, positionFailed);
}

// Eventlistner för val av distance
for (let i = 0; i <= selectedDistance!.length; i++) {
  selectedDistance[i]?.addEventListener('change', getSelectedDistance);
}

// skapar vår karta utifrån våra val
mapButton.addEventListener('click', initMap);

// visa vår slumpmässigt utvalda resturang
rouletteButton.addEventListener('click', rouletteLunch);

// updatera rating
minRating.addEventListener('change', updateRating);

// börja med denna sen https://developers.google.com/maps/documentation/javascript/examples/marker-remove
