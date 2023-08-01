const router = require('express').Router();
const multer = require('multer');
const moment = require('moment')
const path = require('path');
// Multer configuration to handle image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'www/static/tenders');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

// Models
const Tender = require('../../models/tender/tender.model');

const { requireAuth } = require('../../middlewares/auth/authMiddleware');


router.post('/addTender', requireAuth, upload.single('image'), async (req, res) => {
    const { title, body, tenderDate, videoURL } = req.body;
    try {
        const tender = new Tender({ title, body, tenderDate, userId: req.user.userId, videoURL });
        if (req.file) {
            tender.image = req.file.filename;
        }
        else {
            tender.image = null;
        }
        await tender.save();

        res.status(201).json({ message: 'Tender created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong', errorMessage: error.message });
    }
});

router.get('/getAllTenders', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;
        const startIndex = (page - 1) * perPage;
        const endIndex = page * perPage;

        const totalTenders = await Tender.countDocuments();
        const totalPages = Math.ceil(totalTenders / perPage);

        const tenders = await Tender.find().skip(startIndex).limit(perPage)
            .sort({ createdAt: -1 });

        const tendersWithImages = tenders.map((tender) => {
            if (tender.image !== undefined && tender.image !== null) {
                const image = tender.image;

                // Create a new object with tender data and the image URL
                return {
                    _id: tender._id,
                    title: tender.title,
                    body: tender.body,
                    tenderDate: moment.utc(tender.tenderDate).format('YYYY-MMMM-DD'),
                    image: `${process.env.PROD_URL}/tender_images/${tender.image}`,
                    videoURL: tender.videoURL,
                };
            }
            else {
                return {
                    _id: tender._id,
                    title: tender.title,
                    body: tender.body,
                    tenderDate: moment.utc(tender.tenderDate).format('YYYY-MMMM-DD'),
                    image: null,
                    videoURL: tender.videoURL,
                };
            }
        });

        res.status(200).json({
            totalTenders: totalTenders,
            totalPages: totalPages,
            currentPage: page,
            tenders: tendersWithImages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.delete('/deleteTender/:id', requireAuth, async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id);

        if (tender) {
            await Tender.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Tender deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'Tender not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.put('/updateTender/:id', requireAuth, upload.single('image'), async (req, res) => {
    const { title, body, tenderDate, videoURL } = req.body;
    try {
        const tender = await Tender.findById(req.params.id);

        if (tender) {
            title ? tender.title = title : null;
            body ? tender.body = body : null;
            tenderDate ? tender.tenderDate = tenderDate : null;
            videoURL ? tender.videoURL = videoURL : null;
            if (req.file) {
                tender.image = req.file.filename;
            }
            await tender.save();

            res.status(200).json({ message: 'Tender updated successfully' });
        }
        else {
            res.status(404).json({ error: 'Tender not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;