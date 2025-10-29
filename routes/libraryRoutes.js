/**
 * @file libraryRoutes.js
 * @description Routes pour la gestion des emprunts de livres.
 * Délègue la logique métier au libraryController.
 */

const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');

/**
 * @route POST /api/library/request
 * @description Permet à un membre de demander l'emprunt d'un livre
 * @access Member
 */
router.post('/request', libraryController.requestBook);

/**
 * @route GET /api/library/pending-requests
 * @description Récupère toutes les demandes d'emprunt en attente
 * @access Librarian, Admin
 */
router.get('/pending-requests', libraryController.getPendingRequests);

/**
 * @route GET /api/library/active-loans
 * @description Récupère tous les emprunts actuellement actifs (approved)
 * @access Librarian, Admin
 */
router.get('/active-loans', libraryController.getActiveLoans);

/**
 * @route POST /api/library/review
 * @description Permet à un bibliothécaire d'approuver ou rejeter une demande
 * @access Librarian, Admin
 */
router.post('/review', libraryController.reviewRequest);

/**
 * @route GET /api/library/my-borrowings
 * @description Récupère l'historique des emprunts de l'utilisateur connecté
 * @access Member (propres emprunts), Librarian, Admin
 */
router.get('/my-borrowings', libraryController.getMyBorrowings);

/**
 * @route POST /api/library/return/:requestId
 * @description Retourne un livre emprunté
 * @access Member (son propre emprunt), Librarian, Admin
 */
router.post('/return/:requestId', libraryController.returnBook);

module.exports = router;

