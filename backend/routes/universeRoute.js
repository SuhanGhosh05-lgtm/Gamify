import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';
import { completeOnboarding, completeQuest, createEntry, deleteEntry, enterUniverse, universeForUser, updateEntry } from '../services/universe.js';
import { getCharacterStatus } from '../services/character.js';

const router = Router();
router.use(verifyFirebaseToken);

const cleanText = (value, field, { required = false } = {}) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new Error(`${field} must be a string.`);
  const text = value.trim();
  if (required && !text) throw new Error(`${field} is required.`);
  return text || null;
};
const identifier = (value, field = 'id') => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required.`);
  return value.trim();
};
const entryData = (type, body, partial = false) => {
  const data = type === 'quest'
    ? {}
    : { name: cleanText(body.name, 'name', { required: !partial }) };
  if (type === 'quest') {
    delete data.name;
    data.title = cleanText(body.title, 'title', { required: !partial });
    data.description = cleanText(body.description, 'description');
    data.difficulty = cleanText(body.difficulty, 'difficulty');
    if (body.estimatedMinutes !== undefined) {
      if (!Number.isInteger(body.estimatedMinutes) || body.estimatedMinutes < 0) throw new Error('estimatedMinutes must be a non-negative integer.');
      data.estimatedMinutes = body.estimatedMinutes;
    }
    if (body.xpReward !== undefined) {
      if (!Number.isInteger(body.xpReward) || body.xpReward < 0) throw new Error('xpReward must be a non-negative integer.');
      data.xpReward = body.xpReward;
    }
  } else data.description = cleanText(body.description, 'description');
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
};
const respond = (handler) => async (req, res, next) => { try { await handler(req, res); } catch (error) { if (error.message) return res.status(400).json({ success: false, message: error.message }); next(error); } };

router.get('/', respond(async (req, res) => {
  const characterStatus = await getCharacterStatus(req.user.uid);
  if (characterStatus && !characterStatus.characterComplete) return res.status(403).json({ success: false, code: 'CHARACTER_REQUIRED', message: 'Create your character before entering the Universe.' });
  const universe = await universeForUser(req.user.uid);
  if (!universe) return res.status(404).json({ success: false, message: 'Universe not found. Please register first.' });
  return res.json({ success: true, universe });
}));

router.get('/entry', respond(async (req, res) => {
  const decision = await enterUniverse(req.user.uid);
  if (!decision) return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
  if (decision.characterRequired) return res.status(403).json({ success: false, code: 'CHARACTER_REQUIRED', message: 'Create your character before entering the Universe.' });
  return res.json({ success: true, ...decision });
}));

router.post('/onboarding', respond(async (req, res) => {
  const universe = await completeOnboarding(req.user.uid, req.body.selections, req.body.universeName);
  if (!universe) return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
  return res.json({ success: true, universe });
}));

for (const [type, parentKey] of [['village', null], ['ward', 'villageId'], ['house', 'wardId'], ['quest', 'houseId']]) {
  router.post(`/${type}s`, respond(async (req, res) => {
    const parentId = parentKey ? identifier(req.body[parentKey], parentKey) : null;
    const entry = await createEntry(type, parentId, entryData(type, req.body), req.user.uid);
    if (!entry) return res.status(404).json({ success: false, message: `Parent ${parentKey || 'universe'} was not found.` });
    return res.status(201).json({ success: true, [type]: entry });
  }));
  router.patch(`/${type}s/:id`, respond(async (req, res) => {
    const entry = await updateEntry(type, identifier(req.params.id), entryData(type, req.body, true), req.user.uid);
    if (!entry) return res.status(404).json({ success: false, message: `${type} not found.` });
    return res.json({ success: true, [type]: entry });
  }));
  router.delete(`/${type}s/:id`, respond(async (req, res) => {
    if (!await deleteEntry(type, identifier(req.params.id), req.user.uid)) return res.status(404).json({ success: false, message: `${type} not found.` });
    return res.status(204).end();
  }));
}

router.post('/quests/:id/complete', respond(async (req, res) => {
  const result = await completeQuest(identifier(req.params.id), req.user.uid);
  if (result.status === 'not-found') return res.status(404).json({ success: false, message: 'Quest not found.' });
  if (result.status === 'already-completed') return res.status(409).json({ success: false, message: 'Quest has already been completed.' });
  return res.json({ success: true, quest: result.quest });
}));

export default router;
