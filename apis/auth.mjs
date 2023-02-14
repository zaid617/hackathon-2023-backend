import express from "express";
import jwt from "jsonwebtoken";
import { userModel } from "../dbrepo/model.mjs";
import { stringToHash, varifyHash } from "bcrypt-inzi";
import bucket from "../firebaseAdmin/index.mjs"

const router = express.Router();
const SECRET = process.env.SECRET || "topsceret";

router.get('/profile', (req, res) => {
  userModel.findOne({ Email: req.body._decoded.Email }, (err, user) => {

      if (err) {
          res.status(500).send("error in getting database")
      } else {
          if (user) {
              res.send({
                  name: user.name,
                  Email: user.Email,
                  _id: user._id,
              });
          } else {
              res.send("user not found");
          }
      }
  })
})

router.post("/signup", (req, res) => {
  let body = req.body;
  
  
  if (!body.FullName || !body.Contact || !body.Email || !body.Password) {
    res.status(400).send(
      `required fields missing, request example: 
                  {
                      "FullName": "John",
                      "Contact": "Doe",
                      "Email": "abc@abc.com",
                      "Password": "12345"
                  }`
    );
    return;
  }

  req.body.Email = req.body.Email.toLowerCase();

  userModel.findOne({ Email: body.Email }, (err, data) => {
    if (!err) {
      console.log("data: ", data);

      if (data) {
        // user already exist
        console.log("user already exist: ", data);
        res.status(400).send({
          message: "user already exist,, please try a different Email",
        });
        return;
      } else {
        // user not already exist
        // bcrypt hash technique isley ke ye one incryption he
        stringToHash(body.Password).then((hashString) => {
          userModel.create(
            {
              FullName: body.FullName,
              Contact: body.Contact,
              Email: body.Email,
              Password: hashString,
            },
            (err, result) => {
              if (!err) {
                console.log("data saved: ", result);
                res.status(201).send({ message: "user is created" });
              } else {
                console.log("db error: ", err);
                res.status(500).send({ message: "internal server error" });
              }
            }
          );
        });
      }
    } else {
      console.log("db error: ", err);
      res.status(500).send({ message: "db error in query" });
      return;
    }
  });
});

router.post("/login", (req, res) => {
  let body = req.body;
  // if (!body.FullName || !body.Contact || !body.Email || !body.Password) {

  if (!body.Email || !body.Password) {
    res.status(400).send(
      `required fields missing, request example: 
                  {
                      "Email": "abc@abc.com",
                      "Password": "12345"
                  }`
    );
    return;
  }
  req.body.Email = req.body.Email.toLowerCase();

  userModel.findOne(
    { Email: body.Email },
    "FullName Contact Email Password",
    (err, data) => {
      if (!err) {
        console.log("data: ", data);

        if (data) {
          varifyHash(body.Password, data.Password).then((isMatched) => {
            console.log("isMatched: ", isMatched);

            if (isMatched) {
              var token = jwt.sign(
                {
                  _id: data._id,
                  Email: data.Email,
                  iat: Math.floor(Date.now() / 1000) - 30,
                  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
                },
                SECRET
              );

              res.cookie("Token", token, {
                maxAge: 86_400_000,
                httpOnly: true,
                sameSite: "none",
                secure: true,
              });

              res.send({
                message: "login successful",
                profile: {
                  FullName: data.FullName,
                  Contact: data.Contact,
                  Email: data.Email,
                  _id: data._id,
                },
              });
              return;
            } else {
              console.log("user not found");
              res.status(401).send({ message: "Incorrect Email or Password" });
              return;
            }
          });
        } else {
          console.log("user not found");
          res.status(401).send({ message: "Incorrect Email or Password" });
          return;
        }
      } else {
        console.log("db error: ", err);
        res.status(500).send({ message: "login failed, please try later" });
        return;
      }
    }
  );
});
router.post("/logout", (req, res) => {
//   dono correct hen

  // res.cookie("Token", " ", {
  //   maxAge: 0,
  //   httpOnly: true,
  //   sameSite: 'none',
  //   secure: true
  // });

  res.clearCookie("Token",{
    httpOnly: true,
    sameSite: 'none',
    secure: true
  });

  res.send({ message: "Logout successful" });
});



export default router;