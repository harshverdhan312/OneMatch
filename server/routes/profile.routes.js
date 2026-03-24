const express = require('express');
const profileController = require('../controllers/profile.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { uploadMiddleware } = require('../services/upload.service');

const router = express.Router();

router.use(requireAuth);

router.get('/', profileController.getProfile.bind(profileController));
router.put('/basic-info', profileController.saveBasicInfo.bind(profileController));
router.put('/preferences', profileController.savePreferences.bind(profileController));
router.put('/interests', profileController.saveInterests.bind(profileController));
router.put('/questions', profileController.saveQuestions.bind(profileController));
router.put('/spotify', profileController.connectSpotify.bind(profileController));

router.patch('/', profileController.editProfile.bind(profileController));
router.post('/photos', uploadMiddleware.single('photo'), profileController.uploadPhoto.bind(profileController));

module.exports = router;
