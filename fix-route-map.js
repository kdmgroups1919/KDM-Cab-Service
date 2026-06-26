const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "oneway", "taxi-service");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
const leafletCss =
  '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>';
const leafletJs =
  '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>';
const routeMapScript = '<script src="../../route-map.js"></script>';

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, "utf8");

  if (!content.includes(leafletCss)) {
    content = content.replace(
      /(<link\s+rel="stylesheet"\s+href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.4\.0\/css\/all\.min\.css"[^>]*>)/,
      `$1\n    ${leafletCss}`,
    );
  }

  if (!content.includes(".map-card #route-map")) {
    content = content.replace(
      /(\.map-card iframe \{[\s\S]*?\})/,
      `$1\n      .map-card #route-map {\n        width: 100%;\n        height: 420px;\n        border: none;\n      }`,
    );
  }

  content = content.replace(
    /<iframe[^>]*><\/iframe>\s*<div class="map-route-info">[\s\S]*?<\/div>\s*<\/div>/,
    '<div id="route-map"></div>\n          <div class="map-route-info"></div>\n      </div>',
  );

  if (!content.includes(leafletJs)) {
    content = content.replace(
      /<\/body>/,
      `${leafletJs}\n    ${routeMapScript}\n  </body>`,
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched", file);
}
console.log("Done");
