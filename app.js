require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');


const app = express();

// This code sets up the mongo database, you need to change "test" in the path
// to the name of your database
// https://mongoosejs.com/docs/index.html
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/userDB');
}
// end of mongoose set up


// This allows you to use the ejs files in the "views" directory
app.set('view engine', 'ejs');

// This line is used to load your css or images onto your html file.
// You will need to create a folder named "Public" and save the css and images in there.
app.use(express.static("public"));

// Use ".urlencoded" when trying to parse data from html post
app.use(bodyParser.urlencoded({
  extended: true
}));

// This was slightly changed after we added the mongoose encryption
// Added "new mongoose.Schema" and parantheses
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

// encryption on the password field and the secret is hidden using dotenv
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });
// end encryption

const User = new mongoose.model("User", userSchema);


app.get('/', function(req, res) {
  res.render("home");
});

app.get('/login', function(req, res) {
  res.render("login");
});

app.get('/register', function(req, res) {
  res.render("register");
});

// This takes the post from register and enters the email and pw to db
app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

// Checks if the user entered login info matches the db
app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  // Look in db for an email equal to the user entered email
  User.findOne({
    email: username
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      // If email is in db, check if the password matches the one for that email
      if (foundUser.password === password) {
        res.render("secrets");
      }
    }
  });
});

app.listen(3000, function(req, res) {
  console.log("Server started on port 3000");
});
