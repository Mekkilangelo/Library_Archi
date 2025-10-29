/**
 * @file libraryController.js
 * @description Controller pour la gestion des emprunts de livres.
 * Utilise la LibraryFacade pour orchestrer les opérations complexes.
 */

const libraryFacade = require('../facades/libraryFacade');
const borrowingService = require('../services/borrowingService');

/**
 * @description Permet à un membre de demander l'emprunt d'un livre
 * @access Member
 */
const requestBook = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        error: 'L\'ID du livre est requis'
      });
    }

    // Vérifier que l'utilisateur est connecté
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
    }

    // Utiliser la facade pour orchestrer la demande
    const result = await libraryFacade.requestBook(req.user.id, bookId);

    res.status(201).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la demande d\'emprunt:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @description Récupère toutes les demandes d'emprunt en attente
 * @access Librarian, Admin
 */
const getPendingRequests = async (req, res) => {
  try {
    // Vérifier que l'utilisateur a les permissions
    if (!req.user || (req.user.role !== 'Librarian' && req.user.role !== 'Admin')) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé: Seuls les bibliothécaires et administrateurs peuvent voir les demandes'
      });
    }

    const requests = await libraryFacade.getPendingRequests();

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des demandes'
    });
  }
};

/**
 * @description Récupère tous les emprunts actuellement actifs (approved)
 * @access Librarian, Admin
 */
const getActiveLoans = async (req, res) => {
  try {
    // Vérifier que l'utilisateur a les permissions
    if (!req.user || (req.user.role !== 'Librarian' && req.user.role !== 'Admin')) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé: Seuls les bibliothécaires et administrateurs peuvent voir les emprunts actifs'
      });
    }

    const loans = await libraryFacade.getActiveLoans();

    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des emprunts actifs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des emprunts actifs'
    });
  }
};

/**
 * @description Permet à un bibliothécaire d'approuver ou rejeter une demande
 * @access Librarian, Admin
 */
const reviewRequest = async (req, res) => {
  try {
    const { requestId, action, returnDueDate } = req.body;

    // Validation des données
    if (!requestId || !action) {
      return res.status(400).json({
        success: false,
        error: 'L\'ID de la demande et l\'action sont requis'
      });
    }

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({
        success: false,
        error: 'Action invalide. Utilisez "approve" ou "reject"'
      });
    }

    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
    }

    // Utiliser la facade pour orchestrer l'examen de la demande
    const result = await libraryFacade.reviewRequest(req.user, requestId, action, returnDueDate);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de l\'examen de la demande:', error);
    
    // Distinguer les erreurs d'autorisation
    if (error.message.includes('Accès refusé')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @description Récupère l'historique des emprunts de l'utilisateur connecté
 * @access Member (propres emprunts), Librarian, Admin
 */
const getMyBorrowings = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
    }

    const borrowings = await borrowingService.findUserBorrowingHistory(req.user.id);

    res.status(200).json({
      success: true,
      count: borrowings.length,
      data: borrowings
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

/**
 * @description Retourne un livre emprunté
 * @access Member (son propre emprunt), Librarian, Admin
 */
const returnBook = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
    }

    // Récupérer la demande
    const request = await borrowingService.findRequestById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Emprunt non trouvé'
      });
    }

    // Vérifier que c'est bien l'utilisateur qui a emprunté (ou un staff)
    const isOwner = request.userId === req.user.id;
    const isStaff = req.user.role === 'Librarian' || req.user.role === 'Admin';
    
    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        error: 'Vous ne pouvez retourner que vos propres emprunts'
      });
    }

    // Vérifier que le livre est bien approuvé
    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: `Impossible de retourner un livre avec le statut: ${request.status}`
      });
    }

    // Utiliser la facade pour retourner le livre
    const result = await libraryFacade.returnBook(req.user, requestId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors du retour du livre:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors du retour du livre'
    });
  }
};

module.exports = {
  requestBook,
  getPendingRequests,
  getActiveLoans,
  reviewRequest,
  getMyBorrowings,
  returnBook
};
