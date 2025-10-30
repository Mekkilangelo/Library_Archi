const notificationService = require('../services/notificationService');
const watchlistService = require('../services/watchlistService');
const bookService = require('../services/bookService');

/**
 * Contrôleur pour la gestion des notifications et de la watchlist
 */
class NotificationController {
  /**
   * GET /api/notifications
   * Récupérer les notifications de l'utilisateur connecté
   */
  async getNotifications(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const unreadOnly = req.query.unread === 'true';
      const notifications = await notificationService.getNotificationsByUser(userId, unreadOnly);
      
      res.json({
        success: true,
        notifications: notifications.map(n => n.toJSON())
      });
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/notifications/count
   * Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const count = await notificationService.getUnreadCount(userId);
      
      res.json({
        success: true,
        count: count
      });
    } catch (error) {
      console.error('❌ Erreur comptage notifications:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/notifications/:id/read
   * Marquer une notification comme lue
   */
  async markAsRead(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const notificationId = req.params.id;
      await notificationService.markAsRead(notificationId, userId);
      
      res.json({
        success: true,
        message: 'Notification marquée comme lue'
      });
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/notifications/read-all
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const count = await notificationService.markAllAsRead(userId);
      
      res.json({
        success: true,
        count: count,
        message: `${count} notification(s) marquée(s) comme lue(s)`
      });
    } catch (error) {
      console.error('❌ Erreur marquage toutes notifications:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Supprimer une notification
   */
  async deleteNotification(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const notificationId = req.params.id;
      await notificationService.deleteNotification(notificationId, userId);
      
      res.json({
        success: true,
        message: 'Notification supprimée'
      });
    } catch (error) {
      console.error('❌ Erreur suppression notification:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/books/:id/watch
   * Ajouter un livre à la watchlist (me notifier quand disponible)
   */
  async addToWatchlist(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const bookId = req.params.id;

      // Vérifier que le livre existe
      const book = await bookService.findBookById(bookId);
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé' });
      }

      // Vérifier que le livre n'est pas disponible
      if (book.availableQuantity > 0) {
        return res.status(400).json({ 
          error: 'Ce livre est actuellement disponible',
          availableQuantity: book.availableQuantity
        });
      }

      const watchlistId = await watchlistService.addToWatchlist(userId, bookId);
      
      res.json({
        success: true,
        watchlistId: watchlistId,
        message: `Vous serez notifié quand "${book.title}" sera disponible`
      });
    } catch (error) {
      console.error('❌ Erreur ajout watchlist:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/books/:id/watch
   * Retirer un livre de la watchlist
   */
  async removeFromWatchlist(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const bookId = req.params.id;
      const removed = await watchlistService.removeFromWatchlist(userId, bookId);
      
      if (!removed) {
        return res.status(404).json({ error: 'Livre non trouvé dans votre watchlist' });
      }

      res.json({
        success: true,
        message: 'Livre retiré de votre watchlist'
      });
    } catch (error) {
      console.error('❌ Erreur suppression watchlist:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/watchlist
   * Obtenir la watchlist de l'utilisateur
   */
  async getWatchlist(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const watchlist = await watchlistService.getUserWatchlist(userId);
      
      // Enrichir avec les informations des livres
      const enrichedWatchlist = await Promise.all(
        watchlist.map(async (item) => {
          const book = await bookService.findBookById(item.bookId);
          return {
            id: item.id,
            bookId: item.bookId,
            createdAt: item.createdAt,
            book: book ? {
              title: book.title,
              author: book.author,
              availableQuantity: book.availableQuantity,
              totalQuantity: book.totalQuantity
            } : null
          };
        })
      );

      res.json({
        success: true,
        watchlist: enrichedWatchlist
      });
    } catch (error) {
      console.error('❌ Erreur récupération watchlist:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/books/:id/watching
   * Vérifier si l'utilisateur surveille ce livre
   */
  async isWatching(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const bookId = req.params.id;
      const watchlistId = await watchlistService.isInWatchlist(userId, bookId);
      
      res.json({
        success: true,
        watching: watchlistId !== null,
        watchlistId: watchlistId
      });
    } catch (error) {
      console.error('❌ Erreur vérification watchlist:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new NotificationController();
