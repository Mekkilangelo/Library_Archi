const NotificationObserver = require('./notificationObserver');
const notificationService = require('../../services/notificationService');
const Notification = require('../../models/notification');

/**
 * Observer pour les nouvelles demandes d'emprunt
 * Notifie les bibliothécaires quand une nouvelle demande est créée
 */
class NewRequestObserver extends NotificationObserver {
  /**
   * @param {Object} data - { requestId, userId, userName, bookTitle, bookId }
   */
  async update(data) {
    try {
      const { requestId, userId, userName, bookTitle, bookId, librarians } = data;

      console.log(`📬 NewRequestObserver: Nouvelle demande de ${userName} pour "${bookTitle}"`);

      // Notifier tous les bibliothécaires
      if (librarians && librarians.length > 0) {
        const notificationPromises = librarians.map(librarian =>
          notificationService.createNotification(
            Notification.Types.NEW_REQUEST,
            `📚 Nouvelle demande d'emprunt de ${userName} pour "${bookTitle}"`,
            librarian.id,
            bookId,
            requestId
          )
        );

        await Promise.all(notificationPromises);
        console.log(`  ✓ ${librarians.length} bibliothécaire(s) notifié(s)`);
      }
    } catch (error) {
      console.error('❌ Erreur NewRequestObserver:', error);
    }
  }

  getType() {
    return Notification.Types.NEW_REQUEST;
  }
}

module.exports = NewRequestObserver;
