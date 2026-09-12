import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';
import { characterOptions, getCharacterStatus, saveCharacter } from '../services/character.js';

const router = Router();
router.use(verifyFirebaseToken);

router.get('/status', async (req, res, next) => {
  try {
    const status = await getCharacterStatus(req.user.uid);
    if (!status) return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    return res.json({ success: true, ...status, options: characterOptions });
  } catch (error) { return next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const saved = await saveCharacter(req.user.uid, req.body || {});
    if (!saved) return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    return res.json({ success: true, ...saved });
  } catch (error) {
    if (error.message) return res.status(400).json({ success: false, message: error.message });
    return next(error);
  }
});

export default router;
