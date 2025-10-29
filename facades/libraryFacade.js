/**
 * @file libraryFacade.js
 * @description Implémentation du pattern Facade.
 * Cette facade simplifie les opérations complexes en plusieurs étapes,
 * comme demander un livre, approuver/rejeter une demande, ou retourner un livre.
 * 
 * PATTERN: Facade
 * OBJECTIF: Simplifier les opérations complexes en plusieurs étapes en fournissant
 * une interface unifiée qui orchestre plusieurs services (UserService, BorrowingService, BookService).
 */

const userService = require('../services/userService');
const borrowingService = require('../services/borrowingService');
const bookServiceProxy = require('../services/bookServiceProxy');

class LibraryFacade {
  /**
   * @description Orchestre l'action "demander un livre"
   * Cette méthode coordonne plusieurs étapes:
   * 1. Vérifier l'utilisateur existe
   * 2. Vérifier le livre existe et est disponible
   * 3. Vérifier l'utilisateur n'a pas déjà une demande en cours pour ce livre
   * 4. Créer la demande d'emprunt
   * 
   * @param {string} userId - ID de l'utilisateur qui fait la demande
   * @param {string} bookId - ID du livre demandé
   * @returns {Promise<Object>} La demande d'emprunt créée avec les informations du livre
   * @throws {Error} Si l'utilisateur, le livre n'existe pas, ou si le livre n'est pas disponible
   */
  async requestBook(userId, bookId) {
    try {
      console.log(`📚 Facade: Traitement de la demande d'emprunt - User: ${userId}, Book: ${bookId}`);

      // ÉTAPE 1: Vérifier que l'utilisateur existe
      const user = await userService.findUserById(userId);
      if (!user) {
        throw new Error(`Utilisateur ${userId} non trouvé`);
      }
      console.log(`  ✓ Utilisateur trouvé: ${user.name} (${user.role})`);

      // ÉTAPE 2: Vérifier que le livre existe
      const book = await bookServiceProxy.findBookById(bookId);
      if (!book) {
        throw new Error(`Livre ${bookId} non trouvé`);
      }
      console.log(`  ✓ Livre trouvé: "${book.title}" par ${book.author}`);

      // ÉTAPE 3: Vérifier que le livre est disponible
      if (!book.isAvailable) {
        throw new Error(`Le livre "${book.title}" n'est pas disponible actuellement`);
      }
      console.log(`  ✓ Livre disponible`);

      // ÉTAPE 4: Vérifier que l'utilisateur n'a pas déjà une demande en cours pour ce livre
      const hasPendingRequest = await borrowingService.hasPendingRequestForBook(userId, bookId);
      if (hasPendingRequest) {
        throw new Error(`Vous avez déjà une demande en cours pour ce livre`);
      }
      console.log(`  ✓ Pas de demande en cours pour ce livre`);

      // ÉTAPE 5: Créer la demande d'emprunt
      const borrowingRequest = await borrowingService.createBorrowingRequest(userId, bookId);
      console.log(`  ✓ Demande d'emprunt créée avec succès (ID: ${borrowingRequest.id})`);

      // Retourner la demande avec les informations du livre et de l'utilisateur
      return {
        borrowing: borrowingRequest,
        book: book,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        message: `Demande d'emprunt créée avec succès pour "${book.title}"`
      };

    } catch (error) {
      console.error(`✗ Erreur lors de la demande d'emprunt:`, error.message);
      throw error;
    }
  }

