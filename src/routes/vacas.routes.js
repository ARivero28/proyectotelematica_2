const express = require("express");
const router = express.Router();

const {
  registrarvaca,
  guardarvaca,
  mostrarvaca,
  editarvaca,
  actualizar_litros_de_leche,
  eliminarvaca,
  mostrarproduccion,
} = require("../controllers/vaca.controller");

// Helpers
const { isAuthenticated } = require("../helpers/auth");

router.get("/registrarvaca", registrarvaca);
router.post("/guardarvaca", isAuthenticated, guardarvaca);
router.get("/mostrarvaca/:id", isAuthenticated, mostrarvaca);
router.get("/editarvaca/:id", isAuthenticated, editarvaca);
router.post("/actualizar/litros/leche/:id", isAuthenticated, actualizar_litros_de_leche);
router.get("/eliminar/vaca/:id", isAuthenticated, eliminarvaca);
router.get("/produccion/:id", isAuthenticated, mostrarproduccion);

module.exports = router;
