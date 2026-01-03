
import express from 'express';
import { searchPlaces, reverseGeocode, getIpLocation } from '../controllers/locationController.js';
// import { protect } from '../middlewares/authMiddleware.js'; // Optional: protect these routes if needed

const router = express.Router();

router.get('/search', searchPlaces);
router.get('/reverse', reverseGeocode);
router.get('/ip', getIpLocation);

export default router;
