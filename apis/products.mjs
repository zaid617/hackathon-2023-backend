import express from "express";
import mongoose from "mongoose";
import { productModel } from "../database/model.mjs";
import multer from "multer";
import fs from "fs";
import jwt from "jsonwebtoken";
import bucket from "../firebaseAdmin/index.mjs";

const storageConfig = multer.diskStorage({
  // destination: "./uploads/",
  filename: function (req, file, cb) {
    // console.log("mul-file: ", file);
    cb(null, `${new Date().getTime()}-${file.originalname}`);
  },
});
var uploadMiddleware = multer({ storage: storageConfig });

const router = express.Router();

router.post("/product", uploadMiddleware.any(), (req, res) => {
  try {
    const body = req.body;
    const token = jwt.decode(req.cookies.Token);

    if (
      !body.text
    ) {
      res.status(400).send({
        message: "required parameters missing",
      });
      return;
    }

    bucket.upload(
      req.files[0].path,
      {
        destination: `productPictures/${req.files[0].filename}`,
      },
      function (err, file, apiResponse) {
        if (!err) {
          file
            .getSignedUrl({
              action: "read",
              expires: "03-09-2999",
            })
            .then((urlData, err) => {
              if (!err) {
                try {
                  fs.unlinkSync(req.files[0].path);
                } catch (err) {
                   console.error(err);
                }
                productModel.create(
                  {
                    text: body.text,
                    imageUrl: urlData[0],
                    owner: new mongoose.Types.ObjectId(token._id),
                  },
                  (err, saved) => {
                    if (!err) {
                      res.send({
                        message: "product added successfully",
                      });
                    } else {
                      res.status(500).send({
                        message: "server error",
                      });
                    }
                  }
                );
              }
            });
        } else {
          res.status(500).send();
        }
      }
    );
  } catch (error) {
     console.log("error: ", error);
  }
});

router.get("/products", (req, res) => {

  const userId = new mongoose.Types.ObjectId(req.body.token._id);

  productModel.find(
    { owner: userId, isDeleted: false },
    {},
    {
      sort: { _id: -1 },
      limit: 100,
      skip: 0,
      populate: {
        path: "owner",
        select: "firstName lastName email",
      },
    },
    (err, data) => {
      if (!err) {
        res.send({
          message: "got all products successfully",
          data: data,
        });
      } else {
        res.status(500).send({
          message: "server error",
        });
      }
    }
  );
});

router.get("/productFeed", (req, res) => {
  const page = req.query.page || 0;
  productModel.find(
    { isDeleted: false },
    {},
    {
      sort: { _id: -1 },
      limit: 5,
      skip: page,
      populate: {
        path: "owner",
        select: "firstName lastName email",
      },
    },
    (err, data) => {
      if (!err) {
        res.send({
          message: "got all products successfully",
          data: data,
        });
      } else {
        res.status(500).send({
          message: "server error",
        });
      }
    }
  );
});
router.get("/product/:text", (req, res) => {
  const querrytext = req.params.text;
  productModel.find({ text: { $regex: `${querrytext}` } }, (err, data) => {
    if (!err) {
      if (data) {
        res.send({
          message: `get product by success`,
          data: data,
        });
      } else {
        res.status(404).send({
          message: "product not found",
        });
      }
    } else {
      res.status(500).send({
        message: "server error",
      });
    }
  });
});
router.delete("/product/:id", (req, res) => {
  const id = req.params.id;
  const body = req.body;

  productModel.deleteOne(
    {
      _id: id,
      owner: new mongoose.Types.ObjectId(body.token._id),
    },
    (err, deletedData) => {
      if (!err) {
        if (deletedData.deletedCount !== 0) {
          res.send({
            message: "product has been deleted successfully",
          });
        } else {
          res.status(404);
          res.send({
            message: "No product found with this id: " + id,
          });
        }
      } else {
        res.status(500).send({
          message: "server error",
        });
      }
    }
  );
});
router.put("/product/:id", async (req, res) => {
  const body = req.body;
  const id = req.params.id;

  if (!body.text) {
    res.status(400).send(` required parameter missing. example request body:
        {
            "text": "value",
                    }`);
    return;
  }

  try {
    let data = await productModel
      .findOneAndUpdate(
        { _id: id, owner: new mongoose.Types.ObjectId(body.token._id) },
        {
          text: body.text,
        },
        { new: true }
      )
      .exec();

    res.send({
      message: "product modified successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
});

export default router;
