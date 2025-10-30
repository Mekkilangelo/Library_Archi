const NotificationObserver = require('./notificationObserver');
const notificationService = require('../../services/notificationService');
const Notification = require('../../models/notification');

/**
 * Observer pour les rappels d'échéance
 * Notifie les membres 2 jours avant la date de retour
 */
class DueDateReminderObserver extends NotificationObserver {
  /**
   * @param {Object} data - { userId, userName, bookTitle, bookId, dueDate }
   */
  async update(data) {
    try {
      const { userId, userName, bookTitle, bookId, dueDate } = data;

      console.log(`⏰ DueDateReminderObserver: Rappel pour ${userName} - "${bookTitle}"`);

      const dueDateStr = new Date(dueDate).toLocaleDateString('fr-FR');

      await notificationService.createNotification(
        Notification.Types.DUE_DATE_REMINDER,
        `⏰ Rappel: Le livre "${bookTitle}" est à retourner le ${dueDateStr} (dans 2 jours)`,
        userId,
        bookId,
        null
      );

      console.log(`  ✓ Utilisateur ${userName} notifié du rappel`);
    } catch (error) {
      console.error('❌ Erreur DueDateReminderObserver:', error);
    }
  }

  getType() {
    return Notification.Types.DUE_DATE_REMINDER;
  }
}

module.exports = DueDateReminderObserver;
