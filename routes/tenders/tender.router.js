const router = require('express').Router();
const multer = require('multer');
// Multer configuration to handle image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Models
const Tender = require('../../models/tender/tender.model');

const { requireAuth } = require('../../middlewares/auth/authMiddleware');


router.post('/addTender', requireAuth, upload.single('image'), async (req, res) => {
    const { title, body, tenderDate, videoURL } = req.body;
    try {
        const tender = new Tender({ title, body, tenderDate, userId: req.user.userId, videoURL });
        if (req.file) {
            tender.image.data = req.file.buffer;
            tender.image.contentType = req.file.mimetype;
        }
        else {
            tender.image.data = null;
            tender.image.contentType = null;
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

        const tenders = await Tender.find().skip(startIndex).limit(perPage);

        const tendersWithImages = tenders.map((tender) => {
            if (tender.image.data !== undefined && tender.image.data !== null) {
                const imageBuffer = Buffer.from(tender.image.data);
                const imageWebSafe = `data:${tender.image.contentType};base64,${imageBuffer.toString('base64')}`;

                // Create a new object with tender data and the image URL
                return {
                    _id: tender._id,
                    title: tender.title,
                    body: tender.body,
                    tenderDate: tender.tenderDate,
                    image: imageWebSafe,
                    videoURL: tender.videoURL,
                };
            }
            else {
                return {
                    _id: tender._id,
                    title: tender.title,
                    body: tender.body,
                    tenderDate: tender.tenderDate,
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
                tender.image.data = req.file.buffer;
                tender.image.contentType = req.file.mimetype;
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