const vacaCtrl = {};
const { fileUploadcow, deleteImage } = require("../utils/cloudinary");
const fs = require("fs-extra");
const Vaca = require("../models/ganado");
const Produccion = require("../models/produccion");

global.registroDia7 = null;

vacaCtrl.registrarvaca = (req, res) => {
  res.render("principal/registrarvaca");
};

const crearNuevaProduccion = () => {
  return {
    litros_de_leche_semanales: {
      semana1: 0,
      semana2: 0,
      semana3: 0,
      semana4: 0,
    },
    mes: 0,
  };
};

const encontrarOCrearProduccion = async (idUsuario) => {
  let produccion = await Produccion.findOne({ idUsuario }).lean();

  if (!produccion) {
    produccion = crearNuevaProduccion();
    produccion.idUsuario = idUsuario;
  }

  return produccion;
};

const actualizarProduccion = async (produccion) => {
  await Produccion.findOneAndUpdate(
    { idUsuario: produccion.idUsuario },
    produccion,
    { upsert: true }
  );
};

vacaCtrl.mostrarproduccion = async (req, res) => {
  const idUsuario = req.params.id;

  try {
    const vacas = await Vaca.find({ idusuario: idUsuario }).lean();
    const numeroDeVacasRegistradas = await Vaca.countDocuments({
      idusuario: idUsuario,
    });
    let produccion = await encontrarOCrearProduccion(idUsuario);

    if (!produccion) {
      produccion = { litros_de_leche_semanales: {}, mes: 0 };
    }

    let sumaDiaria = 0;

    vacas.forEach((vaca) => {
      const diasRegistrados = Object.keys(vaca.litros_de_leche_diarias);
      const ultimoDia = diasRegistrados[diasRegistrados.length - 1];

      if (ultimoDia) {
        sumaDiaria += vaca.litros_de_leche_diarias[ultimoDia];
      }
    });

    let totalLitrosDeLeche = 0;
    let semanaActual =
      Object.keys(produccion.litros_de_leche_semanales || {}).length + 1;
    produccion.litros_de_leche_semanales =
      produccion.litros_de_leche_semanales || {};

    vacas.forEach((vaca) => {
      let sumaSemanal = 0;
      global.registroDia7 = false;

      for (let i = 1; i <= 7; i++) {
        const diaActual = `dia${i}`;
        const litros = vaca.litros_de_leche_diarias[diaActual];

        if (litros !== undefined) {
          sumaSemanal += litros;

          if (i === 7) {
            totalLitrosDeLeche += sumaSemanal;
            global.registroDia7 = true;
          }
        }
      }

      if (global.registroDia7 && semanaActual <= 4) {
        if (!produccion.litros_de_leche_semanales[`semana${semanaActual}`]) {
          produccion.litros_de_leche_semanales[`semana${semanaActual}`] =
            sumaSemanal;
        } else {
          produccion.litros_de_leche_semanales[`semana${semanaActual}`] +=
            sumaSemanal;
        }
      }

      if (global.registroDia7) {
        for (let i = 1; i <= 7; i++) {
          delete vaca.litros_de_leche_diarias[`dia${i}`];
        }
      }
    });
    if (semanaActual > 4 && global.registroDia7) {
      let sumaMensual = 0;
      for (let i = 1; i <= 4; i++) {
        sumaMensual += produccion.litros_de_leche_semanales[`semana${i}`] || 0;
      }

      produccion.mes = sumaMensual;

      for (let i = 1; i <= 4; i++) {
        delete produccion.litros_de_leche_semanales[`semana${i}`];
      }

      semanaActual = 1;
      produccion.litros_de_leche_semanales = {
        [`semana${semanaActual}`]: totalLitrosDeLeche,
      };
    }

    await Promise.all(
      vacas.map((vaca) => Vaca.findByIdAndUpdate(vaca._id, vaca))
    );

    await actualizarProduccion(produccion);
    const semanas = produccion.litros_de_leche_semanales;
    const mes = produccion.mes;
    res.render("principal/produccion", {
      numeroDeVacasRegistradas,
      sumaDiaria,
      semanas,
      mes,
    });
  } catch (error) {
    console.error("Error al obtener la producción de las vacas:", error);
    res
      .status(500)
      .json({ message: "Error al obtener la producción de las vacas" });
  }
};

