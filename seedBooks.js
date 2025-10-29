/**
 * @file seedBooks.js
 * @description Script pour peupler la base avec des livres de test
 */

const database = require('./services/database');

const books = [
  {
    title: 'Le Petit Prince',
    author: 'Antoine de Saint-Exupéry',
    genre: 'Fiction',
    coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71OZY035FKL.jpg',
    isAvailable: true
  },
  {
    title: 'Harry Potter à l\'école des sorciers',
    author: 'J.K. Rowling',
    genre: 'Fantastique',
    coverImageUrl: 'https://m.media-amazon.com/images/I/81YOuOGFCJL.jpg',
    isAvailable: true
  },
  {
    title: '1984',
    author: 'George Orwell',
    genre: 'Science-Fiction',
    coverImageUrl: 'https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg',
    isAvailable: true
  },
  {
    title: 'L\'Étranger',
    author: 'Albert Camus',
    genre: 'Fiction',
    coverImageUrl: 'https://m.media-amazon.com/images/I/71p3SxF+jfL.jpg',
    isAvailable: true
  },
  {
    title: 'Le Seigneur des Anneaux',
    author: 'J.R.R. Tolkien',
    genre: 'Fantastique',
    coverImageUrl: 'https://m.media-amazon.com/images/I/91jBdIDc35L.jpg',
    isAvailable: true
  },
  {
    title: 'Les Misérables',
    author: 'Victor Hugo',
    genre: 'Histoire',
    coverImageUrl: 'https://m.media-amazon.com/images/I/81wH7kUxjPL.jpg',
    isAvailable: true
  },
  {
    title: 'Fondation',
    author: 'Isaac Asimov',
    genre: 'Science-Fiction',
    coverImageUrl: 'https://m.media-amazon.com/images/I/81fXDL60PSL.jpg',
    isAvailable: true
  },
  {
    title: 'Orgueil et Préjugés',
    author: 'Jane Austen',
    genre: 'Romance',
    coverImageUrl: 'https://m.media-amazon.com/images/I/71Q1tPupKjL.jpg',
    isAvailable: true
  },
  {
    title: 'Le Comte de Monte-Cristo',
    author: 'Alexandre Dumas',
    genre: 'Aventure',
    coverImageUrl: 'https://m.media-amazon.com/images/I/81YH3jCWxfL.jpg',
    isAvailable: true
  },
  {
    title: 'L\'Alchimiste',
    author: 'Paulo Coelho',
    genre: 'Fiction',
    coverImageUrl: 'https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg',
    isAvailable: true
  }
];

async function seedBooks() {
  try {
    console.log('📚 Ajout des livres...');
    const db = database.getDB();
    const booksCollection = db.collection('books');

    for (const book of books) {
      const docRef = await booksCollection.add({
        ...book,
        createdAt: Date.now()
      });
      console.log(`✓ ${book.title} - ID: ${docRef.id}`);
    }

    console.log('\n✓ 10 livres ajoutés avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('✗ Erreur:', error);
    process.exit(1);
  }
}

seedBooks();
