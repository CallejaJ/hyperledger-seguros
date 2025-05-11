"use strict";

const { Contract } = require("fabric-contract-api");

class SegurosContract extends Contract {
  // Inicializa el chaincode (opcional)
  async initLedger(ctx) {
    console.info("============= Iniciando Chaincode de Seguros =============");
    return;
  }

  // Crear una nueva póliza de seguro
  async crearPoliza(ctx, id, titular, tipo, valor, duracion) {
    console.info("============= Crear Póliza =============");

    const poliza = {
      ID: id,
      Titular: titular,
      Tipo: tipo,
      Valor: valor,
      Duracion: duracion,
      Estado: "ACTIVA",
      FechaCreacion: new Date().toISOString(),
      Reclamaciones: [],
    };

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(poliza)));
    return JSON.stringify(poliza);
  }

  // Consultar una póliza existente
  async consultarPoliza(ctx, id) {
    const polizaAsBytes = await ctx.stub.getState(id);
    if (!polizaAsBytes || polizaAsBytes.length === 0) {
      throw new Error(`La póliza ${id} no existe`);
    }
    return polizaAsBytes.toString();
  }

  // Registrar una reclamación para una póliza
  async registrarReclamacion(ctx, reclamacionId, polizaId, descripcion, monto) {
    // Obtener la póliza
    const polizaAsBytes = await ctx.stub.getState(polizaId);
    if (!polizaAsBytes || polizaAsBytes.length === 0) {
      throw new Error(`La póliza ${polizaId} no existe`);
    }

    const poliza = JSON.parse(polizaAsBytes.toString());

    // Crear reclamación
    const reclamacion = {
      ID: reclamacionId,
      Descripcion: descripcion,
      Monto: monto,
      Estado: "PENDIENTE",
      FechaRegistro: new Date().toISOString(),
    };

    // Añadir reclamación a la póliza
    poliza.Reclamaciones.push(reclamacion);

    // Actualizar el estado
    await ctx.stub.putState(polizaId, Buffer.from(JSON.stringify(poliza)));

    return JSON.stringify(reclamacion);
  }

  // Procesar una reclamación
  async procesarReclamacion(ctx, reclamacionId, polizaId, estado, comentario) {
    // Obtener la póliza
    const polizaAsBytes = await ctx.stub.getState(polizaId);
    if (!polizaAsBytes || polizaAsBytes.length === 0) {
      throw new Error(`La póliza ${polizaId} no existe`);
    }

    const poliza = JSON.parse(polizaAsBytes.toString());

    // Buscar y actualizar la reclamación
    const reclamacionIndex = poliza.Reclamaciones.findIndex(
      (r) => r.ID === reclamacionId
    );
    if (reclamacionIndex === -1) {
      throw new Error(
        `La reclamación ${reclamacionId} no existe para la póliza ${polizaId}`
      );
    }

    poliza.Reclamaciones[reclamacionIndex].Estado = estado;
    poliza.Reclamaciones[reclamacionIndex].Comentario = comentario;
    poliza.Reclamaciones[reclamacionIndex].FechaProcesamiento =
      new Date().toISOString();

    // Actualizar el estado
    await ctx.stub.putState(polizaId, Buffer.from(JSON.stringify(poliza)));

    return JSON.stringify(poliza.Reclamaciones[reclamacionIndex]);
  }

  // Obtener historial de una póliza
  async obtenerHistorialPoliza(ctx, id) {
    const iterator = await ctx.stub.getHistoryForKey(id);
    const results = [];

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        jsonRes.TxId = res.value.tx_id;
        jsonRes.Timestamp = res.value.timestamp;
        jsonRes.IsDelete = res.value.is_delete.toString();
        try {
          jsonRes.Value = JSON.parse(res.value.value.toString("utf8"));
        } catch (err) {
          jsonRes.Value = res.value.value.toString("utf8");
        }
        results.push(jsonRes);
      }

      if (res.done) {
        await iterator.close();
        return JSON.stringify(results);
      }
    }
  }

  // Renovar una póliza
  async renovarPoliza(ctx, id, nuevaDuracion) {
    const polizaAsBytes = await ctx.stub.getState(id);
    if (!polizaAsBytes || polizaAsBytes.length === 0) {
      throw new Error(`La póliza ${id} no existe`);
    }

    const poliza = JSON.parse(polizaAsBytes.toString());
    poliza.Duracion = nuevaDuracion;
    poliza.FechaRenovacion = new Date().toISOString();

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(poliza)));
    return JSON.stringify(poliza);
  }

  // Cancelar una póliza
  async cancelarPoliza(ctx, id, motivo) {
    const polizaAsBytes = await ctx.stub.getState(id);
    if (!polizaAsBytes || polizaAsBytes.length === 0) {
      throw new Error(`La póliza ${id} no existe`);
    }

    const poliza = JSON.parse(polizaAsBytes.toString());
    poliza.Estado = "CANCELADA";
    poliza.MotivoCancelacion = motivo;
    poliza.FechaCancelacion = new Date().toISOString();

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(poliza)));
    return JSON.stringify(poliza);
  }

  // Calcular prima de seguro
  async calcularPrima(ctx, tipo, valor, historialRiesgo) {
    // Lógica de cálculo de prima basada en parámetros
    let factorRiesgo = 1.0;

    switch (historialRiesgo) {
      case "BAJO":
        factorRiesgo = 0.8;
        break;
      case "MEDIO":
        factorRiesgo = 1.0;
        break;
      case "ALTO":
        factorRiesgo = 1.5;
        break;
      default:
        factorRiesgo = 1.0;
    }

    const valorBase = parseFloat(valor);
    let prima = 0;

    if (tipo === "Auto") {
      prima = valorBase * 0.05 * factorRiesgo;
    } else if (tipo === "Hogar") {
      prima = valorBase * 0.02 * factorRiesgo;
    } else if (tipo === "Vida") {
      prima = valorBase * 0.01 * factorRiesgo;
    } else {
      prima = valorBase * 0.03 * factorRiesgo;
    }

    return JSON.stringify({ prima: prima.toFixed(2) });
  }

  async guardarDatosPrivados(ctx, polizaId, datosPrivados) {
    await ctx.stub.putPrivateData(
      "datosPrivadosCliente",
      polizaId,
      Buffer.from(datosPrivados)
    );
    return "Datos privados guardados";
  }

  async obtenerDatosPrivados(ctx, polizaId) {
    const datos = await ctx.stub.getPrivateData(
      "datosPrivadosCliente",
      polizaId
    );
    if (!datos || datos.length === 0) {
      throw new Error(`No existen datos privados para la póliza ${polizaId}`);
    }
    return datos.toString();
  }
}

module.exports = SegurosContract;
