const mongoose = require("mongoose");


//const MONGODB_URI = `mongodb://${NOTES_APP_MONGODB_HOST}/${NOTES_APP_MONGODB_DATABASE}`;
const MONGODB_URI = 'mongodb+srv://<nombre>:<vapaswordcas>@cluster0.lorev7q.mongodb.net/Ganados?retryWrites=true&w=majority';
//esto lo toman de la pagina de mongodb

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((db) => console.log("DB is connected"))
  .catch((err) => console.error(err));