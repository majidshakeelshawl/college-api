const router = require('express').Router();
const multer = require('multer');
const moment = require('moment')
const path = require('path');

// Multer configuration to handle image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'www/static/events');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });


// Models
const Event = require('../../models/event/event.model');

const { requireAuth } = require('../../middlewares/auth/authMiddleware');

router.post('/addEvent',
    requireAuth,
    upload.single('image'),
    async (req, res) => {
        const { title, body, videoURL, eventDate } = req.body;
        try {
            const event = new Event({ title, body, userId: req.user.userId, videoURL, eventDate });

            // Check if an image file was uploaded
            if (req.file) {
                event.image = req.file.filename;
            } else {
                event.image = null;
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
            .sort({ createdAt: -1 });

        const eventsWithMedia = events.map((event) => {
            const eventData = {
                _id: event._id,
                title: event.title,
                body: event.body,
                eventDate: moment.utc(event.eventDate).format('YYYY-MMMM-DD'),
                videoURL: event.videoURL,
            };

            if (event.image !== undefined && event.image !== null) {
                eventData.image = `${process.env.PROD_URL}/event_images/${event.image}`;
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
    upload.single('image'),
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
                event.eventDate = new Date(eventDate);


            // Check if an image file was uploaded
            if (req.file) {
                event.image = req.file.filename;
            }

            await event.save();

            res.status(200).json({ message: 'Event updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Something went wrong', errorMessage: error.message });
        }
    });

module.exports = router;


