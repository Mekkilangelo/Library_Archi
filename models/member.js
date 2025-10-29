/**
 * @file member.js
 * @description Classe représentant un membre de la bibliothèque.
 * Un membre peut consulter le catalogue et demander des emprunts.
 */

const User = require('./user');

class Member extends User {
  /**
   * @description Constructeur de la classe Member
   * @param {string} id - Identifiant unique du membre
   * @param {string} email - Adresse email du membre
   * @param {string} name - Nom complet du membre
   */
  constructor(id, email, name) {
    super(id, email, name, 'Member');
    
    /**
     * @property {Array<string>} borrowingHistory - Tableau contenant les IDs des emprunts du membre
     */
    this.borrowingHistory = [];
  }

  /**
   * @description Ajoute un ID d'emprunt à l'historique du membre
   * @param {string} borrowingId - ID de l'emprunt à ajouter
   */
  addBorrowingToHistory(borrowingId) {
    this.borrowingHistory.push(borrowingId);
  }
}

module.exports = Member;
