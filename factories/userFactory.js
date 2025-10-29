/**
 * @file userFactory.js
 * @description Implémentation du pattern Factory Method.
 * Cette factory crée différents types d'objets utilisateur (Member, Librarian, Admin)
 * en fonction du rôle spécifié.
 * 
 * PATTERN: Factory Method
 * OBJECTIF: Créer différents types d'objets utilisateur en fonction d'un rôle,
 * sans que le code client ait besoin de connaître les détails de l'instanciation.
 */

const User = require('../models/user');
const Member = require('../models/member');
const Librarian = require('../models/librarian');
const Admin = require('../models/admin');

class UserFactory {
  /**
   * @description Crée une instance d'utilisateur appropriée basée sur le rôle
   * C'est la méthode principale de la Factory qui décide quel type d'objet créer
   * @param {Object} data - Données de l'utilisateur
   * @param {string} data.id - ID de l'utilisateur
   * @param {string} data.email - Email de l'utilisateur
   * @param {string} data.name - Nom de l'utilisateur
   * @param {string} data.role - Rôle de l'utilisateur (Member, Librarian, Admin)
   * @returns {User|Member|Librarian|Admin} Instance de l'utilisateur appropriée
   * @throws {Error} Si le rôle est invalide
   */
  static createUser(data) {
    // Validation des données requises
    if (!data.id || !data.email || !data.name || !data.role) {
      throw new Error('Données utilisateur incomplètes: id, email, name et role sont requis');
    }

    // Utilisation d'un switch pour déterminer quel type d'utilisateur créer
    switch (data.role) {
      case 'Member':
        console.log(`Factory: Création d'un Member - ${data.name}`);
        return new Member(data.id, data.email, data.name);

      case 'Librarian':
        console.log(`Factory: Création d'un Librarian - ${data.name}`);
        return new Librarian(data.id, data.email, data.name);

      case 'Admin':
        console.log(`Factory: Création d'un Admin - ${data.name}`);
        return new Admin(data.id, data.email, data.name);

      default:
        // Si le rôle n'est pas reconnu, lever une erreur
        throw new Error(`Rôle utilisateur invalide: ${data.role}. Rôles valides: Member, Librarian, Admin`);
    }
  }

  /**
   * @description Crée un nouveau Member
   * Méthode utilitaire pour créer spécifiquement un Member
   * @param {string} id - ID du membre
   * @param {string} email - Email du membre
   * @param {string} name - Nom du membre
   * @returns {Member} Instance du membre
   */
  static createMember(id, email, name) {
    console.log(`Factory: Création directe d'un Member - ${name}`);
    return new Member(id, email, name);
  }

  /**
   * @description Crée un nouveau Librarian
   * Méthode utilitaire pour créer spécifiquement un Librarian
   * @param {string} id - ID du bibliothécaire
   * @param {string} email - Email du bibliothécaire
   * @param {string} name - Nom du bibliothécaire
   * @returns {Librarian} Instance du bibliothécaire
   */
  static createLibrarian(id, email, name) {
    console.log(`Factory: Création directe d'un Librarian - ${name}`);
    return new Librarian(id, email, name);
  }

  /**
   * @description Crée un nouveau Admin
   * Méthode utilitaire pour créer spécifiquement un Admin
   * @param {string} id - ID de l'administrateur
   * @param {string} email - Email de l'administrateur
   * @param {string} name - Nom de l'administrateur
   * @returns {Admin} Instance de l'administrateur
   */
  static createAdmin(id, email, name) {
    console.log(`Factory: Création directe d'un Admin - ${name}`);
    return new Admin(id, email, name);
  }

  /**
   * @description Retourne la liste des rôles valides
   * @returns {Array<string>} Liste des rôles disponibles
   */
  static getAvailableRoles() {
    return ['Member', 'Librarian', 'Admin'];
  }

  /**
   * @description Valide si un rôle est valide
   * @param {string} role - Rôle à valider
   * @returns {boolean} True si le rôle est valide
   */
  static isValidRole(role) {
    return this.getAvailableRoles().includes(role);
  }
}

module.exports = UserFactory;
