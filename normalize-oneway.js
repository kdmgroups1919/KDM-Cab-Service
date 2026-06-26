const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "oneway", "taxi-service");
const refFile = path.join(dir, "chandigarh-to-amritsar.html");
const ref = fs.readFileSync(refFile, "utf8");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));

function titleize(s) {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

for (const file of files) {
  if (file === "chandigarh-to-amritsar.html") continue;
  const filePath = path.join(dir, file);
  const orig = fs.readFileSync(filePath, "utf8");
  // derive origin and dest from filename
  const name = file.replace(".html", "");
  const parts = name.split("-to-");
  const origin = titleize(parts[0]);
  const dest = titleize(parts[1] || parts[0]);
  let out = ref;
  // replace title
  out = out.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${origin} to ${dest} One Way Cab | KDM Cab Service</title>`,
  );
  // replace hero h1 spans
  out = out.replace(
    /<h1>[\s\S]*?<\/h1>/,
    `<h1>\n        <span class="g1">${origin}</span><br />to\n        <span class="g2">${dest}</span>\n      </h1>`,
  );
  // replace hero-eyebrow if original has one
  const heMatch = orig.match(/<div class="hero-eyebrow">([\s\S]*?)<\/div>/);
  if (heMatch) {
    out = out.replace(/<div class="hero-eyebrow">[\s\S]*?<\/div>/, heMatch[0]);
  } else {
    // ensure we at least show One Way
    out = out.replace(
      /<div class="hero-eyebrow">[\s\S]*?<\/div>/,
      `<div class="hero-eyebrow">One Way</div>`,
    );
  }
  // extract iframe src from original if present
  const iframeMatch = orig.match(/<iframe[^>]*src="([^"]+)"[^>]*>/);
  if (iframeMatch) {
    out = out.replace(
      /<iframe[\s\S]*?><\/iframe>/,
      `<iframe src="${iframeMatch[1]}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    );
  }
  // extract route-stat-val values from original
  const mapSection = orig.match(
    /<div class="map-route-info">([\s\S]*?)<\/div>\s*<\/div>/,
  );
  if (mapSection) {
    const vals = [
      ...mapSection[1].matchAll(
        /<div class="route-stat-val[^>]*>([\s\S]*?)<\/div>/g,
      ),
    ].map((m) => m[1].trim());
    if (vals.length) {
      // replace rv1, rv2, rv3 values if available
      out = out.replace(
        /(<div class="route-stat-val rv1">)[^<]*(<\/div>)/,
        `$1${vals[0] || ""}$2`,
      );
      if (vals[1])
        out = out.replace(
          /(<div class="route-stat-val rv2">)[^<]*(<\/div>)/,
          `$1${vals[1]}$2`,
        );
      if (vals[2])
        out = out.replace(
          /(<div class="route-stat-val rv3">)[^<]*(<\/div>)/,
          `$1${vals[2]}$2`,
        );
    }
  }
  // update booking links pickup/dropoff in the cars-list and elsewhere
  out = out.replace(
    /booking-page\.html\?car=([^&"']+)&?pickup=[^&"']*&?dropoff=[^&"']*/g,
    (m, car) => {
      const carDecoded = decodeURIComponent(car);
      return `booking-page.html?car=${encodeURIComponent(carDecoded)}&pickup=${encodeURIComponent(origin)}&dropoff=${encodeURIComponent(dest)}`;
    },
  );
  // also update any booking links that may have been using different casing or order
  out = out.replace(
    /booking-page\.html\?car=([^&"']+)&?dropoff=[^&"']*&?pickup=[^&"']*/g,
    (m, car) => {
      const carDecoded = decodeURIComponent(car);
      return `booking-page.html?car=${encodeURIComponent(carDecoded)}&pickup=${encodeURIComponent(origin)}&dropoff=${encodeURIComponent(dest)}`;
    },
  );
  // write back
  fs.writeFileSync(filePath, out, "utf8");
  console.log("Normalized", file);
}
console.log("All done.");
