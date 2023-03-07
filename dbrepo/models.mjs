import mongoose from "mongoose";


const MONGODBURI = "mongodb+srv://zaid617:abc123456@cluster0.1srlrtd.mongodb.net/hackathonDB?retryWrites=true&w=majority"

let productSchema = new mongoose.Schema({

  name: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  unitValue: { type: Number, required: true },
  description: { type: String},
  category: { type: String},
  url: { type: String},
  createdOn: { type: Date, default: Date.now },
  isDeleted: {type:Boolean , default: false}
  
});
export const AddProductModel = mongoose.model('products', productSchema);


////////////////////////////////////////////////////////////////////////////////


let userProductsSchema = new mongoose.Schema({

  name: { type: String, required: true },
  userId: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  unitValue: { type: Number, required: true },
  description: { type: String},
  category: { type: String},
  url: { type: String},
  status: { type: String , default: "pending"},
  createdOn: { type: Date, default: Date.now },
  isDeleted: {type:Boolean , default: false}

});
export const userProducts = mongoose.model('userProducts', userProductsSchema);

////////////////////////////////////////////////////////////////////////////////


let orderProductsSchema = new mongoose.Schema({

  products: { type: Array, default:[], required: true },
  user: { type: String, required: true },
  total: { type: Number },
  number: { type: Number, required: true },
  userId: { type: String, required: true },
  address: { type: String},
  status: { type: String , default: "pending"},
  createdOn: { type: Date, default: Date.now },
  isDeleted: {type:Boolean , default: false}

});
export const orderProducts = mongoose.model('orderProducts', orderProductsSchema);

////////////////////////////////////////////////////////////////////////////////

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  email: { type: String, required: true },
  contact: { type: Number, required: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now },
});
userSchema.index({ firstName: "text", lastName: "text" });
export const userModel = mongoose.model("Users", userSchema);

///////////////////////////////////////////////////////////////////////

const otpSchema = new mongoose.Schema({
  otp: String,
  email: String,
  isUsed: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now },
});
export const otpModel = mongoose.model("Opts", otpSchema);



mongoose.set("strictQuery", false);
mongoose.connect(MONGODBURI);

mongoose.connection.on("connected", function () {
  console.log("Mongoose connected");
});

mongoose.connection.on("disconnected", function () {
  console.log("Mongoose disconnected");
  process.exit(1);
});

mongoose.connection.on("error", function (err) {
  console.log("Mongoose error: ", err);
  process.exit(1);
});

process.on("SIGINT", function () {
  console.log("terminating the app");
  mongoose.connection.close(function () {
    console.log("Mongoose connection closed");
    process.exit(0);
  });
});
