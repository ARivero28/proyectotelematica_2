const usersCtrl = {};
const { arrayStrictEqual } = require("mongodb/lib/core/utils");
const User = require("../models/User");
const passport = require("passport");
//-------------Usuarios-----------------------//
usersCtrl.renderSignUpForm = (req, res) => {
  res.render("users/signup");
};

usersCtrl.editado = (req, res) => {
  res.render("users/perfil");
};

usersCtrl.mostrarperfil = async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  res.render("users/perfil");
};

usersCtrl.editarUsuario = async (req, res) => {
  const usuario = await User.findById(req.params.id).lean();
  res.render("users/editarusuario",);
};

usersCtrl.guardarUsuario = async (req, res) => {
  const idUsuario = req.params.id;
  await User.findByIdAndUpdate(
    idUsuario,
    {
      fullname: req.body.fullname,
      phone: req.body.phone,
      department: req.body.department,
      municipality: req.body.municipality,
      neighborhood: req.body.neighborhood,
      address: req.body.address,
      descriptionhouse: req.body.descriptionhouse,
      identificacion: req.body.identificacion,
      email: req.body.email,
    },
    (error, idUsuario) => {
      console.log(error, idUsuario);
      res.redirect("/editado");
    }
  );
};

usersCtrl.singup = async (req, res) => {
  let errors = [];
  const {
    name,
    identificacion,
    email,
    password,
    confirm_password,
  } = req.body;
  if (!name) {
    errors.push({ text: "Por favor ingrese su nombre completo" });
  }
  if (!identificacion) {
    errors.push({ text: "Por favor ingrese su numero de documento" });
  }
  if (!email) {
    errors.push({ text: "Por favor ingrese un correo electronico" });
  }
  if (!password) {
    errors.push({ text: "Por favor ingrese una contraseña" });
  }
  if (password != confirm_password) {
    errors.push({ text: "Password no coinciden." });
  }
  if (password.length < 6) {
    errors.push({ text: "Passwords debe tener al menos 6 caracteres" });
  }
  if (errors.length > 0) {
    res.render("users/signup", {
      errors,
      name,
      identificacion,
      email,
      password,
      confirm_password,
    });
  } else {
    const emailUser = await User.findOne({ email: email });
    if (emailUser) {
      req.flash("error_msg", "El mail ya está registrado");
      res.redirect("/users/signup");
    } else {
      const newUser = new User({
        name,
        identificacion,
        email,
        password,
      });
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();
      req.flash("success_msg", "Registro exitoso");
      res.redirect("/users/signin");
    }
  }
};

usersCtrl.renderSigninForm = (req, res) => {
  res.render("users/signin");
};

usersCtrl.signin = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/users/signin",
  failureFlash: true
});

usersCtrl.logout = (req, res) => {
  req.logout();
  res.redirect("/");
};

module.exports = usersCtrl;