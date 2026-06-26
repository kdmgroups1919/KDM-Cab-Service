(function () {
  const routes = {
    "Chandigarh-Ludhiana": {
      origin: [30.7333, 76.7794],
      dest: [30.9, 75.8573],
    },
    "Chandigarh-Amritsar": {
      origin: [30.7333, 76.7794],
      dest: [31.6333, 74.8667],
    },
    "Chandigarh-Dehradun": {
      origin: [30.7333, 76.7794],
      dest: [30.3165, 78.0322],
    },
    "Chandigarh-Dharamshala": {
      origin: [30.7333, 76.7794],
      dest: [32.2167, 76.3167],
    },
    "Chandigarh-Manali": {
      origin: [30.7333, 76.7794],
      dest: [32.2396, 77.1887],
    },
    "Chandigarh-Delhi": {
      origin: [30.7333, 76.7794],
      dest: [28.7041, 77.1025],
    },
    "Chandigarh-Shimla": {
      origin: [30.7333, 76.7794],
      dest: [31.1048, 77.1734],
    },
    "Chandigarh-Ambala": {
      origin: [30.7333, 76.7794],
      dest: [30.3782, 76.7767],
    },
    "Shimla-Delhi": { origin: [31.1048, 77.1734], dest: [28.7041, 77.1025] },
    "Delhi-Manali": { origin: [28.7041, 77.1025], dest: [32.2396, 77.1887] },
  };

  function formatDuration(seconds) {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hrs} hr${hrs > 1 ? "s" : ""}${rem ? ` ${rem} min` : ""}`;
  }

  function initRouteMap() {
    const originEl = document.querySelector(".route-hero .g1");
    const destEl = document.querySelector(".route-hero .g2");
    if (!originEl || !destEl) return;

    const originName = originEl.textContent.trim();
    const destName = destEl.textContent.trim();
    const routeKey = `${originName}-${destName}`;
    const coords = routes[routeKey];
    if (!coords) {
      console.warn("Route coordinates not found for", routeKey);
      return;
    }

    const mapContainer = document.getElementById("route-map");
    if (!mapContainer) return;

    const map = L.map(mapContainer, {
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    const originMarker = L.marker(coords.origin)
      .addTo(map)
      .bindPopup(originName)
      .openPopup();
    const destMarker = L.marker(coords.dest).addTo(map).bindPopup(destName);
    const markerGroup = L.featureGroup([originMarker, destMarker]);
    map.fitBounds(markerGroup.getBounds().pad(0.4));

    const routeInfo = document.querySelector(".map-route-info");
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coords.origin[1]},${coords.origin[0]};${coords.dest[1]},${coords.dest[0]}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!data.routes || !data.routes.length) {
          throw new Error("No route data");
        }
        const routeRes = data.routes[0];
        const routeLayer = L.geoJSON(routeRes.geometry, {
          style: { color: "#8b5cf6", weight: 5, opacity: 0.85 },
        }).addTo(map);
        map.fitBounds(routeLayer.getBounds().pad(0.15));

        if (routeInfo) {
          routeInfo.innerHTML = `
            <div class="route-stat">
              <div class="route-stat-val rv1">${(routeRes.distance / 1000).toFixed(1)} km</div>
              <div class="route-stat-lbl">Distance</div>
            </div>
            <div class="route-stat">
              <div class="route-stat-val rv2">${formatDuration(routeRes.duration)}</div>
              <div class="route-stat-lbl">Estimated Time</div>
            </div>
            <div class="route-stat">
              <div class="route-stat-val rv3">Route Shown</div>
              <div class="route-stat-lbl">Map View</div>
            </div>
          `;
        }
      })
      .catch((err) => {
        console.error("OSRM route error", err);
        if (routeInfo) {
          routeInfo.innerHTML = `
            <div class="route-stat">
              <div class="route-stat-val rv1">${originName}</div>
              <div class="route-stat-lbl">Origin</div>
            </div>
            <div class="route-stat">
              <div class="route-stat-val rv2">${destName}</div>
              <div class="route-stat-lbl">Destination</div>
            </div>
            <div class="route-stat">
              <div class="route-stat-val rv3">Unable to load route</div>
              <div class="route-stat-lbl">Try refresh</div>
            </div>
          `;
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRouteMap);
  } else {
    initRouteMap();
  }
})();
