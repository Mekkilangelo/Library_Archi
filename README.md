# 🏛️ Système de Gestion de Bibliothèque

## 📋 Description

Ce projet est un système de gestion de bibliothèque développé avec **Node.js**, **Express.js** et **Firebase Firestore**. Il démontre l'implémentation pratique de quatre design patterns fondamentaux :

- **Singleton** : Connexion unique à Firebase
- **Factory Method** : Création de différents types d'utilisateurs
- **Proxy** : Contrôle d'accès aux opérations sensibles
- **Facade** : Simplification des opérations complexes

## 🎯 Objectifs Pédagogiques

Ce projet met l'accent sur :
- La clarté du code et l'isolation des patterns
- Une documentation complète en français
- Des exemples concrets d'utilisation des design patterns
- Une architecture modulaire et maintenable

## 🏗️ Architecture

```
Library/
├── models/               # Modèles de données (OOP)
│   ├── user.js          # Classe de base User
│   ├── member.js        # Classe Member (hérite de User)
│   ├── librarian.js     # Classe Librarian (hérite de User)
│   ├── admin.js         # Classe Admin (hérite de User)
│   ├── book.js          # Classe Book
│   └── borrowing.js     # Classe Borrowing
│
├── services/            # Logique métier et services
│   ├── database.js      # 🔴 SINGLETON: Connexion Firebase
│   ├── userService.js   # Service pour les utilisateurs
│   ├── bookService.js   # Service réel pour les livres
│   ├── bookServiceProxy.js  # 🔴 PROXY: Contrôle d'accès
│   └── borrowingService.js  # Service pour les emprunts
│
├── factories/           # Factories pour la création d'objets
│   └── userFactory.js   # 🔴 FACTORY: Création d'utilisateurs
│
├── facades/             # Facades pour simplifier les opérations
│   └── libraryFacade.js # 🔴 FACADE: Orchestration complexe
│
├── routes/              # Routes Express
│   ├── authRoutes.js    # Routes d'authentification
│   ├── bookRoutes.js    # Routes pour les livres
│   └── libraryRoutes.js # Routes pour les emprunts
│
├── config/              # Configuration
│   └── serviceAccountKey.json  # Clés Firebase (à configurer)
│
├── app.js               # Point d'entrée principal
├── package.json         # Dépendances npm
└── README.md            # Ce fichier
```

## 🎨 Design Patterns Implémentés

### 1️⃣ Singleton Pattern (`services/database.js`)

**Objectif** : Garantir une connexion unique et partagée à Firebase.

```javascript
// Une seule instance de connexion dans toute l'application
const database = require('./services/database');
const db = database.getDB(); // Toujours la même instance
```

**Points clés** :
- Construction une seule fois
- Instance partagée globalement
- Empêche les connexions multiples

### 2️⃣ Factory Method Pattern (`factories/userFactory.js`)

**Objectif** : Créer différents types d'utilisateurs sans exposer la logique de création.

```javascript
const UserFactory = require('./factories/userFactory');

// Création automatique selon le rôle
const user = UserFactory.createUser({
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'Member' // Crée une instance de Member
});
```

**Points clés** :
- Centralise la création d'objets
- Polymorphisme (Member, Librarian, Admin)
- Code client simplifié

### 3️⃣ Proxy Pattern (`services/bookServiceProxy.js`)

**Objectif** : Contrôler l'accès aux méthodes sensibles du BookService.

```javascript
const bookServiceProxy = require('./services/bookServiceProxy');

// Le proxy vérifie les permissions AVANT d'exécuter
await bookServiceProxy.addBook(bookData, user); // ✓ Si autorisé
// Lève une erreur si l'utilisateur n'a pas les permissions
```

**Points clés** :
- Protection des méthodes sensibles
- Vérification des permissions
- Délégation au service réel après validation

### 4️⃣ Facade Pattern (`facades/libraryFacade.js`)

**Objectif** : Simplifier les opérations complexes en plusieurs étapes.

```javascript
const libraryFacade = require('./facades/libraryFacade');

// UNE méthode qui orchestre PLUSIEURS services
await libraryFacade.requestBook(userId, bookId);
// Vérifie l'utilisateur, le livre, la disponibilité, crée l'emprunt
```

**Points clés** :
- Interface simplifiée
- Orchestration de plusieurs services
- Logique métier complexe cachée

## 📦 Installation

### Prérequis

- Node.js (>= 14.0.0)
- npm (>= 6.0.0)
- Compte Firebase avec Firestore activé

### Étapes

1. **Cloner le projet**
```bash
cd Library
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Firebase**

Créez un projet Firebase et téléchargez votre fichier `serviceAccountKey.json` :
- Allez sur [Firebase Console](https://console.firebase.google.com)
- Sélectionnez votre projet
- Paramètres du projet > Comptes de service
- Générer une nouvelle clé privée
- Téléchargez le fichier JSON
- Placez-le dans `config/serviceAccountKey.json`

4. **Démarrer le serveur**
```bash
npm start
```

Ou en mode développement (avec nodemon) :
```bash
npm run dev
```

Le serveur démarrera sur `http://localhost:3000`

## 🔑 Configuration des Rôles (Mode Test)

