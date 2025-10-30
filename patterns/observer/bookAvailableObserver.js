const NotificationObserver = require('./notificationObserver');
const notificationService = require('../../services/notificationService');
const Notification = require('../../models/notification');

/**
 * Observer pour la disponibilité des livres
 * Notifie les utilisateurs dans la watchlist quand un livre redevient disponible
 */
class BookAvailableObserver extends NotificationObserver {
  /**
   * @param {Object} data - { bookId, bookTitle, watchers }
   */
  async update(data) {
    try {
      const { bookId, bookTitle, watchers } = data;

      console.log(`📖 BookAvailableObserver: "${bookTitle}" est disponible`);

      if (watchers && watchers.length > 0) {
        const notificationPromises = watchers.map(watcher =>
          notificationService.createNotification(
            Notification.Types.BOOK_AVAILABLE,
            `📖 Bonne nouvelle ! Le livre "${bookTitle}" est maintenant disponible`,
            watcher.userId,
            bookId,
            null
          )
        );

        await Promise.all(notificationPromises);
        console.log(`  ✓ ${watchers.length} utilisateur(s) notifié(s)`);
      }
    } catch (error) {
      console.error('❌ Erreur BookAvailableObserver:', error);
    }
  }

  getType() {
    return Notification.Types.BOOK_AVAILABLE;
  }
}

module.exports = BookAvailableObserver;
