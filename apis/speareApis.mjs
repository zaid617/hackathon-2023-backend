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