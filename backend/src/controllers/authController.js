import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// SIGNUP
export const signup = async (req, res) => {
    try {

        const { name, email, password, role } = req.body;

        // check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        res.status(201).json({
            message: "User created successfully",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};




// LOGIN
export const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // check user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        // compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        // create token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};