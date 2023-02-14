import mongoose from "mongoose";

let productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  description: String,
  createdOn: { type: Date, default: Date.now },
  url: String
});
export const productModel = mongoose.model('products', productSchema);


const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdOn: { type: Date, default: Date.now },
});
userSchema.index({ firstName: "text", lastName: "text" });
export const userModel = mongoose.model("Users", userSchema);

const otpSchema = new mongoose.Schema({
  otp: String,
  email: String,
  isUsed: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now },
});
export const otpModel = mongoose.model("Opts", otpSchema);

const mongodbURI =process.env.MONGODBURI;
console.log(process.env.MONGODBURI);
mongoose.set("strictQuery", false);
mongoose.connect(mongodbURI);

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
