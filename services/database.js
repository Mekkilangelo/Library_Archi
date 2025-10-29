/**
 * @file database.js
 * @description Implémentation du pattern Singleton pour gérer la connexion Firebase.
 * Cette classe garantit qu'une seule instance de connexion Firebase existe dans toute l'application.
 * 
 * PATTERN: Singleton
 * OBJECTIF: Assurer une connexion unique et partagée au SDK Firebase Admin et à Firestore.
 */

const admin = require('firebase-admin');

class DatabaseConnection {
  /**
   * @description Constructeur privé (conceptuellement) de la classe DatabaseConnection
   * Initialise Firebase Admin SDK si ce n'est pas déjà fait
   */
  constructor() {
    // Vérifier si une instance existe déjà
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }

    // Vérifier si Firebase est déjà initialisé
    if (!admin.apps.length) {
      try {
        // Charger les credentials depuis le fichier de configuration
        const serviceAccount = require('../config/serviceAccountKey.json');
        
        /**
         * @description Initialisation de Firebase Admin SDK
         * Cette initialisation se fait une seule fois grâce au pattern Singleton
         */
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });

        console.log('✓ Firebase connected');
      } catch (error) {
        console.error('✗ Firebase error:', error.message);
        throw new Error('Impossible d\'initialiser Firebase Admin SDK');
      }
    }

    /**
     * @property {admin.firestore.Firestore} db - Instance Firestore
     */
    this.db = admin.firestore();

    /**
     * @property {admin.auth.Auth} auth - Instance Firebase Auth
     */
    this.auth = admin.auth();

    // Stocker l'instance unique
    DatabaseConnection.instance = this;
  }

  /**
   * @description Retourne l'instance Firestore
   * @returns {admin.firestore.Firestore} Instance de la base de données Firestore
   */
  getDB() {
    return this.db;
  }

  /**
   * @description Retourne l'instance Firebase Auth
   * @returns {admin.auth.Auth} Instance Firebase Authentication
   */
  getAuth() {
    return this.auth;
  }

  /**
   * @description Retourne l'instance singleton de DatabaseConnection
   * @returns {DatabaseConnection} Instance unique de la connexion
   */
  static getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}

// Initialisation de l'instance unique
const instance = new DatabaseConnection();

// Empêcher la modification de l'instance exportée
Object.freeze(instance);

/**
 * @description Export de l'instance unique (Singleton)
 * Cette instance sera partagée dans toute l'application
 */
module.exports = instance;
