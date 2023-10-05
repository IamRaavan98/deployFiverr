import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const userALreadyPresentOrnot = await User.findOne({email: req.body.email})
    if(userALreadyPresentOrnot){

      return res.status(200).send("user already register")
    }
    const hash = bcrypt.hashSync(req.body.password, 5);
    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();
    // res.status(201).send("User has been created.");
    const token = jwt.sign(
      {
        id: newUser._id,
        isSeller: newUser.isSeller,
      },
      process.env.JWT_KEY
    );

    const { password, ...info } = newUser._doc;
    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .send(info);
  } catch (err) {
    next(err);
  }
};
export const login = async (req, res, next) => {
  try {

    if(req.cookies.accessToken){
      return res.status(201).send("user already logged in")
    }
    
    const user = await User.findOne({ email: req.body.username });
  

    if (!user) return next(createError(404, "User not found!"));

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect)
      return next(createError(400, "Wrong password "));

    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
      },
      process.env.JWT_KEY
    );
    const { password, ...info } = user._doc;
console.log("tokem");



res
  .cookie("accessToken", token, {
    httpOnly: true,
  })
  .status(200)
  .send(info);
   

 
  
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("User has been logged out.");
};
