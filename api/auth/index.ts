import express from 'express';
import authorize from './authorize+api.ts';
import token from './token+api.ts';
import callback from './callback+api.ts';

const router = express.Router();

// Type assertion to handle async route handlers
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/authorize', asyncHandler(authorize));
router.post('/token', asyncHandler(token));
router.get('/callback', asyncHandler(callback));

// TODO: Implement these routes
router.get('/session', (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

router.post('/logout', (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

router.post('/refresh', (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

export default router; 