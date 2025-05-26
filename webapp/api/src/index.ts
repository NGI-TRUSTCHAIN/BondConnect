import express from "express";
import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import router from "./router";
import dotenv from "dotenv";
import path from "path";
import os from "os";
import { setupSwagger } from "./swagger";

// Import everything to use ethers library
import { ethers } from "ethers";

dotenv.config();

const host = process.env.VITE_HOST_IP || "0.0.0.0";

const app = express();

// Setup Swagger documentation
setupSwagger(app);

const corsOptions = {
  origin: `http://${host}:5173`, // Cambia esto por el dominio de tu frontend en producción
  methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
  allowedHeaders: ['Content-Type','Authorization'], // Encabezados permitidos
};
app.use(cors(corsOptions));
app.use(compression());
app.use(bodyParser.json());
app.use("/api", router());

// Servir los archivos estáticos de React
app.use(express.static(path.resolve(__dirname, "../../client/dist/")));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, "../../client/dist/index.html"));
});
// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname, '../../client/dist/'));
// });

// Conectar con MongoDB
const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  console.error("Error: La variable de entorno MONGO_URL no está definida.");
  process.exit(1); // Salir del proceso si no hay URL
}

mongoose.Promise = Promise;
mongoose
  .connect(mongoUrl)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((error: Error) => console.error("Error en la conexión a MongoDB:", error));

const port = Number(process.env.PORT) || 8080;

app.listen(port, host, () => {
  console.log(`Backend en http://${host}:${port}`);
});

// prueba e instalacion de ethers
