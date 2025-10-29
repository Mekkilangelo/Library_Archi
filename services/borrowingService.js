/**
 * @file borrowingService.js
 * @description Service pour gérer les opérations d'emprunt de livres.
 * Gère le cycle de vie complet d'une demande d'emprunt: création, approbation, rejet, retour.
 */

const database = require('./database');
const Borrowing = require('../models/borrowing');

class BorrowingService {
  constructor() {
    /**
     * @property {admin.firestore.Firestore} db - Instance Firestore obtenue via le Singleton
     */
    this.db = database.getDB();
    
    /**
     * @property {string} COLLECTION_NAME - Nom de la collection Firestore pour les emprunts
     */
    this.COLLECTION_NAME = 'borrowings';
  }

  /**
   * @description Crée une nouvelle demande d'emprunt avec le statut 'pending'
   * @param {string} userId - ID de l'utilisateur qui fait la demande
   * @param {string} bookId - ID du livre demandé
   * @returns {Promise<Borrowing>} La demande d'emprunt créée
   */
  async createBorrowingRequest(userId, bookId) {
    try {
      const borrowingData = {
        userId,
        bookId,
        requestDate: Date.now(),
        status: 'pending',
        approvalDate: null,
        dueDate: null,
        returnDate: null
      };

      const docRef = await this.db.collection(this.COLLECTION_NAME).add(borrowingData);
      
      return new Borrowing(docRef.id, userId, bookId, borrowingData.requestDate);
    } catch (error) {
      console.error('Erreur lors de la création de la demande d\'emprunt:', error);
      throw new Error('Impossible de créer la demande d\'emprunt');
    }
  }

  /**
   * @description Récupère toutes les demandes d'emprunt en attente
   * @returns {Promise<Array<Borrowing>>} Liste des demandes en attente
   */
  async findPendingRequests() {
    try {
      const querySnapshot = await this.db
        .collection(this.COLLECTION_NAME)
        .where('status', '==', 'pending')
        .get();

      const requests = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const borrowing = new Borrowing(doc.id, data.userId, data.bookId, data.requestDate);
        borrowing.status = data.status;
        requests.push(borrowing);
      });

      // Tri en mémoire au lieu de Firestore
      requests.sort((a, b) => new Date(a.requestDate) - new Date(b.requestDate));

      return requests;
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes en attente:', error);
      throw new Error('Impossible de récupérer les demandes en attente');
    }
  }

  /**
   * @description Trouve une demande d'emprunt par son ID
   * @param {string} requestId - ID de la demande à rechercher
   * @returns {Promise<Borrowing|null>} La demande trouvée ou null
   */
  async findRequestById(requestId) {
    try {
      const doc = await this.db.collection(this.COLLECTION_NAME).doc(requestId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      const borrowing = new Borrowing(doc.id, data.userId, data.bookId, data.requestDate);
      
      // Restaurer tous les champs
      borrowing.status = data.status;
      borrowing.approvalDate = data.approvalDate;
      borrowing.dueDate = data.dueDate;
      borrowing.returnDate = data.returnDate;

      return borrowing;
    } catch (error) {
      console.error(`Erreur lors de la recherche de la demande ${requestId}:`, error);
      throw new Error('Impossible de récupérer la demande');
    }
  }

  /**
   * @description Met à jour une demande d'emprunt
   * @param {string} requestId - ID de la demande à mettre à jour
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Borrowing>} La demande mise à jour
   */
  async updateRequest(requestId, updateData) {
    try {
      await this.db.collection(this.COLLECTION_NAME).doc(requestId).update(updateData);
      return await this.findRequestById(requestId);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la demande ${requestId}:`, error);
      throw new Error('Impossible de mettre à jour la demande');
    }
  }

  /**
   * @description Marque un emprunt comme retourné
   * @param {string} borrowingId - ID de l'emprunt à marquer comme retourné
   * @returns {Promise<Borrowing>} L'emprunt mis à jour
   */
  async markAsReturned(borrowingId) {
    try {
      const updateData = {
        status: 'returned',
        returnDate: Date.now()
      };

      await this.db.collection(this.COLLECTION_NAME).doc(borrowingId).update(updateData);
      return await this.findRequestById(borrowingId);
    } catch (error) {
      console.error(`Erreur lors du retour de l'emprunt ${borrowingId}:`, error);
      throw new Error('Impossible de marquer l\'emprunt comme retourné');
    }
  }

  /**
   * @description Récupère l'historique des emprunts d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Array<Borrowing>>} Liste des emprunts de l'utilisateur
   */
  async findUserBorrowingHistory(userId) {
    try {
      const querySnapshot = await this.db
        .collection(this.COLLECTION_NAME)
        .where('userId', '==', userId)
        .get();

      const history = [];
      
      // Récupérer les emprunts avec les données des livres
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const borrowing = new Borrowing(doc.id, data.userId, data.bookId, data.requestDate);
        
        borrowing.status = data.status;
        borrowing.approvalDate = data.approvalDate;
        borrowing.dueDate = data.dueDate;
        borrowing.returnDate = data.returnDate;
        
        // Enrichir avec les données du livre
        try {
          const bookDoc = await this.db.collection('books').doc(data.bookId).get();
          if (bookDoc.exists) {
            const bookData = bookDoc.data();
            borrowing.bookTitle = bookData.title;
            borrowing.bookAuthor = bookData.author;
          }
        } catch (bookError) {
          console.error(`Erreur lors de la récupération du livre ${data.bookId}:`, bookError);
          borrowing.bookTitle = 'Titre inconnu';
        }
        
        history.push(borrowing);
      }

      // Tri en mémoire au lieu de Firestore
      history.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

      return history;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'historique de l'utilisateur ${userId}:`, error);
      throw new Error('Impossible de récupérer l\'historique d\'emprunts');
    }
  }

  /**
   * @description Récupère tous les emprunts par statut
   * @param {string} status - Statut des emprunts à rechercher
   * @returns {Promise<Borrowing[]>} Liste des emprunts correspondants
   */
  async findBorrowingsByStatus(status) {
    try {
      const querySnapshot = await this.db
        .collection(this.COLLECTION_NAME)
        .where('status', '==', status)
        .get();

      const borrowings = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const borrowing = new Borrowing(doc.id, data.userId, data.bookId, data.requestDate);
        borrowing.status = data.status;
        borrowing.approvalDate = data.approvalDate;
        borrowing.dueDate = data.dueDate;
        borrowing.returnDate = data.returnDate;
        borrowings.push(borrowing);
      });

      // Tri par date d'approbation (les plus récents en premier)
      borrowings.sort((a, b) => (b.approvalDate || 0) - (a.approvalDate || 0));

      return borrowings;
    } catch (error) {
      console.error(`Erreur lors de la récupération des emprunts avec status ${status}:`, error);
      throw new Error(`Impossible de récupérer les emprunts avec status ${status}`);
    }
  }

  /**
   * @description Vérifie si un utilisateur a déjà une demande en cours pour un livre
   * @param {string} userId - ID de l'utilisateur
   * @param {string} bookId - ID du livre
   * @returns {Promise<boolean>} True si une demande en cours existe
   */
  async hasPendingRequestForBook(userId, bookId) {
    try {
      const querySnapshot = await this.db
        .collection(this.COLLECTION_NAME)
        .where('userId', '==', userId)
        .where('bookId', '==', bookId)
        .where('status', '==', 'pending')
        .limit(1)
        .get();

      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erreur lors de la vérification des demandes en cours:', error);
      throw new Error('Impossible de vérifier les demandes en cours');
    }
  }
}

module.exports = new BorrowingService();
