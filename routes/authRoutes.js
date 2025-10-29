/**
 * @file authRoutes.js
 * @description Routes pour l'authentification et la gestion des utilisateurs.
 * Délègue la logique métier au authController.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route POST /api/auth/setup-admin
 * @description Crée le premier administrateur (à utiliser une seule fois)
 * @access Public (mais à protéger en production)
 */
router.post('/setup-admin', authController.setupAdmin);

/**
 * @route POST /api/auth/register
 * @description Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @description Connexion d'un utilisateur
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route GET /api/auth/me
 * @description Récupère les informations de l'utilisateur connecté
 * @access Privé
 */
router.get('/me', authController.getMe);

/**
 * @route GET /api/auth/users
 * @description Récupère tous les utilisateurs (Admin uniquement)
 * @access Admin
 */
router.get('/users', authController.getAllUsers);

/**
 * @route PUT /api/auth/users/:userId/role
 * @description Change le rôle d'un utilisateur (Admin uniquement)
 * @access Admin
 */
router.put('/users/:userId/role', authController.updateUserRole);

module.exports = router;

router.put('/users/:userId/role', authController.updateUserRole);

module.exports = router;

