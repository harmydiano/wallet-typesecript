import { Router } from 'express';
import response from '../../../middleware/response';
import UserController from './user.controller';
import auth from '../../middleware/auth';

const router = Router();
const userCtrl = new UserController();

// User registration route
router.route('/register')
  .post(userCtrl.register.bind(userCtrl), response);

// User login route
router.route('/login')
  .post(userCtrl.login.bind(userCtrl), response);

// User profile route (requires authentication)
router.route('/profile')
  .get(auth, userCtrl.profile.bind(userCtrl), response);

export default router; 