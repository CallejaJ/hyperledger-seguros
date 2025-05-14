# Insurance Chaincode for Hyperledger Fabric

![Coverage](https://img.shields.io/badge/coverage-95.6%25-brightgreen)
![Tests](https://img.shields.io/badge/tests-21%20passing-brightgreen)
![License](https://img.shields.io/badge/license-Apache%202.0-blue)

![Coverage Report](https://github.com/CallejaJ/hyperledger-seguros/blob/main/docs/images/coverage-report.jpeg?raw=true)

This project implements a smart contract for the management of insurance policies on a Hyperledger Fabric blockchain network.

## Prerequisites

- Hyperledger Fabric v2.5.0 or higher
- Node.js v12 or higher
- npm v6 or higher
- Go 1.14.x or higher (for Fabric)
- Docker and Docker Compose

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/CallejaJ/hyperledger-seguros.git
   cd hyperledger-seguros
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Features

- Policy Management (Create, Read, Update, Cancel)
- Claims Registration and Processing
- Premium Calculation
- Private Data Handling
- Policy History Tracking

## Testing

This project includes comprehensive unit tests with 95.6% code coverage.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Generate HTML coverage report
npm run test:report
```

### Test Coverage

| Metric     | Coverage | Details |
| ---------- | -------- | ------- |
| Statements | 95.6%    | 87/91   |
| Branches   | 92.85%   | 39/42   |
| Functions  | 100%     | 12/12   |
| Lines      | 95.6%    | 87/91   |

For detailed testing documentation, see [TEST-README.md](./TEST-README.md).

## Deployment

To deploy this chaincode on a Hyperledger Fabric test network:

### 1. Navigate to the test network directory

```bash
cd ~/fabric-samples/test-network
```

### 2. Start the Fabric network

```bash
./network.sh down
./network.sh up
```

### 3. Create a channel

```bash
./network.sh createChannel -c mychannel
```

### 4. Deploy the chaincode

```bash
./network.sh deployCC -ccn seguros -ccp ../chaincode/seguros -ccl javascript
```

## Usage

### Creating a Policy

```bash
peer chaincode invoke -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  -C mychannel -n seguros \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
  -c '{"function":"crearPoliza","Args":["POL001", "John Doe", "Auto", "10000", "12"]}'
```

### Querying a Policy

```bash
peer chaincode query -C mychannel -n seguros -c '{"function":"consultarPoliza","Args":["POL001"]}'
```

### Registering a Claim

```bash
peer chaincode invoke -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  -C mychannel -n seguros \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
  -c '{"function":"registrarReclamacion","Args":["REC001", "POL001", "Collision damage", "500"]}'
```

## Project Structure

```
hyperledger-seguros/
├── index.js                    # Entry point for the chaincode
├── lib/
│   └── seguros-contract.js    # Main contract implementation
├── test/
│   └── seguros-contract.test.js # Unit tests
├── package.json               # Node.js project configuration
├── package-lock.json          # Dependency lock file
├── README.md                  # This file
└── TEST-README.md            # Detailed testing documentation
```

## Available Functions

- `crearPoliza(id, titular, tipo, valor, duracion)` - Create a new insurance policy
- `consultarPoliza(id)` - Query an existing policy
- `registrarReclamacion(reclamacionId, polizaId, descripcion, monto)` - Register a claim
- `procesarReclamacion(reclamacionId, polizaId, estado, comentario)` - Process a claim
- `renovarPoliza(id, nuevaDuracion)` - Renew a policy
- `cancelarPoliza(id, motivo)` - Cancel a policy
- `calcularPrima(tipo, valor, historialRiesgo)` - Calculate insurance premium
- `obtenerHistorialPoliza(id)` - Get policy history
- `guardarDatosPrivados(polizaId, datosPrivados)` - Store private data
- `obtenerDatosPrivados(polizaId)` - Retrieve private data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass with coverage > 95%
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the Apache License 2.0.

## Author

CallejaJ

## Acknowledgments

- Hyperledger Fabric Community
- Insurance domain experts who provided requirements
- Testing framework contributors (Mocha, Chai, Sinon)
