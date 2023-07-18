const router = require('express').Router();
const multer = require('multer');
// Multer configuration to handle image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// models
const Notification = require('../../models/notification/notification.model');

const { requireAuth } = require('../../middlewares/auth/authMiddleware');

router.post('/createNotification', requireAuth, upload.single('image'), async (req, res) => {
    const { title, body } = req.body;
    const userId = req.user._id; // Assuming you're using a middleware to attach the logged-in user to the request

    try {
        const notification = new Notification({ title, body, userId: req.user.userId });
        if (req.file) {
            // If an image is uploaded, set the image data and content type
            notification.image.data = req.file.buffer;
            notification.image.contentType = req.file.mimetype;
        }

        await notification.save();

        res.status(201).json({ message: 'Notification created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;