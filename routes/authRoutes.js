/**
 * @file authRoutes.js
 * @description Routes pour l'authentification et la gestion des utilisateurs.
 * Utilise la UserFactory pour créer les instances d'utilisateurs appropriées.
 */

const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const UserFactory = require('../factories/userFactory');

/**
 * @route POST /api/auth/setup-admin
 * @description Crée le premier administrateur (à utiliser une seule fois)
 * @access Public (mais à protéger en production)
 */
router.post('/setup-admin', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, nom et mot de passe requis'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer l'admin
    const userData = {
      email,
      name,
      role: 'Admin',
      createdAt: Date.now()
    };

    const newAdmin = await userService.createUser(userData);

    res.status(201).json({
      success: true,
      message: 'Administrateur créé',
      data: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error('Erreur setup admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création'
    });
  }
});

/**
 * @route POST /api/auth/register
 * @description Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, nom et mot de passe requis'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer le membre (role par défaut)
    const userData = {
      email,
      name,
      role: 'Member',
      createdAt: Date.now()
    };

    const newUser = await userService.createUser(userData);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'inscription'
    });
  }
});

/**
 * @route POST /api/auth/login
 * @description Connexion d'un utilisateur
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    // Rechercher l'utilisateur
    const user = await userService.findUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Dans un vrai système, on vérifierait le hash du password ici

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion'
    });
  }
});

/**
 * @route GET /api/auth/me
 * @description Récupère les informations de l'utilisateur connecté
 * @access Privé
 */
router.get('/me', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Non authentifié'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du profil'
    });
  }
});

/**
 * @route GET /api/auth/users
 * @description Récupère tous les utilisateurs (Admin uniquement)
 * @access Admin
 */
router.get('/users', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    // Vérifier les permissions
    if (!userId || userRole !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé: Seuls les administrateurs peuvent voir tous les utilisateurs'
      });
    }

    const users = await userService.findAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

/**
 * @route PUT /api/auth/users/:userId/role
 * @description Change le rôle d'un utilisateur (Admin uniquement)
 * @access Admin
 */
router.put('/users/:userId/role', async (req, res) => {
  try {
    const adminId = req.headers['x-user-id'];
    const adminRole = req.headers['x-user-role'];
    const { userId } = req.params;
    const { newRole } = req.body;

    // Vérifier les permissions
    if (!adminId || adminRole !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé: Seuls les administrateurs peuvent changer les rôles'
      });
    }

    // Vérifier que le nouveau rôle est valide
    const validRoles = ['Member', 'Librarian', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        error: `Rôle invalide. Valeurs acceptées: ${validRoles.join(', ')}`
      });
    }

    // Récupérer l'utilisateur
    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Empêcher un admin de changer son propre rôle
    if (userId === adminId) {
      return res.status(400).json({
        success: false,
        error: 'Vous ne pouvez pas modifier votre propre rôle'
      });
    }

    // Mettre à jour le rôle
    await userService.updateUserRole(userId, newRole);

    console.log(`✓ Rôle de ${user.name} changé: ${user.role} → ${newRole}`);

    res.status(200).json({
      success: true,
      message: `Rôle mis à jour avec succès: ${newRole}`,
      data: {
        id: userId,
        name: user.name,
        email: user.email,
        oldRole: user.role,
        newRole: newRole
      }
    });
  } catch (error) {
    console.error('Erreur lors du changement de rôle:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du changement de rôle'
    });
  }
});

module.exports = router;
