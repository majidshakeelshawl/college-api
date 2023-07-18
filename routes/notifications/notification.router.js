const router = require('express').Router();

const { requireAuth } = require('../../middlewares/auth/authMiddleware');

router.get('/', requireAuth, (req, res) => {
    res.send('Notifications');
});

router.get('/test', (req, res) => {
    res.send('Notifications');
});

module.exports = router;