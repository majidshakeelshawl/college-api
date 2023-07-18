const User = require('../../models/user/user.model');

const createAdmin = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const { user, token } = await User.signUp(email, password, name);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ messageE: error.message });
    }
}

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { loggedInUser, token } = await User.login(email, password);
        res.status(200).json({ loggedInUser, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createAdmin,
    loginAdmin,
}
