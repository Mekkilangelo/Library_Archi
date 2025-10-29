/**
 * @file user.js
 * @description Classe de base pour tous les utilisateurs du système.
 * Cette classe représente l'entité utilisateur générique avec les propriétés communes.
 */

class User {
  /**
   * @description Constructeur de la classe User
   * @param {string} id - Identifiant unique de l'utilisateur
   * @param {string} email - Adresse email de l'utilisateur
   * @param {string} name - Nom complet de l'utilisateur
   * @param {string} role - Rôle de l'utilisateur (Member, Librarian, Admin)
   */
  constructor(id, email, name, role) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.role = role;
  }

  /**
   * @description Retourne une représentation textuelle de l'utilisateur
   * @returns {string} Représentation de l'utilisateur
   */
  toString() {
    return `${this.name} (${this.role}) - ${this.email}`;
  }
}

module.exports = User;
