const router = require("express").Router();

const {
  renderSignUpForm,
  singup,
  renderSigninForm,
  signin,
  editado,
  mostrarperfil,
  editarUsuario,
  guardarUsuario,
  logout,
} = require("../controllers/users.controller");

const { isAuthenticated } = require("../helpers/auth");

//---------Usuarios-------------------//
router.get("/editado", isAuthenticated, editado);
router.get("/users/editar/:id", isAuthenticated, editarUsuario);
router.post("/users/guardar/:id", isAuthenticated,guardarUsuario);
router.get("/perfil/:id", isAuthenticated, mostrarperfil);
router.get("/users/signup", renderSignUpForm);
router.post("/users/signup", singup);
router.get("/users/signin", renderSigninForm);
router.post("/users/signin", signin);
router.get("/users/logout", logout);

module.exports = router;