import express from "express";
import path from "path";
import cors from "cors";
import authApis from "./apis/auth.mjs";
import productApis from "./apis/product.mjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import getUser from "./apis/getUser.mjs";


const SECRET = process.env.SECRET || "topsceret";
const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());

app.use(cors({


  origin: [
    "https://final-hackathon-c1283.web.app",
    "http://localhost:3000",
    "*"
  ]
  ,

    credentials: true,

})
);


app.use("/api/v1", authApis);


app.use("/api/v1", (req, res, next) => {

  if (!req?.cookies?.Token) {
    res.status(401).send({
      message: "include http-only credentials with every request",
    });
    return;
  }
  
  jwt.verify(req.cookies.Token, SECRET, (err, decodedData) => {
    if (!err) {

      const nowDate = new Date().getTime() / 1000;

      if (decodedData.exp < nowDate) {
        res.status(401).send({ message: "token expired" });
        res.cookie("Token", " ", {
          maxAge: 1,
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
      } else {
        console.log("token approved");

        req.body.token = decodedData;
        next();
      }
    } else {
      res.status(401).send("invalid token");
    }
  });
});

app.use("/api/v1", getUser);

app.use("/api/v1", productApis);

//how to use multer in node js?


const __dirname = path.resolve();

app.use("/", express.static(path.join(__dirname, "./build")));
app.use("*", express.static(path.join(__dirname, "./build")));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});