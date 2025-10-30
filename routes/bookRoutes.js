/**
 * @file bookRoutes.js
 * @description Routes pour la gestion du catalogue de livres.
 * Délègue la logique métier au bookController.
 */

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const notificationController = require('../controllers/notificationController');

/**
 * @route GET /api/books
 * @description Récupère tous les livres du catalogue (PUBLIC)
 * @access Public
 */
router.get('/', bookController.getAllBooks);

/**
 * @route GET /api/books/search
 * @description Recherche des livres selon des critères (PUBLIC)
 * @access Public
 */
router.get('/search', bookController.searchBooks);

/**
 * @route GET /api/books/:id
 * @description Récupère un livre par son ID (PUBLIC)
 * @access Public
 */
router.get('/:id', bookController.getBookById);

/**
 * @route POST /api/books
 * @description Ajoute un nouveau livre au catalogue (PROTÉGÉ)
 * @access Librarian, Admin uniquement
 */
router.post('/', bookController.createBook);

/**
 * @route PUT /api/books/:id
 * @description Met à jour un livre (PROTÉGÉ)
 * @access Librarian, Admin uniquement
 */
router.put('/:id', bookController.updateBook);

/**
 * @route DELETE /api/books/:id
 * @description Supprime un livre (PROTÉGÉ)
 * @access Librarian, Admin uniquement
 */
router.delete('/:id', bookController.deleteBook);

/**
 * WATCHLIST ROUTES
 */

/**
 * @route POST /api/books/:id/watch
 * @description Ajouter un livre à la watchlist (me notifier quand disponible)
 * @access Member, Librarian, Admin
 */
router.post('/:id/watch', (req, res) => notificationController.addToWatchlist(req, res));

/**
 * @route DELETE /api/books/:id/watch
 * @description Retirer un livre de la watchlist
 * @access Member, Librarian, Admin
 */
router.delete('/:id/watch', (req, res) => notificationController.removeFromWatchlist(req, res));

/**
 * @route GET /api/books/:id/watching
 * @description Vérifier si l'utilisateur surveille ce livre
 * @access Member, Librarian, Admin
 */
router.get('/:id/watching', (req, res) => notificationController.isWatching(req, res));

module.exports = router;