  /**
   * @description Orchestre l'action "examiner une demande" (approuver ou rejeter)
   * Cette méthode coordonne plusieurs étapes:
   * 1. Vérifier que l'utilisateur est bibliothécaire ou admin
   * 2. Récupérer la demande
   * 3. Si approbation: vérifier la disponibilité du livre, approuver et marquer le livre comme non disponible
   * 4. Si rejet: rejeter simplement
   * 
   * @param {Object} librarianUser - Utilisateur bibliothécaire qui examine la demande
   * @param {string} requestId - ID de la demande à examiner
   * @param {string} action - Action à effectuer ('approve' ou 'reject')
   * @param {string} returnDueDate - Date de retour prévue (optionnel)
   * @returns {Promise<Object>} Résultat de l'action avec les détails
   * @throws {Error} Si les permissions sont insuffisantes ou si une erreur survient
   */
  async reviewRequest(librarianUser, requestId, action, returnDueDate = null) {
    try {
      console.log(`📋 Facade: Examen de la demande ${requestId} - Action: ${action}`);

      // ÉTAPE 1: Vérifier que l'utilisateur a les permissions
      if (librarianUser.role !== 'Librarian' && librarianUser.role !== 'Admin') {
        throw new Error('Accès refusé: Seuls les bibliothécaires et administrateurs peuvent examiner les demandes');
      }
      console.log(`  ✓ Permissions vérifiées: ${librarianUser.name} (${librarianUser.role})`);

      // ÉTAPE 2: Récupérer la demande
      const request = await borrowingService.findRequestById(requestId);
      if (!request) {
        throw new Error(`Demande ${requestId} non trouvée`);
      }

      // Vérifier que la demande est en attente
      if (request.status !== 'pending') {
        throw new Error(`Cette demande a déjà été traitée (statut: ${request.status})`);
      }
      console.log(`  ✓ Demande trouvée (statut: ${request.status})`);

      // ÉTAPE 3: Traiter selon l'action
      if (action === 'reject') {
        // REJET: Simple mise à jour du statut
        await borrowingService.updateRequest(requestId, { status: 'rejected' });
        console.log(`  ✓ Demande rejetée`);

        return {
          success: true,
          action: 'rejected',
          requestId: requestId,
          message: 'Demande d\'emprunt rejetée'
        };

      } else if (action === 'approve') {
        // APPROBATION: Processus plus complexe
        
        // ÉTAPE 3a: Re-vérifier la disponibilité du livre (CRUCIAL pour éviter les conflits)
        const book = await bookServiceProxy.findBookById(request.bookId);
        if (!book) {
          throw new Error(`Livre ${request.bookId} non trouvé`);
        }

        if (!book.isAvailable) {
          throw new Error(`Le livre "${book.title}" vient d'être emprunté par quelqu'un d'autre`);
        }
        console.log(`  ✓ Livre "${book.title}" disponible`);

        // ÉTAPE 3b: Calculer la date de retour
        const approvalDate = Date.now();
        let dueDate;
        
        if (returnDueDate) {
          // Utiliser la date fournie par le librarian
          dueDate = new Date(returnDueDate).getTime();
          console.log(`  ✓ Date de retour personnalisée: ${new Date(dueDate).toLocaleDateString()}`);
        } else {
          // Par défaut: 14 jours
          const durationInDays = 14;
          dueDate = approvalDate + (durationInDays * 24 * 60 * 60 * 1000);
          console.log(`  ✓ Date de retour par défaut (+14 jours): ${new Date(dueDate).toLocaleDateString()}`);
        }

        await borrowingService.updateRequest(requestId, {
          status: 'approved',
          approvalDate: approvalDate,
          dueDate: dueDate
        });
        console.log(`  ✓ Demande approuvée (date de retour: ${new Date(dueDate).toLocaleDateString()})`);

        // ÉTAPE 3c: Mettre à jour le statut du livre (non disponible)
        await bookServiceProxy.updateBook(request.bookId, { isAvailable: false }, librarianUser);
        console.log(`  ✓ Livre marqué comme non disponible`);

        return {
          success: true,
          action: 'approved',
          requestId: requestId,
          bookTitle: book.title,
          dueDate: new Date(dueDate).toLocaleDateString(),
          message: `Emprunt approuvé. Retour prévu le ${new Date(dueDate).toLocaleDateString()}`
        };

      } else {
        throw new Error(`Action invalide: ${action}. Actions valides: 'approve' ou 'reject'`);
      }

    } catch (error) {
      console.error(`✗ Erreur lors de l'examen de la demande:`, error.message);
      throw error;
    }
  }

