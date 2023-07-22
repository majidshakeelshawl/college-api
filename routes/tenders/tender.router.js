const router = require('express').Router();
const multer = require('multer');
// Multer configuration to handle image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Models
import Tender from '../../models/tender/tender.model';

import { requireAuth } from '../../middlewares/auth/authMiddleware';


router.post('/addTender', requireAuth, upload.single('image'), async (req, res) => {
    const { title, body, tenderDate } = req.body;
    try {
        const tender = new Tender({ title, body, tenderDate, userId: req.user.userId });
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
        const tenders = await Tender.find();

        const tendersWithImages = tenders.map((tender) => {
            console.log("TENDER: ", tender);
            console.log("IMAGE ERROR: ", tender.image.data)
            if (tender.image.data !== undefined && tender.image.data !== null) {
                const imageBuffer = Buffer.from(tender.image.data);
                const imageWebSafe = `data:${tender.image.contentType};base64,${imageBuffer.toString('base64')}`;

                // Create a new object with tender data and the image URL
                return {
                    _id: tender._id,
                    title: tender.title,
                    body: tender.body,
                    userId: tender.userId,
                    tenderDate: tender.tenderDate,
                    image: imageWebSafe,
                    createdAt: tender.createdAt,
                    updatedAt: tender.updatedAt,
                };
            }
            else {
                return {
                    _id: tender._id,
                    title: tender.title,
                    body: tender.body,
                    userId: tender.userId,
                    tenderDate: tender.tenderDate,
                    image: null,
                    createdAt: tender.createdAt,
                    updatedAt: tender.updatedAt,
                };
            }
        });

        res.status(200).json({ tenders: tendersWithImages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/getTender/:id', async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id);

        if (tender) {
            const imageBuffer = Buffer.from(tender.image.data);
            const imageWebSafe = `data:${tender.image.contentType};base64,${imageBuffer.toString('base64')}`;

            const tenderWithImage = {
                _id: tender._id,
                title: tender.title,
                body: tender.body,
                userId: tender.userId,
                tenderDate: tender.tenderDate,
                image: imageWebSafe,
                createdAt: tender.createdAt,
                updatedAt: tender.updatedAt,
            };

            res.status(200).json({ tender: tenderWithImage });
        }
        else {
            res.status(404).json({ error: 'Tender not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.delete('/deleteTender/:id', requireAuth, async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id);

        if (tender) {
            await tender.remove();
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
    const { title, body, tenderDate } = req.body;
    try {
        const tender = await Tender.findById(req.params.id);

        if (tender) {
            tender.title = title;
            tender.body = body;
            tender.tenderDate = tenderDate;
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
