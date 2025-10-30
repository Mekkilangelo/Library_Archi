const NotificationObserver = require('./notificationObserver');
const notificationService = require('../../services/notificationService');
const Notification = require('../../models/notification');

/**
 * Observer pour les retards
 * Notifie les membres quand un livre est en retard
 */
class OverdueObserver extends NotificationObserver {
  /**
   * @param {Object} data - { userId, userName, bookTitle, bookId, dueDate, daysOverdue }
   */
  async update(data) {
    try {
      const { userId, userName, bookTitle, bookId, dueDate, daysOverdue } = data;

      console.log(`⚠️ OverdueObserver: Retard pour ${userName} - "${bookTitle}"`);

      const dueDateStr = new Date(dueDate).toLocaleDateString('fr-FR');
      const message = daysOverdue === 1
        ? `⚠️ Le livre "${bookTitle}" est en retard d'1 jour (échéance: ${dueDateStr})`
        : `⚠️ Le livre "${bookTitle}" est en retard de ${daysOverdue} jours (échéance: ${dueDateStr})`;

      await notificationService.createNotification(
        Notification.Types.OVERDUE,
        message,
        userId,
        bookId,
        null
      );

      console.log(`  ✓ Utilisateur ${userName} notifié du retard`);
    } catch (error) {
      console.error('❌ Erreur OverdueObserver:', error);
    }
  }

  getType() {
    return Notification.Types.OVERDUE;
  }
}

module.exports = OverdueObserver;
