/**
 * @file app.js
 * @description Point d'entrée principal du serveur Express.
 * Configure le serveur, les middlewares et les routes de l'application.
 * 
 * SYSTÈME DE GESTION DE BIBLIOTHÈQUE
 * Architecture avec Design Patterns:
 * - Singleton: DatabaseConnection (connexion unique à Firebase)
 * - Factory: UserFactory (création de différents types d'utilisateurs)
 * - Proxy: BookServiceProxy (contrôle d'accès au BookService)
 * - Facade: LibraryFacade (simplification des opérations complexes)
 */

const express = require('express');
const app = express();

// Import du job de vérification des échéances
const dueDateCheckerJob = require('./jobs/dueDateCheckerJob');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Configuration
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARES
// ============================================================================

/**
 * @description Middleware pour servir les fichiers statiques (interface web)
 */
app.use(express.static('public'));

/**
 * @description Middleware pour parser le JSON
 */
app.use(express.json());

/**
 * @description Middleware pour parser les données URL-encoded
 */
app.use(express.urlencoded({ extended: true }));

/**
 * @description Middleware pour logger les requêtes (simplifié)
 */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

/**
 * @description Middleware d'authentification (simplifié)
 * Récupère l'utilisateur depuis le token ou la session
 */
app.use((req, res, next) => {
  // Pour l'instant, on simule un utilisateur si un userId est dans les headers
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  
  if (userId) {
    req.user = {
      id: userId,
      role: userRole || 'Member'
    };
  }
  
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * @route GET /
 * @description Route de base pour vérifier que le serveur fonctionne
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🏛️ Bienvenue sur l\'API de la bibliothèque',
    version: '1.0.0',
    currentUser: req.user ? {
      name: req.user.name,
      role: req.user.role,
      email: req.user.email
    } : null,
    endpoints: {
      auth: '/api/auth',
      books: '/api/books',
      library: '/api/library'
    },
    designPatterns: {
      singleton: 'DatabaseConnection (services/database.js)',
      factory: 'UserFactory (factories/userFactory.js)',
      proxy: 'BookServiceProxy (services/bookServiceProxy.js)',
      facade: 'LibraryFacade (facades/libraryFacade.js)'
    }
  });
});

/**
 * @description Enregistrement des routes de l'API
 */
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/notifications', notificationRoutes);

// ============================================================================
// GESTION DES ERREURS
// ============================================================================

/**
 * @description Middleware pour les routes non trouvées (404)
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    path: req.path
  });
});

/**
 * @description Middleware global de gestion des erreurs
 */
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ============================================================================
// DÉMARRAGE DU SERVEUR
// ============================================================================

/**
 * @description Démarrage du serveur Express
 */
app.listen(PORT, () => {
  console.log(`\n🏛️ Library System - http://localhost:${PORT}`);
  console.log(`Patterns: Singleton | Factory | Proxy | Facade | Observer\n`);
  
  // Démarrer le job de vérification des échéances (toutes les 24h)
  dueDateCheckerJob.start();
});

/**
 * @description Gestion de l'arrêt propre du serveur
 */
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM reçu, arrêt du serveur...');
  dueDateCheckerJob.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT reçu, arrêt du serveur...');
  dueDateCheckerJob.stop();
  process.exit(0);
});

module.exports = app;
