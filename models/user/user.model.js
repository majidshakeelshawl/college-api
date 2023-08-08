const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
    },
    type: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'ADMIN',
    },
});

userSchema.statics.login = async function (email, password) {
    if (!email, !password)
        throw new Error("Both email and password are required");
    if (!validator.isEmail(email))
        throw new Error("Enter a valid Email");

    // check if email exists
    const user = await this.findOne({ email });
    if (!user)
        throw new Error("Invalid email or password");

    // check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
        throw new Error("Invalid password or email");

    // sign and create jwt token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '100y' });

    const loggedInUser = {
        name: user.name,
        email: user.email,
        _id: user._id,
    };

    return { loggedInUser, token };
}

userSchema.statics.signUp = async function (email, password, name) {
    if (!email || !password || !name)
        throw new Error("All fields are required");
    if (!validator.isEmail(email))
        throw new Error("Enter a valid email");

    const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
    const createdUser = await this.create({
        email: email,
        password: hashedPassword,
        name: name,
    });
    console.log("JWT SECRETE:::::::::::::: ", process.env.JWT_SECRET)
    // sign and create jwt token
    const token = await jwt.sign({ userId: createdUser._id }, process.env.JWT_SECRET, { expiresIn: '100y' });

    const user = {
        name: createdUser.name,
        email: createdUser.email,
        _id: createdUser._id,
    }

    return { user, token };
}


module.exports = mongoose.model('User', userSchema);