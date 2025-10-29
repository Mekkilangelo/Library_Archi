/**
 * @file book.js
 * @description Classe représentant un livre dans le catalogue de la bibliothèque.
 * Contient toutes les informations relatives à un livre, y compris sa disponibilité.
 */

class Book {
  /**
   * @description Constructeur de la classe Book
   * @param {string} id - Identifiant unique du livre
   * @param {string} title - Titre du livre
   * @param {string} author - Auteur du livre
   * @param {string} genre - Genre littéraire du livre
   * @param {string} coverImageUrl - URL de l'image de couverture du livre
   * @param {boolean} isAvailable - Statut de disponibilité du livre (par défaut true)
   */
  constructor(id, title, author, genre, coverImageUrl, isAvailable = true) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.genre = genre;
    
    /**
     * @property {string} coverImageUrl - URL vers l'image de couverture du livre
     */
    this.coverImageUrl = coverImageUrl;
    
    /**
     * @property {boolean} isAvailable - Indique si le livre est disponible pour l'emprunt
     */
    this.isAvailable = isAvailable;
  }

  /**
   * @description Marque le livre comme emprunté (non disponible)
   */
  markAsBorrowed() {
    this.isAvailable = false;
  }

  /**
   * @description Marque le livre comme retourné (disponible)
   */
  markAsAvailable() {
    this.isAvailable = true;
  }

  /**
   * @description Retourne une représentation textuelle du livre
   * @returns {string} Représentation du livre
   */
  toString() {
    const status = this.isAvailable ? 'Disponible' : 'Emprunté';
    return `"${this.title}" par ${this.author} (${this.genre}) - ${status}`;
  }
}

module.exports = Book;
