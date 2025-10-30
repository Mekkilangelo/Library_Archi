/**
 * Observer Pattern - Subject
 * Gère la liste des observers et déclenche les notifications
 */
class NotificationSubject {
  constructor() {
    if (NotificationSubject.instance) {
      return NotificationSubject.instance;
    }
    this.observers = new Map(); // Map<type, Set<Observer>>
    NotificationSubject.instance = this;
  }

  /**
   * Attacher un observer pour un type de notification spécifique
   * @param {string} type - Type de notification (DUE_DATE_REMINDER, OVERDUE, NEW_REQUEST, etc.)
   * @param {NotificationObserver} observer - L'observer à attacher
   */
  attach(type, observer) {
    if (!this.observers.has(type)) {
      this.observers.set(type, new Set());
    }
    this.observers.get(type).add(observer);
    console.log(`📢 Observer attaché pour le type: ${type}`);
  }

  /**
   * Détacher un observer
   * @param {string} type - Type de notification
   * @param {NotificationObserver} observer - L'observer à détacher
   */
  detach(type, observer) {
    if (this.observers.has(type)) {
      this.observers.get(type).delete(observer);
      console.log(`📢 Observer détaché pour le type: ${type}`);
    }
  }

  /**
   * Notifier tous les observers d'un type spécifique
   * @param {string} type - Type de notification
   * @param {Object} data - Données à transmettre aux observers
   */
  async notify(type, data) {
    console.log(`📢 Notification du type: ${type}`);
    if (this.observers.has(type)) {
      const observersSet = this.observers.get(type);
      const promises = [];
      
      for (const observer of observersSet) {
        promises.push(observer.update(data));
      }
      
      await Promise.all(promises);
      console.log(`  ✓ ${promises.length} observer(s) notifié(s)`);
    } else {
      console.log(`  ⚠ Aucun observer pour le type: ${type}`);
    }
  }

  /**
   * Obtenir le nombre d'observers pour un type
   * @param {string} type - Type de notification
   * @returns {number} - Nombre d'observers
   */
  getObserverCount(type) {
    return this.observers.has(type) ? this.observers.get(type).size : 0;
  }

  /**
   * Réinitialiser tous les observers (utile pour les tests)
   */
  reset() {
    this.observers.clear();
    console.log('📢 Tous les observers ont été réinitialisés');
  }
}

// Export singleton
module.exports = new NotificationSubject();
