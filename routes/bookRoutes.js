/**
 * @file bookRoutes.js
 * @description Routes pour la gestion du catalogue de livres.
 * Utilise le BookServiceProxy pour contrôler l'accès aux opérations sensibles.
 */

const express = require('express');
const router = express.Router();
const bookServiceProxy = require('../services/bookServiceProxy');

/**
 * @route GET /api/books
 * @description Récupère tous les livres du catalogue (PUBLIC)
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const books = await bookServiceProxy.findAllBooks();
    
    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des livres'
    });
  }
});

/**
 * @route GET /api/books/search
 * @description Recherche des livres selon des critères (PUBLIC)
 * @access Public
 * @query {string} title - Titre du livre (optionnel)
 * @query {string} author - Auteur du livre (optionnel)
 * @query {string} genre - Genre du livre (optionnel)
 * @query {boolean} isAvailable - Disponibilité (optionnel)
 */
router.get('/search', async (req, res) => {
  try {
    const query = {};
    
    if (req.query.title) query.title = req.query.title;
    if (req.query.author) query.author = req.query.author;
    if (req.query.genre) query.genre = req.query.genre;
    if (req.query.isAvailable !== undefined) {
      query.isAvailable = req.query.isAvailable === 'true';
    }

    const books = await bookServiceProxy.findBooks(query);
    
    res.status(200).json({
      success: true,
      count: books.length,
      query: query,
      data: books
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de livres:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche de livres'
    });
  }
});

/**
 * @route GET /api/books/:id
 * @description Récupère un livre par son ID (PUBLIC)
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const book = await bookServiceProxy.findBookById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Livre non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du livre'
    });
  }
});

/**
 * @route POST /api/books
 * @description Ajoute un nouveau livre au catalogue (PROTÉGÉ)
 * @access Librarian, Admin uniquement
 * @body {string} title - Titre du livre
 * @body {string} author - Auteur du livre
 * @body {string} genre - Genre du livre
 * @body {string} coverImageUrl - URL de l'image de couverture
 */
router.post('/', async (req, res) => {
  try {
    // Validation des données
    const { title, author, genre, coverImageUrl } = req.body;
    
    if (!title || !author || !genre) {
      return res.status(400).json({
        success: false,
        error: 'Titre, auteur et genre sont requis'
      });
    }

    // Le proxy vérifiera les permissions avec req.user
    const book = await bookServiceProxy.addBook(req.body, req.user);
    
    res.status(201).json({
      success: true,
      message: 'Livre ajouté avec succès',
      data: book
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre:', error);
    
    // Distinguer les erreurs d'autorisation
    if (error.message.includes('Accès refusé')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'ajout du livre'
    });
  }
});

/**
 * @route PUT /api/books/:id
 * @description Met à jour un livre (PROTÉGÉ)
 * @access Librarian, Admin uniquement
 */
router.put('/:id', async (req, res) => {
  try {
    // Le proxy vérifiera les permissions avec req.user
    const book = await bookServiceProxy.updateBook(req.params.id, req.body, req.user);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Livre non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Livre mis à jour avec succès',
      data: book
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    
    // Distinguer les erreurs d'autorisation
    if (error.message.includes('Accès refusé')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du livre'
    });
  }
});

/**
 * @route DELETE /api/books/:id
 * @description Supprime un livre (PROTÉGÉ - Admin uniquement)
 * @access Admin uniquement
 */
router.delete('/:id', async (req, res) => {
  try {
    await bookServiceProxy.deleteBook(req.params.id, req.user);
    
    res.status(200).json({
      success: true,
      message: 'Livre supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    
    // Distinguer les erreurs d'autorisation
    if (error.message.includes('Accès refusé')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du livre'
    });
  }
});

module.exports = router;
