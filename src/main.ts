import './style/style.scss';

// All kod härifrån och ner är bara ett exempel för att komma igång

// I denna utils-fil har vi lagrat funktioner som ofta används, t.ex. en "blanda array"-funktion
// import { shuffle } from './utils';

// I denna fil har vi lagrat vår "data", i detta exempel en ofullständig kortlek
// import exampleCardDeck from './exampleArray';

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

declare let google: any;

let map: any;
let service: any;
let infowindow: any;

// ======= FUNKTIONER ======// //======= FUNKTIONER ======// //======= FUNKTIONER ======// //======= FUNKTIONER ======//

// Skapar kartan med våra värden
// zoom: högre värde mer zoom
// center: vart kartan ska fokusera
function initMap(): void {
  map = new google.maps.Map(
    document.getElementById('map') as HTMLElement,
    {
      zoom: 14,
      center: userPosition,
    },
  );

  // Marker for user position
  const marker = new google.maps.Marker({
    position: userPosition,
    map: map,
  });

  // Leta närliggande restauranger inom radie utifrån användarens position
  const request = {
    location: userPosition,
    radius: '500',
    type: ['restaurant'],
  };

  // Gör en sökning… vänta på resultaten
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, handleResults);

  function createMarker(place: google.maps.places.PlaceResult) {
    const contentString: string = `<h4>${place.name}</h4>`
    + `Betyg: ${place.rating}<br>`
    + `Öppet nu: ${place.opening_hours.open_now}<br>`;

    if (!place.geometry || !place.geometry.location) {
      return;
    }

    const markerResult = new google.maps.Marker({
      map,
      position: place.geometry.location,
    });

    console.dir(place);

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
  }

  // Skriv ut resultaten på kartan
  function handleResults(results: string | any[], status: any) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) {
        // printa en kartnål
        if (results[i].rating >= 4) {
          createMarker(results[i]);
        }
      }
    }
  }
}

// Position hittad
function positionSuccess(position) {
  userPosition.lat = position.coords.latitude;
  userPosition.lng = position.coords.longitude;

  console.log(userPosition.lat, userPosition.lng);

  initMap();
}

// Hittade ingen position
function positionFailed() {
  console.error('Kunde inte hitta din aktuella position.');
}

// ===== PROGRAMLOGIK =====// //===== PROGRAMLOGIK =====// //===== PROGRAMLOGIK =====// //====== PROGRAMLOGIK =====//

// Koll om GPS-stöd finns OM stöd finns för GPS, hämta användarens position
if (navigator.geolocation) {
  const currentPosition = navigator.geolocation.getCurrentPosition(positionSuccess, positionFailed);
}
