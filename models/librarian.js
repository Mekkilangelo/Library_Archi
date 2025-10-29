/**
 * @file librarian.js
 * @description Classe représentant un bibliothécaire.
 * Un bibliothécaire peut gérer le catalogue et approuver/rejeter les demandes d'emprunt.
 */

const User = require('./user');

class Librarian extends User {
  /**
   * @description Constructeur de la classe Librarian
   * @param {string} id - Identifiant unique du bibliothécaire
   * @param {string} email - Adresse email du bibliothécaire
   * @param {string} name - Nom complet du bibliothécaire
   */
  constructor(id, email, name) {
    super(id, email, name, 'Librarian');
  }

  /**
   * @description Vérifie si l'utilisateur a les permissions de bibliothécaire
   * @returns {boolean} Toujours true pour un Librarian
   */
  canManageBooks() {
    return true;
  }

  /**
   * @description Vérifie si l'utilisateur peut approuver des demandes d'emprunt
   * @returns {boolean} Toujours true pour un Librarian
   */
  canReviewRequests() {
    return true;
  }
}

module.exports = Librarian;
