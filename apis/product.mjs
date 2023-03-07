import express from "express";
import mongoose from "mongoose";
import { AddProductModel } from "../dbrepo/models.mjs";
import { userProducts } from "../dbrepo/models.mjs";
import { orderProducts } from "../dbrepo/models.mjs";


const router = express.Router();

// add product

router.post("/product" , (req, res) => {

      let { 
        name
        , price
        , unit
        , unitValue
        , category
        , description
        , url } = req.body

        console.log(name, price, unit, unitValue, category, description, url);

  try {

    if ( // validation
      !name || !category || !price || !unit || !unitValue || !unitValue )
      {
      res.status(400).send({
        message: "required parameters missing",
      });
      return;
    }

    else{

      AddProductModel.create(
        {
          name : name,
          price : price,
          unit : unit,
          category: category,
          unitValue : unitValue,
          description : description,
          url : url,

        },
        (err) => {
          if (!err) {
            res.status(201).send({ message: "product is added" });
          } else {
            res.status(500).send({ message: "internal server error" });
          }
        }
      );

    }


  } catch (error) {
    console.log("error: ", error);
  }

});

// getting all products

router.get("/getProducts", (req, res) => {

  AddProductModel.find(

    { isDeleted: false },{},

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



// searching products

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


// delete product

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



// delete all cart product

router.delete("/cartproduct/:id", (req, res) => {

  const id = req.params.id;

  console.log(id);

  userProducts.deleteMany(
    
    { userId: id  },(err, deletedData) => {

    if (!err) {
      
        res.send({

          message: "Products have been deleted successfully",
          data: deletedData

        });

      }

      else {
        res.status(404);
        res.send({
          message: "No Product found with this id: " + id,
        });

      }
   
    
  });
});

// update product

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

// add to cart product

router.post('/addtocart',(req , res)=>{

  let { 
      name
    , userId
    , price
    , unit
    , unitValue
    , category
    , description
    , url } = req.body

    try{

      if (!name , !userId , !price , !unit , !unitValue ) {

        res.status(400).send("required parameters missing");

        return;
      }

      else{

        userProducts.create(
          {
             name:name
            ,userId:userId
            ,price:price
            ,unit:unit
            ,unitValue:unitValue
            ,description:description
            ,category:category
            ,url:url,
  
          },
          (err) => {
            if (!err) {
              res.status(200).send({ message: "product is added to cart" });
            } else {
              res.status(500).send({ message: "internal server error" });
            }
          }
        );
  
      }


    }
    catch(err){
      console.log(err);
    }




})

// get cart product

router.get("/mycart/:id" , (req , res)=>{

  let id = req.params.id;
  
   userProducts.find( {
     userId: id
   },{},    
     {
     sort: { _id: -1 },
     limit: 100,
     skip: 0,
     }, 
    
     (err, data) => {

       if (!err) {
         res.send({
           message: "got all cart products successfully",
           data: data,
         });

       } else {
         res.status(500).send({
           message: "server error",
         });
       }
     }
    
     )

})

// place order

router.post('/order', (req , res )=>{

  let { 
    
   userId,
   address,
   user,
   email,
   products

 } = req.body

  try{

    if (!userId , !address , !user , !email , !products ) {

      res.status(400).send("required parameters missing");

      return;
    }

    else{

      orderProducts.create(
        {
          products:products,
          userId:userId
          ,address:address
          ,user:user
          ,email:email,

        },
        (err) => {

          if (!err) {
            res.status(200).send({ message: "order confirm" });
          }
           else {
            res.status(500).send({ message: "internal server error" });
          }
        }
      );

    }


  }
  catch(err){
    console.log(err);
  }


})



export default router;