const database = require('./database');

/**
 * Service de gestion de la watchlist des livres
 * Permet aux utilisateurs de s'inscrire pour être notifiés quand un livre devient disponible
 */
class WatchlistService {
  constructor() {
    this.collectionName = 'watchlist';
    this.db = database.getDB();
  }

  /**
   * Ajouter un livre à la watchlist d'un utilisateur
   * @param {string} userId - ID utilisateur
   * @param {string} bookId - ID livre
   * @returns {Promise<string>} - ID de l'entrée watchlist
   */
  async addToWatchlist(userId, bookId) {
    try {
      // Vérifier si déjà dans la watchlist
      const existing = await this.isInWatchlist(userId, bookId);
      if (existing) {
        console.log(`⚠️ Livre ${bookId} déjà dans la watchlist de ${userId}`);
        return existing;
      }

      const watchlistEntry = {
        userId,
        bookId,
        createdAt: new Date()
      };

      const docRef = await this.db.collection(this.collectionName).add(watchlistEntry);
      console.log(`👁️ Livre ${bookId} ajouté à la watchlist de ${userId}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur ajout watchlist:', error);
      throw error;
    }
  }

  /**
   * Retirer un livre de la watchlist d'un utilisateur
   * @param {string} userId - ID utilisateur
   * @param {string} bookId - ID livre
   * @returns {Promise<boolean>}
   */
  async removeFromWatchlist(userId, bookId) {
    try {
      const snapshot = await this.db.collection(this.collectionName)
        .where('userId', '==', userId)
        .where('bookId', '==', bookId)
        .get();

      if (snapshot.empty) {
        console.log(`⚠️ Livre ${bookId} non trouvé dans la watchlist de ${userId}`);
        return false;
      }

      const batch = this.db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`✓ Livre ${bookId} retiré de la watchlist de ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression watchlist:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un livre est dans la watchlist d'un utilisateur
   * @param {string} userId - ID utilisateur
   * @param {string} bookId - ID livre
   * @returns {Promise<string|null>} - ID de l'entrée ou null
   */
  async isInWatchlist(userId, bookId) {
    try {
      const snapshot = await this.db.collection(this.collectionName)
        .where('userId', '==', userId)
        .where('bookId', '==', bookId)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur vérification watchlist:', error);
      return null;
    }
  }

  /**
   * Obtenir la watchlist d'un utilisateur
   * @param {string} userId - ID utilisateur
   * @returns {Promise<Array>} - Liste des bookIds
   */
  async getUserWatchlist(userId) {
    try {
      const snapshot = await this.db.collection(this.collectionName)
        .where('userId', '==', userId)
        .get();

      const watchlist = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        watchlist.push({
          id: doc.id,
          bookId: data.bookId,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        });
      });

      return watchlist;
    } catch (error) {
      console.error('❌ Erreur récupération watchlist:', error);
      return [];
    }
  }

  /**
   * Obtenir tous les watchers d'un livre
   * @param {string} bookId - ID livre
   * @returns {Promise<Array>} - Liste des userIds qui surveillent ce livre
   */
  async getBookWatchers(bookId) {
    try {
      const snapshot = await this.db.collection(this.collectionName)
        .where('bookId', '==', bookId)
        .get();

      const watchers = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        watchers.push({
          id: doc.id,
          userId: data.userId,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        });
      });

      console.log(`👁️ ${watchers.length} watcher(s) pour le livre ${bookId}`);
      return watchers;
    } catch (error) {
      console.error('❌ Erreur récupération watchers:', error);
      return [];
    }
  }

  /**
   * Supprimer tous les watchers d'un livre (après notification)
   * @param {string} bookId - ID livre
   * @returns {Promise<number>} - Nombre supprimé
   */
  async clearBookWatchers(bookId) {
    try {
      const snapshot = await this.db.collection(this.collectionName)
        .where('bookId', '==', bookId)
        .get();

      const batch = this.db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`🧹 ${snapshot.size} watcher(s) supprimé(s) pour le livre ${bookId}`);
      return snapshot.size;
    } catch (error) {
      console.error('❌ Erreur nettoyage watchers:', error);
      return 0;
    }
  }

  /**
   * Compter le nombre de watchers pour un livre
   * @param {string} bookId - ID livre
   * @returns {Promise<number>}
   */
  async getWatcherCount(bookId) {
    try {
      const snapshot = await this.db.collection(this.collectionName)
        .where('bookId', '==', bookId)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('❌ Erreur comptage watchers:', error);
      return 0;
    }
  }
}

module.exports = new WatchlistService();
