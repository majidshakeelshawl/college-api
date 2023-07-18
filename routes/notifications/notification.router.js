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

router.get('/getAllNotifications', async (req, res) => {
    try {
        const notifications = await Notification.find();

        const notificationsWithImages = notifications.map((notification) => {
            const imageBuffer = Buffer.from(notification.image.data);
            const imageWebSafe = `data:${notification.image.contentType};base64,${imageBuffer.toString('base64')}`;

            // Create a new object with notification data and the image URL
            return {
                _id: notification._id,
                title: notification.title,
                body: notification.body,
                userId: notification.userId,
                image: imageWebSafe,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt,
            };
        });

        res.status(200).json({ notifications: notificationsWithImages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});


module.exports = router;