const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

/**
 * Routes pour la gestion des notifications
 */

// GET /api/notifications - Récupérer les notifications de l'utilisateur
router.get('/', (req, res) => notificationController.getNotifications(req, res));

// GET /api/notifications/count - Obtenir le nombre de notifications non lues
router.get('/count', (req, res) => notificationController.getUnreadCount(req, res));

// PUT /api/notifications/read-all - Marquer toutes les notifications comme lues
router.put('/read-all', (req, res) => notificationController.markAllAsRead(req, res));

// PUT /api/notifications/:id/read - Marquer une notification comme lue
router.put('/:id/read', (req, res) => notificationController.markAsRead(req, res));

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', (req, res) => notificationController.deleteNotification(req, res));

/**
 * Routes pour la watchlist
 */

// GET /api/watchlist - Obtenir la watchlist de l'utilisateur
router.get('/watchlist', (req, res) => notificationController.getWatchlist(req, res));

module.exports = router;