  /**
   * @description Récupère toutes les demandes en attente (utilitaire)
   * @returns {Promise<Array>} Liste des demandes en attente avec les détails
   */
  async getPendingRequests() {
    try {
      const requests = await borrowingService.findPendingRequests();
      
      // Enrichir chaque demande avec les informations du livre et de l'utilisateur
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const book = await bookServiceProxy.findBookById(request.bookId);
          const user = await userService.findUserById(request.userId);
          
          return {
            id: request.id,
            requestDate: new Date(request.requestDate).toLocaleDateString(),
            status: request.status,
            book: book ? {
              id: book.id,
              title: book.title,
              author: book.author
            } : null,
            user: user ? {
              id: user.id,
              name: user.name,
              email: user.email
            } : null
          };
        })
      );

      return enrichedRequests;
    } catch (error) {
      console.error('✗ Erreur lors de la récupération des demandes en attente:', error.message);
      throw error;
    }
  }

  /**
   * @description Récupère tous les emprunts actifs (status = 'approved')
   * avec les informations enrichies (utilisateur + livre)
   * 
   * @returns {Promise<Array>} Liste des emprunts actifs avec détails
   */
  async getActiveLoans() {
    try {
      console.log('📚 Facade: Récupération des emprunts actifs');

      // ÉTAPE 1: Récupérer tous les emprunts avec status 'approved'
      const approvedBorrowings = await borrowingService.findBorrowingsByStatus('approved');
      console.log(`  ✓ ${approvedBorrowings.length} emprunt(s) actif(s) trouvé(s)`);

      // ÉTAPE 2: Enrichir chaque emprunt avec les infos du livre et de l'utilisateur
      const enrichedLoans = await Promise.all(
        approvedBorrowings.map(async (borrowing) => {
          const book = await bookServiceProxy.findBookById(borrowing.bookId);
          const user = await userService.findUserById(borrowing.userId);

          return {
            id: borrowing.id,
            requestDate: new Date(borrowing.requestDate).toLocaleDateString(),
            approvalDate: borrowing.approvalDate ? new Date(borrowing.approvalDate).toLocaleDateString() : 'N/A',
            dueDate: borrowing.dueDate ? new Date(borrowing.dueDate).toLocaleDateString() : 'N/A',
            dueDateTimestamp: borrowing.dueDate || null,
            isLate: borrowing.dueDate && Date.now() > borrowing.dueDate,
            status: borrowing.status,
            book: book ? {
              id: book.id,
              title: book.title,
              author: book.author,
              coverImageUrl: book.coverImageUrl
            } : null,
            user: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            } : null
          };
        })
      );

      return enrichedLoans;
    } catch (error) {
      console.error('✗ Erreur lors de la récupération des emprunts actifs:', error.message);
      throw error;
    }
  }

  /**
   * @description Orchestre le retour d'un livre emprunté
   * Cette méthode coordonne plusieurs étapes:
   * 1. Récupérer la demande d'emprunt
   * 2. Vérifier que le livre est bien en status 'approved'
   * 3. Mettre à jour le statut à 'returned' avec la date de retour
   * 4. Remettre le livre comme disponible
   * 
   * @param {Object} user - L'utilisateur qui retourne le livre
   * @param {string} requestId - ID de la demande d'emprunt
   * @returns {Promise<Object>} Résultat du retour avec détails
   * @throws {Error} Si la demande n'existe pas ou n'est pas en status 'approved'
   */
  async returnBook(user, requestId) {
    try {
      console.log(`📚 Facade: Retour du livre - Demande ${requestId}`);

      // ÉTAPE 1: Récupérer la demande
      const request = await borrowingService.findRequestById(requestId);
      if (!request) {
        throw new Error(`Demande ${requestId} non trouvée`);
      }

      // ÉTAPE 2: Vérifier que c'est bien approuvé
      if (request.status !== 'approved') {
        throw new Error(`Ce livre ne peut être retourné (statut: ${request.status})`);
      }
      console.log(`  ✓ Demande trouvée (statut: ${request.status})`);

      // ÉTAPE 3: Récupérer le livre
      const book = await bookServiceProxy.findBookById(request.bookId);
      if (!book) {
        throw new Error(`Livre ${request.bookId} non trouvé`);
      }
      console.log(`  ✓ Livre "${book.title}" trouvé`);

      // ÉTAPE 4: Mettre à jour le statut de la demande
      const returnDate = Date.now();
      const isLate = request.dueDate && returnDate > request.dueDate;
      
      await borrowingService.updateRequest(requestId, {
        status: 'returned',
        returnDate: returnDate
      });
      console.log(`  ✓ Demande marquée comme retournée${isLate ? ' (EN RETARD)' : ''}`);

      // ÉTAPE 5: Remettre le livre comme disponible
      // Utilisation du proxy avec un utilisateur système (opération automatique de retour)
      const systemUser = { role: 'Admin', email: 'system@library.com', name: 'System' };
      console.log(`  → Mise à jour du livre ${request.bookId} - isAvailable: true`);
      const updatedBook = await bookServiceProxy.updateBook(request.bookId, { isAvailable: true }, systemUser);
      console.log(`  ✓ Livre "${book.title}" marqué comme disponible (isAvailable: ${updatedBook.isAvailable})`);

      return {
        success: true,
        requestId: requestId,
        bookTitle: book.title,
        returnDate: new Date(returnDate).toLocaleDateString(),
        wasLate: isLate,
        message: isLate ? 
          `Livre "${book.title}" retourné (en retard)` : 
          `Livre "${book.title}" retourné avec succès`
      };
    } catch (error) {
      console.error('✗ Erreur lors du retour du livre:', error.message);
      throw error;
    }
  }
}

module.exports = new LibraryFacade();
