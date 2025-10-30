const database = require('./database');
const Notification = require('../models/notification');

/**
 * Service de gestion des notifications
 * CRUD + logique métier pour les notifications
 */
class NotificationService {
  constructor() {
    this.collectionName = 'notifications';
    this.db = database.getDB();
  }

  /**
   * Créer une nouvelle notification
   * @param {string} type - Type de notification
   * @param {string} message - Message
   * @param {string} userId - ID utilisateur
   * @param {string|null} bookId - ID livre (optionnel)
   * @param {string|null} requestId - ID demande (optionnel)
   * @returns {Promise<Notification>}
   */
  async createNotification(type, message, userId, bookId = null, requestId = null) {
    try {
      const notification = new Notification(
        null,
        type,
        message,
        userId,
        bookId,
        requestId,
        false,
        new Date()
      );

      const docRef = await this.db.collection(this.collectionName).add(notification.toFirestore());
      notification.id = docRef.id;

      console.log(`🔔 Notification créée: ${type} pour user ${userId}`);
      return notification;
    } catch (error) {
      console.error('❌ Erreur création notification:', error);
      throw error;
    }
  }

  /**
   * Récupérer les notifications d'un utilisateur
   * @param {string} userId - ID utilisateur
   * @param {boolean} unreadOnly - Récupérer uniquement les non lues
   * @returns {Promise<Notification[]>}
   */
  async getNotificationsByUser(userId, unreadOnly = false) {
    try {
      let query = this.db.collection(this.collectionName)
        .where('userId', '==', userId);

      if (unreadOnly) {
        query = query.where('read', '==', false);
      }

      const snapshot = await query.get();
      const notifications = [];

      snapshot.forEach(doc => {
        notifications.push(Notification.fromFirestore(doc.id, doc.data()));
      });

      // Sort in memory to avoid needing a Firestore composite index
      notifications.sort((a, b) => b.createdAt - a.createdAt);

      return notifications;
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      throw error;
    }
  }

  /**
   * Marquer une notification comme lue
   * @param {string} notificationId - ID notification
   * @param {string} userId - ID utilisateur (pour vérification)
   * @returns {Promise<boolean>}
   */
  async markAsRead(notificationId, userId) {
    try {
      const docRef = this.db.collection(this.collectionName).doc(notificationId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Notification non trouvée');
      }

      const data = doc.data();
      if (data.userId !== userId) {
        throw new Error('Non autorisé à modifier cette notification');
      }

      await docRef.update({ read: true });
      console.log(`✓ Notification ${notificationId} marquée comme lue`);
      return true;
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
      throw error;
    }
  }

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   * @param {string} userId - ID utilisateur
   * @returns {Promise<number>} - Nombre de notifications marquées
   */
  async markAllAsRead(userId) {
    try {
      const snapshot = await this.db.collection(this.collectionName)
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      const batch = this.db.batch();
      snapshot.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
      console.log(`✓ ${snapshot.size} notification(s) marquée(s) comme lues`);
      return snapshot.size;
    } catch (error) {
      console.error('❌ Erreur marquage toutes notifications:', error);
      throw error;
    }
  }

  /**
   * Supprimer une notification
   * @param {string} notificationId - ID notification
   * @param {string} userId - ID utilisateur (pour vérification)
   * @returns {Promise<boolean>}
   */
  async deleteNotification(notificationId, userId) {
    try {
      const docRef = this.db.collection(this.collectionName).doc(notificationId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Notification non trouvée');
      }

      const data = doc.data();
      if (data.userId !== userId) {
        throw new Error('Non autorisé à supprimer cette notification');
      }

      await docRef.delete();
      console.log(`✓ Notification ${notificationId} supprimée`);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression notification:', error);
      throw error;
    }
  }

  /**
   * Compter les notifications non lues d'un utilisateur
   * @param {string} userId - ID utilisateur
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    try {
      const snapshot = await this.db.collection(this.collectionName)
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('❌ Erreur comptage notifications:', error);
      return 0;
    }
  }

  /**
   * Nettoyer les anciennes notifications (> 30 jours)
   * @returns {Promise<number>} - Nombre supprimé
   */
  async cleanOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Récupérer toutes les anciennes notifications et filtrer en mémoire
      const snapshot = await this.db.collection(this.collectionName)
        .where('createdAt', '<', thirtyDaysAgo)
        .get();

      const batch = this.db.batch();
      let count = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Filtrer uniquement les notifications lues en mémoire
        if (data.read === true) {
          batch.delete(doc.ref);
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        console.log(`🧹 ${count} anciennes notifications supprimées`);
      }
      
      return count;
    } catch (error) {
      console.error('❌ Erreur nettoyage notifications:', error);
      return 0;
    }
  }
}

module.exports = new NotificationService();