vacaCtrl.guardarvaca = async (req, res) => {
  let errors = [];
  console.log(req.body);
  const {
    userId,
    nombre,
    raza,
    fecha_de_nacimiento,
    vacuna,
    descripcion,
    litros_de_leche,
  } = req.body;
  if (!nombre) {
    errors.push({ text: "ingrese el nombre" });
  }
  if (!raza) {
    errors.push({ text: "ingrese la raza" });
  }
  if (!vacuna) {
    errors.push({ text: "ingrese la vacuna" });
  }
  if (!fecha_de_nacimiento) {
    errors.push({ text: "ingrese la fecha de nacimiento" });
  }
  if (!litros_de_leche) {
    errors.push({ text: "ingrese los litros de leche" });
  }
  if (litros_de_leche < 0) {
    errors.push({ text: "los litros de leche no pueden ser negativos" });
  }
  if (
    !req.files ||
    !req.files.imagen ||
    Object.keys(req.files.imagen).length === 0
  ) {
    errors.push({ text: "Ingrese una imagen de la vaca" });
  }
  if (errors.length > 0) {
    res.render("principal/registrarvaca", {
      errors,
      nombre,
      raza,
      fecha_de_nacimiento,
      vacuna,
      litros_de_leche,
    });
  } else {
    const nombreVaca = await Vaca.findOne({ nombre: nombre });
    if (nombreVaca) {
      req.flash("error_msg", "El nombre ya está registrado");
      res.redirect("/registrarvaca");
    } else {
      const newvaca = new Vaca({
        idusuario: userId,
        nombre,
        raza,
        vacuna,
        fecha_de_nacimiento,
        descripcion,
      });
      newvaca.litros_de_leche_diarias = {
        dia1: litros_de_leche,
      };
      if (req.files.imagen) {
        const result = await fileUploadcow(req.files.imagen.tempFilePath);
        console.log(result);
        newvaca.image = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
        await fs.unlink(req.files.imagen.tempFilePath);
      }
      await newvaca.save();
      req.flash("success_msg", "Registro exitoso");
      res.redirect("/registrarvaca");
    }
  }
};

vacaCtrl.mostrarvaca = async (req, res) => {
  const idu = req.params.id;
  console.log(idu);
  const listadovaca = await Vaca.find({ idusuario: idu }).lean();
  let totalLitrosDeLeche = 0;
  listadovaca.forEach((vaca) => {
    if (vaca.litros_de_leche_diarias) {
      Object.values(vaca.litros_de_leche_diarias).forEach((litros) => {
        if (litros) {
          totalLitrosDeLeche += litros;
        }
      });
    }
  });
  res.render("principal/mostrarVacas", { listadovaca, totalLitrosDeLeche });
};

vacaCtrl.editarvaca = async (req, res) => {
  const id = req.params.id;
  const produccion = await Vaca.findById(id);

  let primerDiaSinValor = null;
  if (produccion && produccion.litros_de_leche_diarias) {
    const dias = Object.keys(produccion.litros_de_leche_diarias);

    for (let i = 0; i < dias.length; i++) {
      const valorDia = produccion.litros_de_leche_diarias[dias[i]];
      if (valorDia === undefined || valorDia === null) {
        primerDiaSinValor = dias[i];
        break;
      }
    }
  }

  console.log(produccion);
  console.log("Primer día sin valor:", primerDiaSinValor);
  res.render("principal/editarproduccion", { id, primerDiaSinValor });
};

vacaCtrl.actualizar_litros_de_leche = async (req, res) => {
  const id = req.params.id;
  const idu = req.body.userId;
  console.log("usuario:", idu);
  const dia = req.body.dia;
  const leche = req.body.litros_de_leche;
  if (leche < 0) {
    req.flash("error_msg", "los litros de leche no pueden ser negativos");
    return res.redirect("back");
  } else {
    const updateQuery = {
      [`litros_de_leche_diarias.${dia}`]: leche,
    };
    const edit = await Vaca.findByIdAndUpdate(id, updateQuery, { new: true });
    res.redirect(`/mostrarvaca/${idu}`);
  }
};

vacaCtrl.eliminarvaca = async (req, res) => {
  const { id } = req.params;
  const vaca = await Vaca.findByIdAndDelete(id);
  await deleteImage(vaca.image.public_id);
  return res.redirect("back");
};

module.exports = vacaCtrl;
