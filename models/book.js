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
   * @param {number} totalQuantity - Nombre total d'exemplaires (par défaut 1)
   * @param {number} availableQuantity - Nombre d'exemplaires disponibles (par défaut = totalQuantity)
   */
  constructor(id, title, author, genre, coverImageUrl, totalQuantity = 1, availableQuantity = null) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.genre = genre;
    
    /**
     * @property {string} coverImageUrl - URL vers l'image de couverture du livre
     */
    this.coverImageUrl = coverImageUrl;
    
    /**
     * @property {number} totalQuantity - Nombre total d'exemplaires du livre
     */
    this.totalQuantity = totalQuantity;
    
    /**
     * @property {number} availableQuantity - Nombre d'exemplaires actuellement disponibles
     */
    this.availableQuantity = availableQuantity !== null ? availableQuantity : totalQuantity;
    
    /**
     * @property {boolean} isAvailable - DEPRECATED: Calculé dynamiquement, gardé pour compatibilité
     * @deprecated Utilisez availableQuantity > 0 à la place
     */
    this.isAvailable = this.availableQuantity > 0;
  }

  /**
   * @description Décrémente la quantité disponible (emprunt)
   * @throws {Error} Si aucun exemplaire n'est disponible
   */
  markAsBorrowed() {
    if (this.availableQuantity <= 0) {
      throw new Error(`Aucun exemplaire de "${this.title}" n'est disponible`);
    }
    this.availableQuantity--;
    this.isAvailable = this.availableQuantity > 0;
  }

  /**
   * @description Incrémente la quantité disponible (retour)
   * @throws {Error} Si on essaie de retourner plus que la quantité totale
   */
  markAsAvailable() {
    if (this.availableQuantity >= this.totalQuantity) {
      throw new Error(`Impossible de retourner: tous les exemplaires de "${this.title}" sont déjà disponibles`);
    }
    this.availableQuantity++;
    this.isAvailable = this.availableQuantity > 0;
  }

  /**
   * @description Retourne une représentation textuelle du livre
   * @returns {string} Représentation du livre
   */
  toString() {
    return `"${this.title}" par ${this.author} (${this.genre}) - ${this.availableQuantity}/${this.totalQuantity} disponible(s)`;
  }
}

module.exports = Book;
