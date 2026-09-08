const userModel = require('../models/user.model');

const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');
const tokenBlacklistModel = require('../models/blacklist.model');

const cookieOptions = {
    httpOnly: true,
    secure: false,       // false for localhost HTTP
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 1000 // 1 hour
};


async function registerUser(req, res) {

    const { email, name, password } = req.body;

    const isExist = await userModel.findOne({ email });

    if (isExist) {
        return res.status(400).json({
            message: 'Email already exists'
        });
    }

    const user = await userModel.create({
        email,
        name,
        password
    });

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.cookie('token', token, cookieOptions);

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        }
    });

    await emailService.sendRegistrationEmail(
        user.email,
        user.name
    );
}


async function loginUser(req, res) {

    const { email, password } = req.body;

    const user = await userModel
        .findOne({ email })
        .select('+password');

    if (!user) {
        return res.status(400).json({
            message: 'Invalid email or password'
        });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(400).json({
            message: 'Invalid email or password'
        });
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.cookie('token', token, cookieOptions);

    return res.status(200).json({
        message: 'User logged in successfully',
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        }
    });
}


async function logoutUser(req, res) {

    const token =
        req.cookies.token ||
        req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    // Delete cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/'
    });

    // Blacklist JWT
    await tokenBlacklistModel.create({
        token
    });

    return res.status(200).json({
        message: 'User logged out successfully'
    });
}


module.exports = {
    registerUser,
    loginUser,
    logoutUser
};