Pour tester différents rôles, modifiez le middleware d'authentification dans `app.js` (ligne 60) :

```javascript
// Tester comme Member (par défaut)
req.user = {
  id: 'user_member_001',
  email: 'member@library.com',
  name: 'Jean Dupont',
  role: 'Member'
};

// Ou comme Librarian
req.user = {
  id: 'user_librarian_001',
  email: 'librarian@library.com',
  name: 'Marie Martin',
  role: 'Librarian'
};

// Ou comme Admin
req.user = {
  id: 'user_admin_001',
  email: 'admin@library.com',
  name: 'Pierre Admin',
  role: 'Admin'
};
```

## 🌐 Endpoints API

### Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| POST | `/api/auth/register` | Inscription | Public |
| POST | `/api/auth/login` | Connexion | Public |
| GET | `/api/auth/me` | Profil | Privé |
| GET | `/api/auth/users` | Liste utilisateurs | Admin |

### Livres (`/api/books`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | `/api/books` | Liste tous les livres | Public |
| GET | `/api/books/search` | Rechercher des livres | Public |
| GET | `/api/books/:id` | Détails d'un livre | Public |
| POST | `/api/books` | Ajouter un livre | Librarian/Admin |
| PUT | `/api/books/:id` | Modifier un livre | Librarian/Admin |
| DELETE | `/api/books/:id` | Supprimer un livre | Admin |

### Bibliothèque (`/api/library`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| POST | `/api/library/request` | Demander un emprunt | Member |
| GET | `/api/library/pending-requests` | Voir les demandes | Librarian/Admin |
| POST | `/api/library/review` | Approuver/Rejeter | Librarian/Admin |
| POST | `/api/library/return` | Retourner un livre | Member/Librarian |
| GET | `/api/library/my-borrowings` | Mon historique | Member |

## 📝 Exemples d'utilisation

### 1. Ajouter un livre (Librarian/Admin)

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Le Petit Prince",
    "author": "Antoine de Saint-Exupéry",
    "genre": "Fiction",
    "coverImageUrl": "https://example.com/cover.jpg"
  }'
```

### 2. Demander un emprunt (Member)

```bash
curl -X POST http://localhost:3000/api/library/request \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "book_12345"
  }'
```

### 3. Approuver une demande (Librarian)

```bash
curl -X POST http://localhost:3000/api/library/review \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "request_12345",
    "action": "approve"
  }'
```

### 4. Retourner un livre

```bash
curl -X POST http://localhost:3000/api/library/return \
  -H "Content-Type: application/json" \
  -d '{
    "borrowingId": "borrowing_12345"
  }'
```

## 🎓 Flux de Demande d'Emprunt

```
Member demande un livre
        ↓
LibraryFacade.requestBook()
        ↓
1. Vérifie l'utilisateur existe
2. Vérifie le livre existe
3. Vérifie la disponibilité
4. Crée la demande (status: 'pending')
        ↓
Librarian examine la demande
        ↓
LibraryFacade.reviewRequest()
        ↓
Si APPROVE:
  1. Re-vérifie la disponibilité
  2. Approuve la demande
  3. Marque le livre comme non disponible
Si REJECT:
  1. Rejette simplement
        ↓
Member retourne le livre
        ↓
LibraryFacade.returnBook()
        ↓
1. Marque l'emprunt comme retourné
2. Rend le livre disponible
```

## 🔒 Permissions par Rôle

| Action | Member | Librarian | Admin |
|--------|--------|-----------|-------|
| Consulter livres | ✅ | ✅ | ✅ |
| Demander emprunt | ✅ | ✅ | ✅ |
| Ajouter livre | ❌ | ✅ | ✅ |
| Modifier livre | ❌ | ✅ | ✅ |
| Supprimer livre | ❌ | ❌ | ✅ |
| Approuver/Rejeter | ❌ | ✅ | ✅ |
| Gérer utilisateurs | ❌ | ❌ | ✅ |

## 🧪 Tests

Pour tester les différents patterns :

1. **Singleton** : Vérifiez les logs de connexion Firebase au démarrage
2. **Factory** : Testez l'inscription avec différents rôles
3. **Proxy** : Essayez d'ajouter un livre avec un Member (devrait échouer)
4. **Facade** : Faites une demande d'emprunt complète

## 📚 Technologies Utilisées

- **Node.js** : Environnement d'exécution JavaScript
- **Express.js** : Framework web minimaliste
- **Firebase Admin SDK** : Authentification et base de données
- **Firestore** : Base de données NoSQL
- **JavaScript (ES6+)** : Langage de programmation

## 🤝 Contribution

Ce projet est à but pédagogique. Les contributions sont les bienvenues pour :
- Améliorer la documentation
- Ajouter des tests unitaires
- Corriger des bugs
- Proposer de nouvelles fonctionnalités

## 📄 Licence

MIT License - Libre d'utilisation à des fins éducatives

## 👨‍💻 Auteur

ESGI - Architecture Logicielle

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur le dépôt
- Consultez la documentation Firebase
- Référez-vous aux commentaires dans le code

---

**Note importante** : Ce projet utilise un middleware d'authentification simulée. Dans un environnement de production, utilisez Firebase Authentication avec JWT tokens pour sécuriser l'API.

🎉 **Bon développement !**
