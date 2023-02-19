import express from "express";
import { userModel } from "../dbrepo/models.mjs";

const router = express();

const getUser = async (req, res) => {
  
  let _id = "";
  if (req.params.id) {
    _id = req.params.id;
  } else {
    _id = req.body.token._id;
  }

  try {
    const user = await userModel
      .findOne({ _id: _id }, "email firstName isAdmin isVerified -_id")
      .exec();
    if (!user) {
      res.status(404).send({ message: "user not found" });
      return;
    } else {
      res.send({
        message: "User Login",
        profile: {
          firstName: user.firstName,
          contact: user.contact,
          email: user.email,
          _id: user._id,
          isAdmin: user.isAdmin
        },
        })
      res.status(200)
    }
  } catch (error) {
    res.status(500).send({
      message: "something went wrong on server",
    });
  }
};

router.get("/profile", getUser);
router.get("/profile/:id", getUser);

export default router;
