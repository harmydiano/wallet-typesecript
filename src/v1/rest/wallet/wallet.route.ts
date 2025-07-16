import { Router } from 'express';
import auth from '../../middleware/auth';
import response from '../../../middleware/response';
import WalletController from './wallet.controller';

const router = Router();
const walletCtrl = new WalletController();

// Wallet funding route
router.route('/fund')
  .post(auth, walletCtrl.fund.bind(walletCtrl), response);

// Wallet transfer route
router.route('/transfer')
  .post(auth, walletCtrl.transfer.bind(walletCtrl), response);

// Wallet withdrawal route
router.route('/withdraw')
  .post(auth, walletCtrl.withdraw.bind(walletCtrl), response);

// Wallet balance route
router.route('/balance')
  .get(auth, walletCtrl.balance.bind(walletCtrl), response);

// Wallet transactions route
router.route('/transactions')
  .get(auth, walletCtrl.transactions.bind(walletCtrl), response);

export default router; 