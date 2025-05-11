//test/seguros-contract.test.js
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const expect = chai.expect;

const { Context } = require("fabric-contract-api");
const { ChaincodeStub } = require("fabric-shim");

const SegurosContract = require("../lib/seguros-contract");

chai.use(sinonChai);

describe("SegurosContract", () => {
  let contract;
  let ctx;
  let stubStub;

  beforeEach(() => {
    // Crear una instancia limpia del contrato para cada prueba
    contract = new SegurosContract();

    // Crear un stub para el contexto de Fabric
    stubStub = sinon.createStubInstance(ChaincodeStub);
    ctx = {
      stub: stubStub,
    };
  });

  describe("crearPoliza", () => {
    it("debería crear una nueva póliza con los parámetros proporcionados", async () => {
      // Configurar el comportamiento del stub
      stubStub.putState.resolves(Buffer.from("OK"));

      // Parámetros de prueba
      const id = "POL001";
      const titular = "Juan Pérez";
      const tipo = "Auto";
      const valor = "10000";
      const duracion = "12";

      // Ejecutar el método
      const result = await contract.crearPoliza(
        ctx,
        id,
        titular,
        tipo,
        valor,
        duracion
      );

      // Verificar que el resultado sea el esperado
      const resultJson = JSON.parse(result);
      expect(resultJson).to.have.property("ID").that.equals(id);
      expect(resultJson).to.have.property("Titular").that.equals(titular);
      expect(resultJson).to.have.property("Tipo").that.equals(tipo);
      expect(resultJson).to.have.property("Valor").that.equals(valor);
      expect(resultJson).to.have.property("Duracion").that.equals(duracion);
      expect(resultJson).to.have.property("Estado").that.equals("ACTIVA");
      expect(resultJson).to.have.property("FechaCreacion");
      expect(resultJson).to.have.property("Reclamaciones").that.is.an("array")
        .that.is.empty;

      // Verificar que putState fue llamado con los argumentos correctos
      const expectedBuffer = Buffer.from(
        JSON.stringify({
          ID: id,
          Titular: titular,
          Tipo: tipo,
          Valor: valor,
          Duracion: duracion,
          Estado: "ACTIVA",
          FechaCreacion: resultJson.FechaCreacion, // Usamos el timestamp generado
          Reclamaciones: [],
        })
      );

      expect(stubStub.putState).to.have.been.calledOnceWithExactly(
        id,
        sinon.match((value) => {
          // Compara los JSON parseados para ignorar diferencias en espacios en blanco
          const actualValue = JSON.parse(value.toString());
          const expectedValue = JSON.parse(expectedBuffer.toString());
          return JSON.stringify(actualValue) === JSON.stringify(expectedValue);
        })
      );
    });
  });
});
