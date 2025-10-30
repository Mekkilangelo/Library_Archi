/**
 * Observer Pattern - Interface Observer
 * Interface pour tous les observers qui reçoivent des notifications
 */
class NotificationObserver {
  /**
   * Méthode appelée par le Subject pour notifier l'observer
   * @param {Object} data - Données de la notification
   */
  update(data) {
    throw new Error('La méthode update() doit être implémentée');
  }

  /**
   * Type de notification que cet observer gère
   * @returns {string} - Type de notification
   */
  getType() {
    throw new Error('La méthode getType() doit être implémentée');
  }
}

module.exports = NotificationObserver;
