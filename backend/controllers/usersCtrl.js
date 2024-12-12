const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

//!User registration

const usersController = {
  //!Register
  register: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    //!validate
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please all fields are required" });
    }
    //!Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    //!Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //!Create the user and save into DB
    const userCreated = await User.create({
      username,
      email,
      password: hashedPassword
    });
    //!send the response

    res.json({
      username: userCreated.username,
      email: userCreated.email,
      _id: userCreated._id
    });
  }),
  //!Login
  login: asyncHandler(async (req, res) => {
    //!Get the user data
    const { email, password } = req.body;
    //!check if email is correct
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid login credentials" });
    }
    //!Compare the user password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid login credentials" });
    }
    //!Generate a token
    const token = jwt.sign({ id: user._id }, "masynctechKey", {
      expiresIn: "30d"
    });
    //!Send the response
    res.json({
      message: "Login successful",
      token,
      id: user._id,
      email: user.email,
      username: user.username
    });
  }),

  //!Profile
  profile: asyncHandler(async (req, res) => {
    //!Find the user
    console.log(req.user);
    const user = await User.findById(req.user);
    if (!user) {
      throw new Error("User not found");
    }
    //!send the response
    res.json({ username: user.username, email: user.email });
  }),
  //! CHange password
  changeUserPassword: asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    //!Find the user
    const user = await User.findById(req.user);
    if (!user) {
      throw new Error("User not found");
    }
    //!Hash the new password before saving
    //!Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    //! ReSave the user
    await user.save();
    //!send the response
    res.json({ message: "Password changed successfully" });
  }),
  //! Update user profile
  updateUserProfile: asyncHandler(async (req, res) => {
    const { email, username } = req.body;
    const updateUser = await User.findByIdAndUpdate(
      req.user,
      {
        username,
        email
      },
      {
        new: true
      }
    );
    res.json({ message: "User profile updated successfully", updateUser });
  })
};

module.exports = usersController;
