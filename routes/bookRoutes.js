/**
 * @file bookRoutes.js
 * @description Routes pour la gestion du catalogue de livres.
 * Délègue la logique métier au bookController.
 */

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

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

module.exports = router;

