/**
 * @file admin.js
 * @description Classe représentant un administrateur du système.
 * Un administrateur possède tous les privilèges et peut gérer les comptes utilisateurs.
 */

const User = require('./user');

class Admin extends User {
  /**
   * @description Constructeur de la classe Admin
   * @param {string} id - Identifiant unique de l'administrateur
   * @param {string} email - Adresse email de l'administrateur
   * @param {string} name - Nom complet de l'administrateur
   */
  constructor(id, email, name) {
    super(id, email, name, 'Admin');
  }

  /**
   * @description Vérifie si l'utilisateur a les permissions de gestion du catalogue
   * @returns {boolean} Toujours true pour un Admin
   */
  canManageBooks() {
    return true;
  }

  /**
   * @description Vérifie si l'utilisateur peut approuver des demandes d'emprunt
   * @returns {boolean} Toujours true pour un Admin
   */
  canReviewRequests() {
    return true;
  }

  /**
   * @description Vérifie si l'utilisateur peut gérer d'autres utilisateurs
   * @returns {boolean} Toujours true pour un Admin
   */
  canManageUsers() {
    return true;
  }
}

module.exports = Admin;
