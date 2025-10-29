/**
 * @file borrowing.js
 * @description Classe représentant un enregistrement d'emprunt.
 * Un emprunt commence comme une demande (pending) qui peut être approuvée ou rejetée.
 */

class Borrowing {
  /**
   * @description Constructeur de la classe Borrowing
   * @param {string} id - Identifiant unique de l'emprunt
   * @param {string} userId - ID de l'utilisateur qui fait la demande
   * @param {string} bookId - ID du livre demandé
   * @param {number} requestDate - Timestamp de la date de demande
   */
  constructor(id, userId, bookId, requestDate) {
    this.id = id;
    this.userId = userId;
    this.bookId = bookId;
    
    /**
     * @property {number} requestDate - Date à laquelle la demande a été faite
     */
    this.requestDate = requestDate;
    
    /**
     * @property {string} status - Statut de la demande
     * Valeurs possibles: 'pending', 'approved', 'rejected', 'returned'
     */
    this.status = 'pending';
    
    /**
     * @property {number|null} approvalDate - Date d'approbation par le bibliothécaire
     */
    this.approvalDate = null;
    
    /**
     * @property {number|null} dueDate - Date de retour prévue (calculée lors de l'approbation)
     */
    this.dueDate = null;
    
    /**
     * @property {number|null} returnDate - Date de retour réelle du livre
     */
    this.returnDate = null;
  }

  /**
   * @description Approuve la demande d'emprunt
   * @param {number} durationInDays - Durée de l'emprunt en jours (par défaut 14 jours)
   */
  approve(durationInDays = 14) {
    this.status = 'approved';
    this.approvalDate = Date.now();
    // Calcul de la date de retour prévue
    this.dueDate = this.approvalDate + (durationInDays * 24 * 60 * 60 * 1000);
  }

  /**
   * @description Rejette la demande d'emprunt
   */
  reject() {
    this.status = 'rejected';
  }

  /**
   * @description Marque le livre comme retourné
   */
  markAsReturned() {
    this.status = 'returned';
    this.returnDate = Date.now();
  }

  /**
   * @description Vérifie si l'emprunt est en retard
   * @returns {boolean} True si l'emprunt est en retard
   */
  isOverdue() {
    if (this.status !== 'approved' || !this.dueDate) {
      return false;
    }
    return Date.now() > this.dueDate;
  }
}

module.exports = Borrowing;
