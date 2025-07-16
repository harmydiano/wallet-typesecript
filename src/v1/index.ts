import { Router } from 'express';
import user from './rest/user/user.route';
import wallet from './rest/wallet/wallet.route';

const router = Router();
router.use('/users', user);
router.use('/wallet', wallet);

export default router; 