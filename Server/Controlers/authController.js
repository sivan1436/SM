import User from "../Models/User.js";
import bcrypt from "bcryptjs";

export async function Register(req, res) {
  try {
    const {
      email,
      fullName,
      username,
      password,
    } = req.body;

    // Check required fields
    if (!email || !fullName || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedFullName = fullName.trim();

    // Check email
    const userExist = await User.findOne({
      email: normalizedEmail,
    });

    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check username
    const usernameExist = await User.findOne({
      username: normalizedUsername,
    });

    if (usernameExist) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create user
    const user = await User.create({
      email: normalizedEmail,
      full_name: normalizedFullName,
      username: normalizedUsername,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        username: user.username,
      },
    });

  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
export async function Login(req,res){
  try{
    const {email,password} = req.body;
    if(!email || !password ){
      return res.status(400).json({
        success : false,
        message: "Email and password required"
      })
    }
    const user = await User.findOne({email : email.toLowerCase()})
    if(!user){
      return res.status(400).json({
        success :false,
        message : "user not found"
      })
    }
      const iscorrectPassword = await bcrypt.compare(password,user.password)
      if(!iscorrectPassword){
        return res.status(500).json({
          success : false,
          message : "Incorrect password"
        })
      }
      return res.status(200).json({
        success : true,
        user
      })
    
      
    }
    catch(error){
      res.status(500).json({
        success:false,
        message : "Internal Errot"
      })
    }
  };
