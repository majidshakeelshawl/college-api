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
    try {
        const notification = new Notification({ title, body, userId: req.user.userId });
        if (req.file) {
            notification.image.data = req.file.buffer;
            notification.image.contentType = req.file.mimetype;
        }
        else {
            notification.image.data = null;
            notification.image.contentType = null;
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
            console.log("NOT: ", notification);
            console.log("IMAGE ERROR: ", notification.image.data)
            if (notification.image.data !== undefined && notification.image.data !== null) {
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
            }
            else {
                return {
                    _id: notification._id,
                    title: notification.title,
                    body: notification.body,
                    userId: notification.userId,
                    image: null,
                    createdAt: notification.createdAt,
                    updatedAt: notification.updatedAt,
                };
            }
        });

        res.status(200).json({ notifications: notificationsWithImages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong', errorMessage: error.message });
    }
});

router.delete('/deleteNotification/:id', requireAuth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        else {
            await Notification.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Notification deleted successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong', errorMessage: error.message });
    }
});

router.put('/updateNotification/:id', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        else {
            const { title, body } = req.body;
            title ? notification.title = title : null;
            body ? notification.body = body : null;
            if (req.file) {
                // If an image is uploaded, set the image data and content type
                notification.image.data = req.file.buffer;
                notification.image.contentType = req.file.mimetype;
            }
            await notification.save();
            res.status(200).json({ message: 'Notification updated successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong', errorMessage: error.message });
    }
});


module.exports = router;