const router = require('express').Router();
const multer = require('multer');
const moment = require('moment')
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
    upload.fields([{ name: 'image', maxCount: 1 }]),
    async (req, res) => {
        const { title, body, videoURL, eventDate } = req.body;
        try {
            const event = new Event({ title, body, userId: req.user.userId, videoURL, eventDate });

            // Check if an image file was uploaded
            if (req.files && req.files.image && req.files.image[0]) {
                event.image.data = req.files.image[0].buffer;
                event.image.contentType = req.files.image[0].mimetype;
            } else {
                event.image.data = null;
                event.image.contentType = null;
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
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        // Calculate the skip value based on the page number and items per page
        const skip = (page - 1) * perPage;

        // Fetch the total count of events
        const totalCount = await Event.countDocuments();

        // Fetch the events for the specified page using skip and limit
        const events = await Event.find()
            .skip(skip)
            .limit(perPage)
            .sort({ eventDate: -1 });

        const eventsWithMedia = events.map((event) => {
            const eventData = {
                _id: event._id,
                title: event.title,
                body: event.body,
                userId: event.userId,
                eventDate: moment.utc(event.eventDate).format('YYYY-MMMM-DD'),
                videoURL: event.videoURL,
            };

            if (event.image.data !== undefined && event.image.data !== null) {
                const imageBuffer = Buffer.from(event.image.data);
                const imageWebSafe = `data:${event.image.contentType};base64,${imageBuffer.toString('base64')}`;
                eventData.image = imageWebSafe;
            }

            return eventData;
        });

        res.status(200).json({
            totalEvents: totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / perPage),
            events: eventsWithMedia,
        });
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
            videoURL: event.videoURL,
            eventDate: event.eventDate,
        };

        if (event.image.data !== undefined && event.image.data !== null) {
            const imageBuffer = Buffer.from(event.image.data);
            const imageWebSafe = `data:${event.image.contentType};base64,${imageBuffer.toString('base64')}`;
            eventData.image = imageWebSafe;
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

router.put('/updateEvent/:eventId', requireAuth,
    upload.fields([{ name: 'image', maxCount: 1 }]),
    async (req, res) => {
        const { title, body, videoURL, eventDate } = req.body;
        try {
            const event = await Event.findById(req.params.eventId);

            if (!event) {
                return res.status(404).json({ error: 'Event not found' });
            }
            if (title)
                event.title = title;
            if (body)
                event.body = body;
            if (videoURL)
                event.videoURL = videoURL;
            if (eventDate)
                event.eventDate = eventDate;


            // Check if an image file was uploaded
            if (req.files && req.files.image && req.files.image[0]) {
                event.image.data = req.files.image[0].buffer;
                event.image.contentType = req.files.image[0].mimetype
            }

            await event.save();

            res.status(200).json({ message: 'Event updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Something went wrong', errorMessage: error.message });
        }
    });

module.exports = router;


