/**
 * Modèle Notification
 * Représente une notification pour un utilisateur
 */
class Notification {
  /**
   * @param {string} id - Identifiant unique
   * @param {string} type - Type de notification (DUE_DATE_REMINDER, OVERDUE, NEW_REQUEST, BOOK_AVAILABLE)
   * @param {string} message - Message de la notification
   * @param {string} userId - ID de l'utilisateur destinataire
   * @param {string|null} bookId - ID du livre concerné (optionnel)
   * @param {string|null} requestId - ID de la demande concernée (optionnel)
   * @param {boolean} read - Statut de lecture
   * @param {Date} createdAt - Date de création
   */
  constructor(id, type, message, userId, bookId = null, requestId = null, read = false, createdAt = new Date()) {
    this.id = id;
    this.type = type;
    this.message = message;
    this.userId = userId;
    this.bookId = bookId;
    this.requestId = requestId;
    this.read = read;
    this.createdAt = createdAt;
  }

  /**
   * Marquer la notification comme lue
   */
  markAsRead() {
    this.read = true;
  }

  /**
   * Obtenir une représentation JSON de la notification
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      message: this.message,
      userId: this.userId,
      bookId: this.bookId,
      requestId: this.requestId,
      read: this.read,
      createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt
    };
  }

  /**
   * Créer une instance depuis les données Firestore
   */
  static fromFirestore(id, data) {
    return new Notification(
      id,
      data.type,
      data.message,
      data.userId,
      data.bookId || null,
      data.requestId || null,
      data.read || false,
      data.createdAt?.toDate?.() || new Date(data.createdAt)
    );
  }

  /**
   * Obtenir les données pour Firestore
   */
  toFirestore() {
    return {
      type: this.type,
      message: this.message,
      userId: this.userId,
      bookId: this.bookId,
      requestId: this.requestId,
      read: this.read,
      createdAt: this.createdAt
    };
  }
}

// Types de notifications
Notification.Types = {
  DUE_DATE_REMINDER: 'DUE_DATE_REMINDER', // Rappel 2 jours avant échéance
  OVERDUE: 'OVERDUE',                     // Livre en retard
  NEW_REQUEST: 'NEW_REQUEST',             // Nouvelle demande d'emprunt (pour librarians)
  BOOK_AVAILABLE: 'BOOK_AVAILABLE'        // Livre disponible (watchlist)
};

module.exports = Notification;
