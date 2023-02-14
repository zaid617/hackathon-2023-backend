import express from "express";
import fs from 'fs';
import mongoose from "mongoose";
import { AddProductModel } from "../dbrepo/model.mjs";
import multer from 'multer';
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
      // validation
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
        destination: `tweetPictures/${req.files[0].filename}`,
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
                // console.log("public downloadable url: ", urlData[0]); 

                try {
                  fs.unlinkSync(req.files[0].path);
                  //file removed
                } catch (err) {
                  // console.error(err);
                }

                AddProductModel.create(
                  {
                    // productImage: body.productImage,
                    productName: body.productName,
                    productCategory: body.productCategory,
                    productDec: body.productDec,
                    unitName: body.unitName,
                    unitPrice: body.unitPrice,
                  },
                  (err, saved) => {
                    if (!err) {
                      console.log(saved);

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
          // console.log("err: ", err);
          res.status(500).send();
        }
      }
    );
  } catch (error) {
    // console.log("error: ", error);
  }
});
router.get("/products", (req, res) => {
  const userID = new mongoose.Types.ObjectId(req.body.token._id);
  AddProductModel.find(
    { owner: userID, isDeleted: false },
    {},
    {
      sort: { _id: -1 },
      limit: 100,
      skip: 0,
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

router.get("/product/:name", (req, res) => {
  console.log(req.params.name);
  const querryName = req.params.name;
  AddProductModel.find({ name: { $regex: `${querryName}` } }, (err, data) => {
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

  AddProductModel.deleteOne({ _id: id }, (err, deletedData) => {
    console.log("deleted: ", deletedData);
    if (!err) {
      if (deletedData.deletedCount !== 0) {
        res.send({
          message: "Product has been deleted successfully",
        });
      } else {
        res.status(404);
        res.send({
          message: "No Product found with this id: " + id,
        });
      }
    } else {
      res.status(500).send({
        message: "server error",
      });
    }
  });
});
router.put("/product/:id", async (req, res) => {
  const body = req.body;
  const id = req.params.id;

  if (!body.name || !body.price || !body.description) {
    res.status(400).send(` required parameter missing. example request body:
        {
            "name": "value",
            "price": "value",
            "description": "value"
        }`);
    return;
  }

  try {
    let data = await AddProductModel
      .findByIdAndUpdate(
        id,
        {
          name: body.name,
          price: body.price,
          description: body.description,
        },
        { new: true }
      )
      .exec();

    console.log("updated: ", data);

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