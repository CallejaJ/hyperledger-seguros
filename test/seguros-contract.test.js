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

  describe("initLedger", () => {
    it("debería inicializar el chaincode sin errores", async () => {
      await contract.initLedger(ctx);
      // El método solo hace console.info, no necesita validaciones
      expect(true).to.be.true;
    });
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
      expect(stubStub.putState).to.have.been.calledOnce;
    });
  });

  describe("consultarPoliza", () => {
    it("debería retornar una póliza existente", async () => {
      // Datos de la póliza existente
      const polizaExistente = {
        ID: "POL001",
        Titular: "Juan Pérez",
        Tipo: "Auto",
        Valor: "10000",
        Duracion: "12",
        Estado: "ACTIVA",
        FechaCreacion: "2023-01-01T00:00:00.000Z",
        Reclamaciones: [],
      };

      // Configurar el stub para retornar la póliza
      stubStub.getState
        .withArgs("POL001")
        .resolves(Buffer.from(JSON.stringify(polizaExistente)));

      // Ejecutar el método
      const result = await contract.consultarPoliza(ctx, "POL001");

      // Verificar el resultado
      expect(JSON.parse(result)).to.deep.equal(polizaExistente);
      expect(stubStub.getState).to.have.been.calledOnceWithExactly("POL001");
    });

    it("debería lanzar un error si la póliza no existe", async () => {
      // Configurar el stub para retornar null
      stubStub.getState.withArgs("POL999").resolves(null);

      // Verificar que el método lanza un error usando try/catch
      try {
        await contract.consultarPoliza(ctx, "POL999");
        expect.fail("Se esperaba un error");
      } catch (error) {
        expect(error.message).to.equal("La póliza POL999 no existe");
      }
    });
  });

  describe("registrarReclamacion", () => {
    it("debería registrar una nueva reclamación en una póliza existente", async () => {
      // Datos de la póliza existente
      const polizaExistente = {
        ID: "POL001",
        Titular: "Juan Pérez",
        Tipo: "Auto",
        Valor: "10000",
        Duracion: "12",
        Estado: "ACTIVA",
        FechaCreacion: "2023-01-01T00:00:00.000Z",
        Reclamaciones: [],
      };

      // Configurar el stub
      stubStub.getState
        .withArgs("POL001")
        .resolves(Buffer.from(JSON.stringify(polizaExistente)));
      stubStub.putState.resolves();

      // Parámetros de la reclamación
      const reclamacionId = "REC001";
      const polizaId = "POL001";
      const descripcion = "Daño por colisión";
      const monto = "500";

      // Ejecutar el método
      const result = await contract.registrarReclamacion(
        ctx,
        reclamacionId,
        polizaId,
        descripcion,
        monto
      );

      // Verificar el resultado
      const reclamacion = JSON.parse(result);
      expect(reclamacion).to.have.property("ID").that.equals(reclamacionId);
      expect(reclamacion)
        .to.have.property("Descripcion")
        .that.equals(descripcion);
      expect(reclamacion).to.have.property("Monto").that.equals(monto);
      expect(reclamacion).to.have.property("Estado").that.equals("PENDIENTE");
      expect(reclamacion).to.have.property("FechaRegistro");

      // Verificar que putState fue llamado
      expect(stubStub.putState).to.have.been.calledOnce;
    });

    it("debería lanzar un error si la póliza no existe", async () => {
      // Configurar el stub para retornar null
      stubStub.getState.withArgs("POL999").resolves(null);

      // Verificar que el método lanza un error
      try {
        await contract.registrarReclamacion(
          ctx,
          "REC001",
          "POL999",
          "Descripción",
          "500"
        );
        expect.fail("Se esperaba un error");
      } catch (error) {
        expect(error.message).to.equal("La póliza POL999 no existe");
      }
    });
  });

  describe("procesarReclamacion", () => {
    it("debería procesar una reclamación existente", async () => {
      // Datos de la póliza con reclamación
      const polizaConReclamacion = {
        ID: "POL001",
        Titular: "Juan Pérez",
        Tipo: "Auto",
        Valor: "10000",
        Duracion: "12",
        Estado: "ACTIVA",
        FechaCreacion: "2023-01-01T00:00:00.000Z",
        Reclamaciones: [
          {
            ID: "REC001",
            Descripcion: "Daño por colisión",
            Monto: "500",
            Estado: "PENDIENTE",
            FechaRegistro: "2023-02-01T00:00:00.000Z",
          },
        ],
      };

      // Configurar el stub
      stubStub.getState
        .withArgs("POL001")
        .resolves(Buffer.from(JSON.stringify(polizaConReclamacion)));
      stubStub.putState.resolves();

      // Ejecutar el método
      const result = await contract.procesarReclamacion(
        ctx,
        "REC001",
        "POL001",
        "APROBADA",
        "Reclamación válida"
      );

      // Verificar el resultado
      const reclamacionProcesada = JSON.parse(result);
      expect(reclamacionProcesada)
        .to.have.property("Estado")
        .that.equals("APROBADA");
      expect(reclamacionProcesada)
        .to.have.property("Comentario")
        .that.equals("Reclamación válida");
      expect(reclamacionProcesada).to.have.property("FechaProcesamiento");
    });

    it("debería lanzar un error si la reclamación no existe", async () => {
      // Póliza sin la reclamación buscada
      const poliza = {
        ID: "POL001",
        Titular: "Juan Pérez",
        Tipo: "Auto",
        Valor: "10000",
        Duracion: "12",
        Estado: "ACTIVA",
        FechaCreacion: "2023-01-01T00:00:00.000Z",
        Reclamaciones: [],
      };

      stubStub.getState
        .withArgs("POL001")
        .resolves(Buffer.from(JSON.stringify(poliza)));

      try {
        await contract.procesarReclamacion(
          ctx,
          "REC999",
          "POL001",
          "APROBADA",
          "Comentario"
        );
        expect.fail("Se esperaba un error");
      } catch (error) {
        expect(error.message).to.equal(
          "La reclamación REC999 no existe para la póliza POL001"
        );
      }
    });
  });

  describe("obtenerHistorialPoliza", () => {
    it("debería retornar el historial de una póliza", async () => {
      // Crear un stub para el iterador del historial
      const mockIterator = {
        next: sinon.stub(),
        close: sinon.stub().resolves(),
      };

      // Configurar las respuestas del iterador
      mockIterator.next.onFirstCall().resolves({
        value: {
          tx_id: "TX001",
          timestamp: "2023-01-01T00:00:00.000Z",
          is_delete: false,
          value: Buffer.from(JSON.stringify({ Estado: "ACTIVA" })),
        },
        done: false,
      });

      mockIterator.next.onSecondCall().resolves({
        done: true,
      });

      stubStub.getHistoryForKey.withArgs("POL001").resolves(mockIterator);

      // Ejecutar el método
      const result = await contract.obtenerHistorialPoliza(ctx, "POL001");

      // Verificar el resultado
      const historial = JSON.parse(result);
      expect(historial).to.be.an("array");
      expect(historial).to.have.lengthOf(1);
      expect(historial[0]).to.have.property("TxId").that.equals("TX001");
      expect(historial[0]).to.have.property("Timestamp");
      expect(historial[0]).to.have.property("IsDelete").that.equals("false");
      expect(historial[0]).to.have.property("Value");
    });
  });

  describe("renovarPoliza", () => {
    it("debería renovar una póliza existente", async () => {
      // Póliza existente
      const polizaExistente = {
        ID: "POL001",
        Titular: "Juan Pérez",
        Tipo: "Auto",
        Valor: "10000",
        Duracion: "12",
        Estado: "ACTIVA",
        FechaCreacion: "2023-01-01T00:00:00.000Z",
        Reclamaciones: [],
      };

      // Configurar el stub
      stubStub.getState
        .withArgs("POL001")
        .resolves(Buffer.from(JSON.stringify(polizaExistente)));
      stubStub.putState.resolves();

      // Ejecutar el método
      const result = await contract.renovarPoliza(ctx, "POL001", "24");

      // Verificar el resultado
      const polizaRenovada = JSON.parse(result);
      expect(polizaRenovada).to.have.property("Duracion").that.equals("24");
      expect(polizaRenovada).to.have.property("FechaRenovacion");
    });

    it("debería lanzar un error si la póliza no existe", async () => {
      stubStub.getState.withArgs("POL999").resolves(null);

      try {
        await contract.renovarPoliza(ctx, "POL999", "24");
        expect.fail("Se esperaba un error");
      } catch (error) {
        expect(error.message).to.equal("La póliza POL999 no existe");
      }
    });
  });

  describe("cancelarPoliza", () => {
    it("debería cancelar una póliza existente", async () => {
      // Póliza existente
      const polizaExistente = {
        ID: "POL001",
        Titular: "Juan Pérez",
        Tipo: "Auto",
        Valor: "10000",
        Duracion: "12",
        Estado: "ACTIVA",
        FechaCreacion: "2023-01-01T00:00:00.000Z",
        Reclamaciones: [],
      };

      // Configurar el stub
      stubStub.getState
        .withArgs("POL001")
        .resolves(Buffer.from(JSON.stringify(polizaExistente)));
      stubStub.putState.resolves();

      // Ejecutar el método
      const result = await contract.cancelarPoliza(
        ctx,
        "POL001",
        "Solicitud del cliente"
      );

      // Verificar el resultado
      const polizaCancelada = JSON.parse(result);
      expect(polizaCancelada)
        .to.have.property("Estado")
        .that.equals("CANCELADA");
      expect(polizaCancelada)
        .to.have.property("MotivoCancelacion")
        .that.equals("Solicitud del cliente");
      expect(polizaCancelada).to.have.property("FechaCancelacion");
    });
  });

  describe("calcularPrima", () => {
    it("debería calcular prima para seguro de auto con riesgo bajo", async () => {
      const result = await contract.calcularPrima(ctx, "Auto", "20000", "BAJO");

      const prima = JSON.parse(result);
      expect(prima).to.have.property("prima").that.equals("800.00");
    });

    it("debería calcular prima para seguro de hogar con riesgo medio", async () => {
      const result = await contract.calcularPrima(
        ctx,
        "Hogar",
        "100000",
        "MEDIO"
      );

      const prima = JSON.parse(result);
      expect(prima).to.have.property("prima").that.equals("2000.00");
    });

    it("debería calcular prima para seguro de vida con riesgo alto", async () => {
      const result = await contract.calcularPrima(ctx, "Vida", "50000", "ALTO");

      const prima = JSON.parse(result);
      expect(prima).to.have.property("prima").that.equals("750.00");
    });

    it("debería calcular prima para tipo desconocido con riesgo medio", async () => {
      const result = await contract.calcularPrima(
        ctx,
        "Desconocido",
        "10000",
        "MEDIO"
      );

      const prima = JSON.parse(result);
      expect(prima).to.have.property("prima").that.equals("300.00");
    });
  });

  describe("Datos Privados", () => {
    describe("guardarDatosPrivados", () => {
      it("debería guardar datos privados correctamente", async () => {
        stubStub.putPrivateData.resolves();

        const result = await contract.guardarDatosPrivados(
          ctx,
          "POL001",
          JSON.stringify({ numeroTarjeta: "1234-5678-9012-3456" })
        );

        expect(result).to.equal("Datos privados guardados");
        expect(stubStub.putPrivateData).to.have.been.calledOnceWith(
          "datosPrivadosCliente",
          "POL001",
          Buffer.from(JSON.stringify({ numeroTarjeta: "1234-5678-9012-3456" }))
        );
      });
    });

    describe("obtenerDatosPrivados", () => {
      it("debería obtener datos privados existentes", async () => {
        const datosPrivados = { numeroTarjeta: "1234-5678-9012-3456" };

        stubStub.getPrivateData
          .withArgs("datosPrivadosCliente", "POL001")
          .resolves(Buffer.from(JSON.stringify(datosPrivados)));

        const result = await contract.obtenerDatosPrivados(ctx, "POL001");

        expect(result).to.equal(JSON.stringify(datosPrivados));
      });

      it("debería lanzar un error si no existen datos privados", async () => {
        stubStub.getPrivateData
          .withArgs("datosPrivadosCliente", "POL999")
          .resolves(null);

        try {
          await contract.obtenerDatosPrivados(ctx, "POL999");
          expect.fail("Se esperaba un error");
        } catch (error) {
          expect(error.message).to.equal(
            "No existen datos privados para la póliza POL999"
          );
        }
      });
    });
  });

  describe("Casos de Error", () => {
    it("debería manejar errores en putState", async () => {
      // Configurar el stub para lanzar un error
      stubStub.putState.rejects(new Error("Error de escritura"));

      try {
        await contract.crearPoliza(ctx, "POL001", "Juan", "Auto", "1000", "12");
        expect.fail("Se esperaba un error");
      } catch (error) {
        expect(error.message).to.equal("Error de escritura");
      }
    });

    it("debería manejar errores en getState", async () => {
      // Configurar el stub para lanzar un error
      stubStub.getState.rejects(new Error("Error de lectura"));

      try {
        await contract.consultarPoliza(ctx, "POL001");
        expect.fail("Se esperaba un error");
      } catch (error) {
        expect(error.message).to.equal("Error de lectura");
      }
    });
  });
});
