# Insurance Chaincode for Hyperledger Fabric

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

# Hyperledger Fabric Chaincode Deployment Guide

## Install dependencies

```bash
npm install
```

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

## Project Structure

* `index.js` - Entry point for the chaincode
* `lib/` - Directory containing the smart contract classes

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
