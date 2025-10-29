/**
 * @file bookServiceProxy.js
 * @description Implémentation du pattern Proxy (Protection Proxy).
 * Ce proxy agit comme un "garde du corps" pour le BookService réel.
 * Il contrôle l'accès aux méthodes sensibles en vérifiant les permissions de l'utilisateur.
 * 
 * PATTERN: Proxy (Protection Proxy)
 * OBJECTIF: Contrôler l'accès aux méthodes sensibles du BookService.
 * Vérifie le rôle de l'utilisateur avant d'autoriser des actions comme addBook ou updateBook.
 */

const bookService = require('./bookService');

class BookServiceProxy {
  constructor() {
    /**
     * @property {BookService} realBookService - Instance du vrai service de livres
     * Le proxy délègue les opérations à ce service après avoir vérifié les permissions
     */
    this.realBookService = bookService;
  }

  /**
   * @description Méthode privée pour vérifier si l'utilisateur est admin ou bibliothécaire
   * @param {Object} user - Objet utilisateur à vérifier
   * @returns {boolean} True si l'utilisateur a les permissions nécessaires
   * @private
   */
  _isAuthorized(user) {
    if (!user) {
      return false;
    }
    
    return user.role === 'Admin' || user.role === 'Librarian';
  }

  /**
   * @description Méthode privée pour vérifier si l'utilisateur est admin
   * @param {Object} user - Objet utilisateur à vérifier
   * @returns {boolean} True si l'utilisateur est admin
   * @private
   */
  _isAdmin(user) {
    if (!user) {
      return false;
    }
    
    return user.role === 'Admin';
  }

  /**
   * @description Ajoute un nouveau livre (PROTÉGÉ - nécessite permissions)
   * Seuls les Admin et Librarian peuvent ajouter des livres
   * @param {Object} bookData - Données du livre à ajouter
   * @param {Object} user - Utilisateur qui effectue l'action
   * @returns {Promise<Book>} Le livre créé
   * @throws {Error} Si l'utilisateur n'a pas les permissions
   */
  async addBook(bookData, user) {
    // Vérification des permissions AVANT de déléguer au vrai service
    if (!this._isAuthorized(user)) {
      console.warn(`Tentative non autorisée d'ajout de livre par ${user?.email || 'utilisateur inconnu'}`);
      throw new Error('Accès refusé: Seuls les administrateurs et bibliothécaires peuvent ajouter des livres');
    }

    console.log(`✓ Autorisation accordée pour l'ajout de livre par ${user.email} (${user.role})`);
    
    // Déléguer au vrai service
    return await this.realBookService.addBook(bookData);
  }

  /**
   * @description Met à jour un livre (PROTÉGÉ - nécessite permissions)
   * Seuls les Admin et Librarian peuvent modifier des livres
   * @param {string} bookId - ID du livre à mettre à jour
   * @param {Object} updateData - Données à mettre à jour
   * @param {Object} user - Utilisateur qui effectue l'action
   * @returns {Promise<Book>} Le livre mis à jour
   * @throws {Error} Si l'utilisateur n'a pas les permissions
   */
  async updateBook(bookId, updateData, user) {
    // Vérification des permissions AVANT de déléguer au vrai service
    if (!this._isAuthorized(user)) {
      console.warn(`Tentative non autorisée de modification de livre par ${user?.email || 'utilisateur inconnu'}`);
      throw new Error('Accès refusé: Seuls les administrateurs et bibliothécaires peuvent modifier des livres');
    }

    console.log(`✓ Autorisation accordée pour la modification du livre ${bookId} par ${user.email} (${user.role})`);
    
    // Déléguer au vrai service
    return await this.realBookService.updateBook(bookId, updateData);
  }

  /**
   * @description Supprime un livre (PROTÉGÉ - nécessite permissions)
   * Les Admin et Librarian peuvent supprimer des livres
   * @param {string} bookId - ID du livre à supprimer
   * @param {Object} user - Utilisateur qui effectue l'action
   * @returns {Promise<void>}
   * @throws {Error} Si l'utilisateur n'a pas les permissions
   */
  async deleteBook(bookId, user) {
    // Admin et Librarian peuvent supprimer
    if (!this._isAuthorized(user)) {
      console.warn(`Tentative non autorisée de suppression de livre par ${user?.email || 'utilisateur inconnu'}`);
      throw new Error('Accès refusé: Seuls les administrateurs et bibliothécaires peuvent supprimer des livres');
    }

    console.log(`✓ Autorisation accordée pour la suppression du livre ${bookId} par ${user.email} (${user.role})`);
    
    // Déléguer au vrai service
    return await this.realBookService.deleteBook(bookId);
  }

  /**
   * @description Trouve un livre par son ID (PUBLIC - pas de vérification nécessaire)
   * Tous les utilisateurs peuvent consulter les livres
   * @param {string} bookId - ID du livre à rechercher
   * @returns {Promise<Book|null>} Le livre trouvé ou null
   */
  async findBookById(bookId) {
    // Méthode publique - délégation directe sans vérification
    return await this.realBookService.findBookById(bookId);
  }

  /**
   * @description Recherche des livres (PUBLIC - pas de vérification nécessaire)
   * Tous les utilisateurs peuvent rechercher des livres
   * @param {Object} query - Critères de recherche
   * @returns {Promise<Array<Book>>} Liste des livres correspondants
   */
  async findBooks(query = {}) {
    // Méthode publique - délégation directe sans vérification
    return await this.realBookService.findBooks(query);
  }

  /**
   * @description Récupère tous les livres (PUBLIC - pas de vérification nécessaire)
   * Tous les utilisateurs peuvent consulter le catalogue
   * @returns {Promise<Array<Book>>} Liste de tous les livres
   */
  async findAllBooks() {
    // Méthode publique - délégation directe sans vérification
    return await this.realBookService.findAllBooks();
  }
}

/**
 * @description Export de l'instance unique du proxy
 * C'est cette instance qui doit être utilisée dans toute l'application,
 * PAS le bookService directement
 */
module.exports = new BookServiceProxy();
