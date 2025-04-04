import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import os from "os";
import fs from "fs";

// Función para obtener la IP local automáticamente
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net?.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

const localIP = getLocalIP();
// Leer el contenido actual del .env
const envContent = fs.existsSync(".env") ? fs.readFileSync(".env", "utf-8") : "";
// Actualizar o añadir la variable VITE_HOST_IP sin borrar otras variables
const envLines = envContent.split("\n").filter((line) => !line.startsWith("VITE_HOST_IP="));
envLines.push(`VITE_HOST_IP=${localIP}`);
fs.writeFileSync(".env", envLines.join("\n") + "\n");

const host = process.env.VITE_HOST_IP || "localhost";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: "client",
  server: {
    // host,
    // port: 5173,
    // strictPort: true,
    proxy: { "/api": `http://${host}:5000` },
  },
});
