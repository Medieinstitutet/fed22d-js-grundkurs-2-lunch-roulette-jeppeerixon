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

// Variablar för användar input
const selectedDistance = document.querySelectorAll('input[name="distance"]') as NodeListOf<Element>;
const minRating = document.querySelector('#slideRating') as HTMLInputElement;
const mapButton = document.querySelector('#showMap') as HTMLButtonElement;
const roulette = document.querySelector('#roulette') as HTMLElement;
const rouletteButton = document.querySelector('#showResult') as HTMLButtonElement;
const resultInfo = document.querySelector('#resultInfo') as HTMLElement;

// Variblar för maps
declare let google: any;
let map: any;
let service: any;
let infowindow: any;

// ======= FUNKTIONER ======// //======= FUNKTIONER ======// //======= FUNKTIONER ======// //======= FUNKTIONER ======//

function getSelectedDistance(e: any) {
  if (e.currentTarget.checked) {
    console.log(`You selected ${e.currentTarget.value}`);
    chosenDistance = e.currentTarget.value;
  }
}

function createMarker(place: google.maps.places.PlaceResult) {
  names.push(place.name);

  const contentString: string = `<h4>${place.name}</h4>`
  + `Betyg: ${place.rating}<br>`
  + `Öppet nu: byt till openNow <br>`;

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
  });

  // Leta närliggande restauranger inom radie utifrån användarens position
  const request = {
    location: userPosition,
    radius: chosenDistance,
    type: ['restaurant'],
  };
  console.log(chosenDistance);
  console.log(minRating.value);

  // Gör en sökning… vänta på resultaten
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, handleResults);

  // Visar vår resultat ruta
  roulette.style.display = 'block';
}

function rouletteLunch() {
  const randomResturant = names[Math.floor(Math.random() * names.length)];
  resultInfo.textContent = `Du ska äta på ${randomResturant}`;
}

// Position hittadn
function positionSuccess(position: any) {
  userPosition.lat = position.coords.latitude;
  userPosition.lng = position.coords.longitude;

  console.log(userPosition.lat, userPosition.lng);
}

// Hittade ingen position
function positionFailed() {
  console.error('Kunde inte hitta din aktuella position.');
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

// visa vår utvalda resturang
rouletteButton.addEventListener('click', rouletteLunch);
