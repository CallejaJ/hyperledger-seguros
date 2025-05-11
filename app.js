// Ejemplo de app.js para una aplicación cliente

const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
app.use(express.json());

// Configuración de conexión
const connectionProfilePath = path.resolve(__dirname, "connection.json");
const connectionProfile = JSON.parse(
  fs.readFileSync(connectionProfilePath, "utf8")
);

// Endpoint para crear póliza
app.post("/api/polizas", async (req, res) => {
  try {
    const { id, titular, tipo, valor, duracion } = req.body;

    // Conectar a la red
    const wallet = await Wallets.newFileSystemWallet("./wallet");
    const gateway = new Gateway();
    await gateway.connect(connectionProfile, {
      wallet,
      identity: "user1",
      discovery: { enabled: true, asLocalhost: true },
    });

    // Obtener red y contrato
    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("seguros");

    // Invocar el contrato
    const result = await contract.submitTransaction(
      "crearPoliza",
      id,
      titular,
      tipo,
      valor,
      duracion
    );

    // Desconectar
    gateway.disconnect();

    // Responder
    res.status(201).json(JSON.parse(result.toString()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
