const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "oneway", "taxi-service");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));

function titleize(s) {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

for (const file of files) {
  const filePath = path.join(dir, file);
  let html = fs.readFileSync(filePath, "utf8");
  const name = file.replace(".html", "");
  const parts = name.split("-to-");
  let origin = titleize(parts[0] || "");
  let dest = titleize(parts[1] || "");
  if (!dest) {
    // handle delhi-to-manali or shimla-to-delhi where parts may be like delhi-to-manali
    const alt = name.split("-to-");
    origin = titleize(alt[0] || "");
    dest = titleize(alt[1] || "");
  }
  if (!origin || !dest) continue;

  // Update H2 and leading paragraph in info-section
  html = html.replace(
    /<section class="info-section">[\s\S]*?<div class="info-container reveal">[\s\S]*?<h2>[\s\S]*?<\/h2>[\s\S]*?<p>[\s\S]*?<\/p>/,
    `<section class="info-section">\n      <div class="info-container reveal">\n        <div class="section-eyebrow ey-violet" style="margin-bottom: 20px">\n          Route Details\n        </div>\n        <h2>${origin} to ${dest} Cab Service</h2>\n        <p>\n          KDM Cab Service offers reliable and comfortable one-way cab service from ${origin} to ${dest}. Our experienced drivers and well-maintained vehicles ensure a smooth journey. For exact distance and travel time, please use the map below or contact us.\n        </p>`,
  );

  // Update Map header paragraph and iframe to a generic embed directions
  html = html.replace(
    /<div class="map-header">[\s\S]*?<\/div>\s*<iframe[\s\S]*?<\/iframe>/,
    () => {
      const originEnc = encodeURIComponent(origin);
      const destEnc = encodeURIComponent(dest);
      const iframe = `  <div class="map-header">\n            <h3>Route Map</h3>\n            <p>${origin} → ${dest} route</p>\n          </div>\n          <iframe src="https://www.google.com/maps/dir/${originEnc}/${destEnc}?output=embed" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
      return iframe;
    },
  );

  // Replace any lingering 'Chandigarh to Amritsar' info paragraphs inside page (conservative replace)
  html = html.replace(/Chandigarh to Amritsar/g, `${origin} to ${dest}`);

  fs.writeFileSync(filePath, html, "utf8");
  console.log("Fixed info/map for", file);
}
console.log("Done.");
