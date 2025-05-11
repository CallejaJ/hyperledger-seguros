# Chaincode de Seguros para Hyperledger Fabric

Este proyecto implementa un smart contract para la gestión de pólizas de seguros en una red blockchain basada en Hyperledger Fabric.

## Funcionalidades

- Creación de pólizas de seguros
- Consulta de pólizas existentes
- Registro y procesamiento de reclamaciones
- Gestión del ciclo de vida de las pólizas

## Requisitos previos

- Hyperledger Fabric v2.5.0 o superior
- Node.js v12 o superior
- npm v6 o superior

## Instalación

1. Clonar este repositorio
2. Ejecutar `npm install` para instalar las dependencias

## Despliegue

Para desplegar este chaincode en una red de Hyperledger Fabric:

```bash
./network.sh deployCC -ccn seguros -ccp ../chaincode/seguros -ccl javascript
