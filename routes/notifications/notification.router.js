const router = require('express').Router();
const multer = require('multer');
const moment = require('moment');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');

// Multer configuration to handle image uploads

const storage = new GridFsStorage({
    url: `${process.env.MONGO_URL}`,
    file: (req, file) => {
        return {
            filename: `${file.originalname}_${Date.now()}`,
            bucketName: 'uploads',
        };
    },
});
const upload = multer({ storage });

// models
const Notification = require('../../models/notification/notification.model');

const { requireAuth } = require('../../middlewares/auth/authMiddleware');

// router.post('/createNotification', requireAuth, upload.single('image'), async (req, res) => {
//     const { title, body, videoURL } = req.body;
//     try {
//         const notification = new Notification({ title, body, userId: req.user.userId, videoURL });
//         if (req.file) {
//             notification.image.data = req.file.buffer;
//             notification.image.contentType = req.file.mimetype;
//         }
//         else {
//             notification.image.data = null;
//             notification.image.contentType = null;
//         }
//         await notification.save();

//         res.status(201).json({ message: 'Notification created successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });
router.post('/createNotification', requireAuth, upload.single('image'), async (req, res) => {
    const { title, body, videoURL } = req.body;
    try {
        const imageUrl = req.file ? req.file.filename : null; // Store the image filename (URL) in the database

        const notification = new Notification({ title, body, userId: req.user.userId, videoURL, image: imageUrl });
        await notification.save();

        res.status(201).json({ message: 'Notification created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/getAllNotifications', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        // Calculate the skip value based on the page number and items per page
        const skip = (page - 1) * perPage;

        // Fetch the total count of notifications
        const totalCount = await Notification.countDocuments();

        // Fetch the notifications for the specified page using skip and limit
        const notifications = await Notification.find()
            .skip(skip)
            .limit(perPage)
            .sort({ createdAt: -1 });

        const notificationsWithImages = notifications.map((notification) => {
            if (notification.image !== undefined) {

                // Create a new object with notification data and the image URL
                return {
                    _id: notification._id,
                    title: notification.title,
                    body: notification.body,
                    imageUrl: `${process.env.PROD_URL}/notification_images/${notification.image}`,
                    date: moment.utc(notification.createdAt).format('YYYY-MMMM-DD'),
                    videoURL: notification.videoURL,
                };
            }
            else {
                return {
                    _id: notification._id,
                    title: notification.title,
                    body: notification.body,
                    imageUrl: null,
                    date: moment.utc(notification.createdAt).format('YYYY-MMMM-DD'),
                    videoURL: notification.videoURL,
                };
            }
        });

        res.status(200).json({
            totalNotifications: totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            notifications: notificationsWithImages,
        });
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
            const { title, body, videoURL } = req.body;
            title ? notification.title = title : null;
            body ? notification.body = body : null;
            videoURL ? notification.videoURL = videoURL : null;
            if (req.file) {
                // If an image is uploaded, set the image data and content type
                notification.image = req.file.filename;
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