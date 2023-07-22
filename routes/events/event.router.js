const router = require('express').Router();
const multer = require('multer');
// Multer configuration to handle image uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        // Set the overall request size limit to 50MB
        fileSize: 100 * 1024 * 1024, // 50MB in bytes
    },
});


// Models
const Event = require('../../models/event/event.model');

const { requireAuth } = require('../../middlewares/auth/authMiddleware');

router.post('/addEvent',
    requireAuth,
    upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]),
    async (req, res) => {
        const { title, body } = req.body;
        try {
            const event = new Event({ title, body, userId: req.user.userId });

            // Check if an image file was uploaded
            if (req.files && req.files.image && req.files.image[0]) {
                event.image.data = req.files.image[0].buffer;
                event.image.contentType = req.files.image[0].mimetype;
            } else {
                event.image.data = null;
                event.image.contentType = null;
            }

            // Check if a video file was uploaded
            if (req.files && req.files.video && req.files.video[0]) {
                event.video.data = req.files.video[0].buffer;
                event.video.contentType = req.files.video[0].mimetype;
            } else {
                event.video.data = null;
                event.video.contentType = null;
            }

            await event.save();

            res.status(201).json({ message: 'Event created successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Something went wrong', errorMessage: error.message });
        }
    }
);

router.get('/getAllEvents', async (req, res) => {
    try {
        const events = await Event.find();

        const eventsWithMedia = events.map((event) => {
            const eventData = {
                _id: event._id,
                title: event.title,
                body: event.body,
                userId: event.userId,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
            };

            if (event.image.data !== undefined && event.image.data !== null) {
                const imageBuffer = Buffer.from(event.image.data);
                const imageWebSafe = `data:${event.image.contentType};base64,${imageBuffer.toString('base64')}`;
                eventData.image = imageWebSafe;
            }

            if (event.video.data !== undefined && event.video.data !== null) {
                const videoBuffer = Buffer.from(event.video.data);
                const videoWebSafe = `data:${event.video.contentType};base64,${videoBuffer.toString('base64')}`;
                eventData.video = videoWebSafe;
            }

            return eventData;
        });

        res.status(200).json({ events: eventsWithMedia });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/getEvent/:eventId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const eventData = {
            _id: event._id,
            title: event.title,
            body: event.body,
            userId: event.userId,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
        };

        if (event.image.data !== undefined && event.image.data !== null) {
            const imageBuffer = Buffer.from(event.image.data);
            const imageWebSafe = `data:${event.image.contentType};base64,${imageBuffer.toString('base64')}`;
            eventData.image = imageWebSafe;
        }

        if (event.video.data !== undefined && event.video.data !== null) {
            const videoBuffer = Buffer.from(event.video.data);
            const videoWebSafe = `data:${event.video.contentType};base64,${videoBuffer.toString('base64')}`;
            eventData.video = videoWebSafe;
        }

        res.status(200).json({ event: eventData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});


router.delete('/deleteEvent/:eventId', requireAuth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        await Event.findByIdAndDelete(req.params.eventId);

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});



module.exports = router;


