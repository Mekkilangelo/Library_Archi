/**
 * @file bookService.js
 * @description Le VRAI service qui gère la logique métier des livres.
 * Ce service ne se préoccupe PAS des permissions - il exécute simplement les opérations.
 * Les contrôles d'accès sont gérés par le BookServiceProxy.
 */

const database = require('./database');
const Book = require('../models/book');

class BookService {
  constructor() {
    /**
     * @property {admin.firestore.Firestore} db - Instance Firestore obtenue via le Singleton
     */
    this.db = database.getDB();
    
    /**
     * @property {string} COLLECTION_NAME - Nom de la collection Firestore pour les livres
     */
    this.COLLECTION_NAME = 'books';
  }

  /**
   * @description Ajoute un nouveau livre au catalogue
   * @param {Object} bookData - Données du livre à ajouter
   * @param {string} bookData.title - Titre du livre
   * @param {string} bookData.author - Auteur du livre
   * @param {string} bookData.genre - Genre du livre
   * @param {string} bookData.coverImageUrl - URL de l'image de couverture
   * @param {number} bookData.totalQuantity - Nombre total d'exemplaires (défaut: 1)
   * @returns {Promise<Book>} Le livre créé
   */
  async addBook(bookData) {
    try {
      const totalQuantity = bookData.totalQuantity || 1;
      
      const newBookData = {
        title: bookData.title,
        author: bookData.author,
        genre: bookData.genre,
        coverImageUrl: bookData.coverImageUrl || '',
        totalQuantity: totalQuantity,
        availableQuantity: totalQuantity,
        isAvailable: true, // Pour compatibilité
        createdAt: Date.now()
      };

      const docRef = await this.db.collection(this.COLLECTION_NAME).add(newBookData);
      
      return new Book(
        docRef.id,
        newBookData.title,
        newBookData.author,
        newBookData.genre,
        newBookData.coverImageUrl,
        newBookData.totalQuantity,
        newBookData.availableQuantity
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livre:', error);
      throw new Error('Impossible d\'ajouter le livre');
    }
  }

  /**
   * @description Met à jour les informations d'un livre
   * @param {string} bookId - ID du livre à mettre à jour
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Book>} Le livre mis à jour
   */
  async updateBook(bookId, updateData) {
    try {
      // Nettoyer les champs undefined
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = updateData[key];
        }
      });

      cleanData.updatedAt = Date.now();

      await this.db.collection(this.COLLECTION_NAME).doc(bookId).update(cleanData);
      return await this.findBookById(bookId);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du livre ${bookId}:`, error);
      throw new Error('Impossible de mettre à jour le livre');
    }
  }

  /**
   * @description Trouve un livre par son ID
   * @param {string} bookId - ID du livre à rechercher
   * @returns {Promise<Book|null>} Le livre trouvé ou null
   */
  async findBookById(bookId) {
    try {
      const doc = await this.db.collection(this.COLLECTION_NAME).doc(bookId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return new Book(
        doc.id,
        data.title,
        data.author,
        data.genre,
        data.coverImageUrl || '',
        data.totalQuantity || 1,
        data.availableQuantity !== undefined ? data.availableQuantity : (data.totalQuantity || 1)
      );
    } catch (error) {
      console.error(`Erreur lors de la recherche du livre ${bookId}:`, error);
      throw new Error('Impossible de récupérer le livre');
    }
  }

  /**
   * @description Recherche des livres selon des critères
   * @param {Object} query - Critères de recherche (title, author, genre, isAvailable)
   * @returns {Promise<Array<Book>>} Liste des livres correspondants
   */
  async findBooks(query = {}) {
    try {
      let dbQuery = this.db.collection(this.COLLECTION_NAME);

      // Appliquer les filtres si fournis
      if (query.title) {
        dbQuery = dbQuery.where('title', '>=', query.title)
                        .where('title', '<=', query.title + '\uf8ff');
      }

      if (query.author) {
        dbQuery = dbQuery.where('author', '==', query.author);
      }

      if (query.genre) {
        dbQuery = dbQuery.where('genre', '==', query.genre);
      }

      if (query.isAvailable !== undefined) {
        dbQuery = dbQuery.where('isAvailable', '==', query.isAvailable);
      }

      const querySnapshot = await dbQuery.get();
      const books = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        books.push(new Book(
          doc.id,
          data.title,
          data.author,
          data.genre,
          data.coverImageUrl || '',
          data.totalQuantity || 1,
          data.availableQuantity !== undefined ? data.availableQuantity : (data.totalQuantity || 1)
        ));
      });

      return books;
    } catch (error) {
      console.error('Erreur lors de la recherche de livres:', error);
      throw new Error('Impossible de rechercher les livres');
    }
  }

  /**
   * @description Récupère tous les livres du catalogue
   * @returns {Promise<Array<Book>>} Liste de tous les livres
   */
  async findAllBooks() {
    try {
      const querySnapshot = await this.db.collection(this.COLLECTION_NAME).get();
      const books = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        books.push(new Book(
          doc.id,
          data.title,
          data.author,
          data.genre,
          data.coverImageUrl || '',
          data.totalQuantity || 1,
          data.availableQuantity !== undefined ? data.availableQuantity : (data.totalQuantity || 1)
        ));
      });

      return books;
    } catch (error) {
      console.error('Erreur lors de la récupération des livres:', error);
      throw new Error('Impossible de récupérer les livres');
    }
  }

  /**
   * @description Supprime un livre du catalogue
   * @param {string} bookId - ID du livre à supprimer
   * @returns {Promise<void>}
   */
  async deleteBook(bookId) {
    try {
      await this.db.collection(this.COLLECTION_NAME).doc(bookId).delete();
    } catch (error) {
      console.error(`Erreur lors de la suppression du livre ${bookId}:`, error);
      throw new Error('Impossible de supprimer le livre');
    }
  }
}

module.exports = new BookService();
