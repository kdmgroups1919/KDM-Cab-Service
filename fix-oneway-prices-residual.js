const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "oneway", "taxi-service");
const items = [
  {
    file: "chandigarh-to-amritsar.html",
    find: /<div class="route-stat">[\s\S]*?<div class="route-stat-lbl">Starts From<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>\s*/g,
    label: "route-starts-from stat",
  },
  {
    file: "chandigarh-to-shimla.html",
    find: /<div style="font-size: 22px; font-weight: 800; color: #ff6b35; margin-bottom: 8px;">[\s\S]*?<\/div>\s*/g,
    label: "inline price callout",
  },
];
for (const item of items) {
  const filePath = path.join(dir, item.file);
  let content = fs.readFileSync(filePath, "utf8");
  const updated = content.replace(item.find, "");
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log("Removed", item.label, "from", item.file);
  } else {
    console.log("No leftover", item.label, "found in", item.file);
  }
}
