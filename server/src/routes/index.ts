
import { Router } from 'express';
import authRoutes from '../features/auth/auth.routes';
import signalRoutes from '../features/signals/signals.routes';
import ipRoutes from '../features/ip/ip.routes';
import tradingRoutes from '../features/trading/trading.routes';
import analyticsRoutes from '../features/analytics/analytics.routes';
import { API_ROUTES } from '@/shared/config/constants';

const router = Router();

router.use(API_ROUTES.AUTH, authRoutes);
router.use(API_ROUTES.SIGNALS, signalRoutes);
router.use(API_ROUTES.IP, ipRoutes);
router.use(API_ROUTES.TRADING, tradingRoutes);
router.use(API_ROUTES.ANALYTICS, analyticsRoutes);

export default router;
