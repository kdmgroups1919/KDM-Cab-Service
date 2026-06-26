const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "oneway", "taxi-service");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, "utf8");
  let updated = content;
  updated = updated.replace(/([?&])price=\d+\b/g, "");
  updated = updated.replace(/\?&/g, "?");
  updated = updated.replace(/\?"/g, '"');
  updated = updated.replace(/<div class="hero-price">[\s\S]*?<\/div>\s*/g, "");
  updated = updated.replace(
    /<div class="hero-price-badge">[\s\S]*?<\/div>\s*/g,
    "",
  );
  updated = updated.replace(/<p[^>]*>\s*Start From ₹[^<]*<\/p>\s*/g, "");
  updated = updated.replace(/<div class="price-row">[\s\S]*?<\/div>\s*/g, "");
  updated = updated.replace(
    /<div class="price-display">[\s\S]*?<\/div>\s*/g,
    "",
  );
  updated = updated.replace(/<div class="car-pricing">[\s\S]*?<\/div>\s*/g, "");
  updated = updated.replace(
    /<div class="map-stat">[\s\S]*?<div class="map-stat-lbl">Starts From[\s\S]*?<\/div>\s*<\/div>\s*/g,
    "",
  );
  updated = updated.replace(
    /<div class="price">\s*Start From ₹[^<]*<\/div>\s*/g,
    "",
  );
  updated = updated.replace(/^\s*\n/gm, "");
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log("Updated", file);
  } else {
    console.log("No changes in", file);
  }
}
