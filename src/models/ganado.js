const { Schema, model } = require("mongoose");
const ganadoSchema = new Schema({
  idusuario: {type: String},
  nombre: { type: String, require: true, unique: true },
  raza: { type: String, require: true },
  fecha_de_nacimiento: { type: String, require: true },
  vacuna: { type: String, require: true },
  descripcion: { type: String },
  image: { public_id: String, secure_url: String },
  litros_de_leche_diarias: {
    dia1: Number,
    dia2: Number,
    dia3: Number,
    dia4: Number,
    dia5: Number,
    dia6: Number,
    dia7: Number,
  },
});

module.exports = model("vaca", ganadoSchema);
