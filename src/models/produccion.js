const { Schema, model } = require("mongoose");
const produccionSchema = new Schema({
  idUsuario: {type: String},
  nvacas: { type: Number },
  litros_de_leche_semanales: {
    semana1: Number,
    semana2: Number,
    semana3: Number,
    semana4: Number,
  },
  mes: {type: Number},
});

module.exports = model("producion", produccionSchema);
