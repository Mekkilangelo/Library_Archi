/**
 * @file userService.js
 * @description Service pour gérer les opérations liées aux utilisateurs.
 * Utilise le Singleton DatabaseConnection pour accéder à Firestore.
 */

const database = require('./database');
const UserFactory = require('../factories/userFactory');

class UserService {
  constructor() {
    /**
     * @property {admin.firestore.Firestore} db - Instance Firestore obtenue via le Singleton
     */
    this.db = database.getDB();
    
    /**
     * @property {string} COLLECTION_NAME - Nom de la collection Firestore pour les utilisateurs
     */
    this.COLLECTION_NAME = 'users';
  }

  /**
   * @description Trouve un utilisateur par son ID
   * @param {string} userId - ID de l'utilisateur à rechercher
   * @returns {Promise<Object|null>} Objet utilisateur ou null si non trouvé
   */
  async findUserById(userId) {
    try {
      const userDoc = await this.db.collection(this.COLLECTION_NAME).doc(userId).get();
      
      if (!userDoc.exists) {
        return null;
      }

      const userData = { id: userDoc.id, ...userDoc.data() };
      
      // Utiliser la Factory pour créer l'instance appropriée
      return UserFactory.createUser(userData);
    } catch (error) {
      console.error(`Erreur lors de la recherche de l'utilisateur ${userId}:`, error);
      throw new Error('Impossible de récupérer l\'utilisateur');
    }
  }

  /**
   * @description Trouve un utilisateur par son email
   * @param {string} email - Email de l'utilisateur à rechercher
   * @returns {Promise<Object|null>} Objet utilisateur ou null si non trouvé
   */
  async findUserByEmail(email) {
    try {
      const querySnapshot = await this.db
        .collection(this.COLLECTION_NAME)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() };
      
      // Utiliser la Factory pour créer l'instance appropriée
      return UserFactory.createUser(userData);
    } catch (error) {
      console.error(`Erreur lors de la recherche de l'utilisateur par email ${email}:`, error);
      throw new Error('Impossible de récupérer l\'utilisateur');
    }
  }

  /**
   * @description Crée un nouvel utilisateur dans Firestore
   * @param {Object} userData - Données de l'utilisateur à créer
   * @returns {Promise<Object>} Utilisateur créé
   */
  async createUser(userData) {
    try {
      const docRef = await this.db.collection(this.COLLECTION_NAME).add(userData);
      const newUser = { id: docRef.id, ...userData };
      
      return UserFactory.createUser(newUser);
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw new Error('Impossible de créer l\'utilisateur');
    }
  }

  /**
   * @description Met à jour les données d'un utilisateur
   * @param {string} userId - ID de l'utilisateur à mettre à jour
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Object>} Utilisateur mis à jour
   */
  async updateUser(userId, updateData) {
    try {
      await this.db.collection(this.COLLECTION_NAME).doc(userId).update(updateData);
      return await this.findUserById(userId);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId}:`, error);
      throw new Error('Impossible de mettre à jour l\'utilisateur');
    }
  }

  /**
   * @description Récupère tous les utilisateurs
   * @returns {Promise<User[]>} Liste de tous les utilisateurs
   */
  async findAllUsers() {
    try {
      const querySnapshot = await this.db.collection(this.COLLECTION_NAME).get();
      const users = [];

      querySnapshot.forEach(doc => {
        const userData = { id: doc.id, ...doc.data() };
        users.push(UserFactory.createUser(userData));
      });

      return users;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw new Error('Impossible de récupérer les utilisateurs');
    }
  }

  /**
   * @description Récupère tous les utilisateurs ayant un rôle spécifique
   * @param {string} role - Rôle à rechercher (Member, Librarian, Admin)
   * @returns {Promise<User[]>} Liste des utilisateurs avec ce rôle
   */
  async findUsersByRole(role) {
    try {
      const querySnapshot = await this.db
        .collection(this.COLLECTION_NAME)
        .where('role', '==', role)
        .get();
      
      const users = [];

      querySnapshot.forEach(doc => {
        const userData = { id: doc.id, ...doc.data() };
        users.push(UserFactory.createUser(userData));
      });

      console.log(`✓ ${users.length} utilisateur(s) trouvé(s) avec le rôle ${role}`);
      return users;
    } catch (error) {
      console.error(`Erreur lors de la récupération des utilisateurs avec le rôle ${role}:`, error);
      throw new Error('Impossible de récupérer les utilisateurs par rôle');
    }
  }

  /**
   * @description Met à jour le rôle d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {string} newRole - Nouveau rôle (Member, Librarian, Admin)
   * @returns {Promise<void>}
   */
  async updateUserRole(userId, newRole) {
    try {
      await this.db.collection(this.COLLECTION_NAME).doc(userId).update({
        role: newRole
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      throw new Error('Impossible de mettre à jour le rôle');
    }
  }
}

module.exports = new UserService();
