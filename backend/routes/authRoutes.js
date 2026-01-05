const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    updateUserProfile,
    getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router
    .route('/profile')
    .put(protect, upload.single('profileImage'), updateUserProfile)
    .get(protect, getUserProfile);

module.exports = router;
