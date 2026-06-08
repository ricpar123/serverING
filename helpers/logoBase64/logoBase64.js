const fs = require("fs");
const path = require("path");

console.log("=== CARGANDO helpers/logoBase64.js ===");
console.log("__dirname =", __dirname);

const rutaLogo = path.join(__dirname, "../../assets/logoIngroup.png");
console.log("rutaLogo:", rutaLogo);
console.log("exists =", fs.existsSync(rutaLogo));
const logoBase64 = `data:image/png;base64, ${fs.readFileSync(rutaLogo)
    .toString("base64")
}`;

module.exports = logoBase64;
