const API = 'http://localhost:3000/api';
let currentUser = null;
let allBooks = [];
let selectedBookId = null;
let modalBooks = [];

// Init
document.addEventListener('DOMContentLoaded', () => {
    checkSession(); // Vérifier si une session existe
    setupAuthForms();
    setupNavigation();
});

// Check Session
function checkSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showMainApp();
        } catch (error) {
            console.error('Erreur lors de la restauration de la session:', error);
            localStorage.removeItem('currentUser');
        }
    }
}

// Auth Forms
function setupAuthForms() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

function showLoginTab() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
}

function showRegisterTab() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

// Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (data.success) {
            currentUser = data.data;
            localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Sauvegarder la session
            showMainApp();
        } else {
            errorDiv.textContent = data.error || 'Erreur de connexion';
        }
    } catch (error) {
        errorDiv.textContent = 'Erreur de connexion au serveur';
    }
}

// Register
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const errorDiv = document.getElementById('registerError');
    
    try {
        const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        
        if (data.success) {
            currentUser = data.data;
            localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Sauvegarder la session
            showMainApp();
        } else {
            errorDiv.textContent = data.error || 'Erreur lors de l\'inscription';
        }
    } catch (error) {
        errorDiv.textContent = 'Erreur de connexion au serveur';
    }
}

// Show Main App
function showMainApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    
    if (currentUser.role === 'Librarian' || currentUser.role === 'Admin') {
        document.body.classList.add('role-' + currentUser.role.toLowerCase());
    }
    
    loadBooks();
}

// Logout
function logout() {
    currentUser = null;
    allBooks = [];
    localStorage.removeItem('currentUser'); // Effacer la session
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    document.body.className = '';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').textContent = '';
}

// Navigation
function setupNavigation() {
    document.querySelectorAll('.menu-item[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            
            document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(tab).classList.add('active');
            
            if (tab === 'books') loadBooks();
            if (tab === 'myborrow') loadMyBorrowings();
            if (tab === 'pending') loadPendingRequests();
            if (tab === 'users') loadUsers();
            if (tab === 'active-loans') loadActiveLoans();
        });
    });
}

// Load Books
async function loadBooks() {
    const list = document.getElementById('booksList');
    list.innerHTML = '<div class="loader">Chargement...</div>';
    
    try {
        const res = await fetch(`${API}/books`);
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
            allBooks = data.data;
            displayBooks(allBooks);
        } else {
            list.innerHTML = '<div class="empty-state"><div class="icon">📚</div><p>Aucun livre disponible</p></div>';
        }
    } catch (error) {
        list.innerHTML = '<div class="empty-state"><div class="icon">❌</div><p>Erreur</p></div>';
    }
}

// Display Books
function displayBooks(books) {
    const list = document.getElementById('booksList');
    const isAdmin = currentUser && (currentUser.role === 'Librarian' || currentUser.role === 'Admin');
    
    if (books.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="icon">🔍</div><p>Aucun livre trouvé</p></div>';
        return;
    }
    
    list.innerHTML = books.map(book => `
        <div class="book-card ${isAdmin ? 'admin' : ''}">
            <img src="${book.coverImageUrl || 'https://via.placeholder.com/240x280/6366f1/ffffff?text=' + encodeURIComponent(book.title)}" 
                 alt="${book.title}" 
                 class="book-cover">
            <div class="book-info">
                <h3 class="book-title" title="${book.title}">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <div class="book-meta">
                    <span class="book-genre">${book.genre}</span>
                    <span class="book-status ${book.isAvailable ? 'status-available' : 'status-unavailable'}">
                        ${book.isAvailable ? '✓ Disponible' : '✗ Emprunté'}
                    </span>
                </div>
                <div class="book-actions">
                    ${isAdmin ? `
                        <button class="btn-edit" onclick="openEditModal('${book.id}')" title="Modifier">✏️</button>
                        <button class="btn-delete" onclick="deleteBook('${book.id}')" title="Supprimer">🗑️</button>
                    ` : `
                        <button class="btn-borrow" 
                                onclick="quickRequestBook('${book.id}')" 
                                ${!book.isAvailable ? 'disabled' : ''}>
                            ${book.isAvailable ? '📖 Emprunter' : '🔒 Indisponible'}
                        </button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
}

// Filter Books
function filterBooks() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allBooks.filter(book => 
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search) ||
        book.genre.toLowerCase().includes(search)
    );
    displayBooks(filtered);
}

// Quick Request Book (from catalog)
async function quickRequestBook(bookId) {
    if (!confirm('Voulez-vous emprunter ce livre ?')) return;
    
    try {
        const res = await fetch(`${API}/library/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            },
            body: JSON.stringify({ bookId })
        });
        
        const data = await res.json();
        alert(data.success ? '✅ ' + data.message : '❌ ' + data.error);
        if (data.success) loadBooks();
    } catch (error) {
        alert('❌ Erreur');
    }
}

// Open Request Modal
async function openRequestModal() {
    document.getElementById('requestModal').classList.add('active');
    document.getElementById('confirmRequestBtn').disabled = true;
    selectedBookId = null;
    
    const list = document.getElementById('bookSelectList');
    list.innerHTML = '<div class="loader">Chargement...</div>';
    
    try {
        const res = await fetch(`${API}/books`);
        const data = await res.json();
        
        if (data.success) {
            modalBooks = data.data;
            displayBooksInModal(modalBooks);
        }
    } catch (error) {
        list.innerHTML = '<div class="empty-state">Erreur</div>';
    }
}

// Display Books in Modal
function displayBooksInModal(books) {
    const list = document.getElementById('bookSelectList');
    
    list.innerHTML = books.map(book => `
        <div class="book-select-item ${!book.isAvailable ? 'disabled' : ''}" 
             onclick="selectBook('${book.id}', ${book.isAvailable})">
            <img src="${book.coverImageUrl || 'https://via.placeholder.com/60x80/6366f1/ffffff?text=Book'}" 
                 class="book-select-cover" alt="${book.title}">
            <div class="book-select-info">
                <div class="book-select-title">${book.title}</div>
                <div class="book-select-author">${book.author}</div>
            </div>
            <span class="book-select-status ${book.isAvailable ? 'available' : 'unavailable'}">
                ${book.isAvailable ? '✓ Disponible' : '✗ Indisponible'}
            </span>
        </div>
    `).join('');
}

// Filter Books in Modal
function filterBooksInModal() {
    const search = event.target.value.toLowerCase();
    const filtered = modalBooks.filter(book => 
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search)
    );
    displayBooksInModal(filtered);
}

// Select Book
function selectBook(bookId, isAvailable) {
    if (!isAvailable) return;
    
    selectedBookId = bookId;
    console.log('📌 Livre sélectionné:', bookId);
    document.querySelectorAll('.book-select-item').forEach(item => item.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    document.getElementById('confirmRequestBtn').disabled = false;
}

// Confirm Book Request
async function confirmBookRequest() {
    console.log('🔍 selectedBookId:', selectedBookId);
    
    if (!selectedBookId) {
        alert('⚠️ Veuillez sélectionner un livre');
        return;
    }
    
    // Sauvegarder l'ID avant de fermer la modal
    const bookIdToRequest = selectedBookId;
    closeRequestModal();
    
    try {
        console.log('📤 Envoi de la demande avec bookId:', bookIdToRequest);
        const res = await fetch(`${API}/library/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            },
            body: JSON.stringify({ bookId: bookIdToRequest })
        });
        
        const data = await res.json();
        console.log('📥 Réponse:', data);
        alert(data.success ? '✅ ' + data.message : '❌ ' + data.error);
        if (data.success) loadBooks();
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert('❌ Erreur');
    }
}

// Close Request Modal
function closeRequestModal() {
    document.getElementById('requestModal').classList.remove('active');
    selectedBookId = null;
}

// Load My Borrowings
async function loadMyBorrowings() {
    const list = document.getElementById('myBorrowingsList');
    list.innerHTML = '<div class="loader">Chargement...</div>';
    
    try {
        const res = await fetch(`${API}/library/my-borrowings`, {
            headers: {
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            }
        });
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
            const now = Date.now();
            
            list.innerHTML = data.data.map(b => {
                // Vérifier si le retour est en retard
                const isLate = b.status === 'approved' && b.dueDate && now > b.dueDate;
                const dueDate = b.dueDate ? new Date(b.dueDate).toLocaleDateString() : 'N/A';
                const requestDate = b.requestDate ? new Date(b.requestDate).toLocaleDateString() : 'N/A';
                const bookTitle = b.bookTitle || 'Titre inconnu';
                const bookAuthor = b.bookAuthor ? ` par ${b.bookAuthor}` : '';
                
                return `
                    <div class="borrowing-item ${isLate ? 'late' : ''}">
                        <div class="item-header">
                            <div>
                                <h3 class="item-title">${bookTitle}</h3>
                                <p class="item-subtitle">${bookAuthor}</p>
                                <p class="item-subtitle">Demandé le: ${requestDate}</p>
                                ${b.dueDate ? `<p class="item-subtitle">À retourner avant: ${dueDate}</p>` : ''}
                                ${isLate ? '<span class="late-badge">⚠️ EN RETARD</span>' : ''}
                            </div>
                            <span class="status-badge status-${b.status}">${getStatusText(b.status)}</span>
                        </div>
                        ${b.status === 'approved' ? `
                            <div class="item-actions">
                                <button class="btn-return" onclick="returnBook('${b.id}')">📚 Retourner le livre</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        } else {
            list.innerHTML = '<div class="empty-state"><div class="icon">📋</div><p>Aucun emprunt</p></div>';
        }
    } catch (error) {
        list.innerHTML = '<div class="empty-state"><div class="icon">❌</div><p>Erreur</p></div>';
    }
}

// Load Pending Requests
async function loadPendingRequests() {
    const list = document.getElementById('pendingList');
    list.innerHTML = '<div class="loader">Chargement...</div>';
    
    try {
        const res = await fetch(`${API}/library/pending-requests`, {
            headers: {
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            }
        });
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
            document.getElementById('pendingCount').textContent = data.data.length;
            
            // Date par défaut: +14 jours
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 14);
            const defaultDateStr = defaultDate.toISOString().split('T')[0];
            
            list.innerHTML = data.data.map(r => `
                <div class="request-item">
                    <div class="item-header">
                        <div>
                            <h3 class="item-title">${r.book?.title || 'Livre inconnu'}</h3>
                            <p class="item-subtitle">Par: ${r.book?.author || 'N/A'}</p>
                            <p class="item-subtitle">Demandé par: ${r.user?.name || 'Inconnu'}</p>
                            <p class="item-subtitle">Date: ${r.requestDate || 'N/A'}</p>
                        </div>
                        <span class="status-badge status-${r.status}">${getStatusText(r.status)}</span>
                    </div>
                    <div class="item-actions">
                        <div class="approve-section">
                            <label class="date-label">Date de retour:</label>
                            <input type="date" id="returnDate_${r.id}" class="date-input" value="${defaultDateStr}" min="${new Date().toISOString().split('T')[0]}">
                            <button class="btn-approve" onclick="reviewRequest('${r.id}', 'approve')">✓ Approuver</button>
                        </div>
                        <button class="btn-reject" onclick="reviewRequest('${r.id}', 'reject')">✗ Rejeter</button>
                    </div>
                </div>
            `).join('');
        } else {
            document.getElementById('pendingCount').textContent = '0';
            list.innerHTML = '<div class="empty-state"><div class="icon">⏳</div><p>Aucune demande</p></div>';
        }
    } catch (error) {
        document.getElementById('pendingCount').textContent = '0';
        list.innerHTML = '<div class="empty-state"><div class="icon">❌</div><p>Erreur</p></div>';
    }
}

// Review Request
async function reviewRequest(requestId, action) {
    let returnDueDate = null;
    
    // Si c'est une approbation, récupérer la date choisie
    if (action === 'approve') {
        const dateInput = document.getElementById(`returnDate_${requestId}`);
        if (dateInput) {
            returnDueDate = dateInput.value;
            if (!returnDueDate) {
                alert('⚠️ Veuillez sélectionner une date de retour');
                return;
            }
        }
    }
    
    try {
        const body = { requestId, action };
        if (returnDueDate) {
            body.returnDueDate = returnDueDate;
        }
        
        const res = await fetch(`${API}/library/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            },
            body: JSON.stringify(body)
        });
        
        const data = await res.json();
        alert(data.success ? '✅ ' + data.message : '❌ ' + data.error);
        if (data.success) loadPendingRequests();
    } catch (error) {
        alert('❌ Erreur');
    }
}

// Add Book
async function addBook() {
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const genre = document.getElementById('bookGenre').value;
    const coverImageUrl = document.getElementById('bookCover').value;
    const resultDiv = document.getElementById('addBookResult');
    
    if (!title || !author || !genre) {
        resultDiv.innerHTML = '<div class="alert alert-error">Champs requis manquants</div>';
        return;
    }
    
    try {
        const res = await fetch(`${API}/books`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            },
            body: JSON.stringify({ title, author, genre, coverImageUrl })
        });
        
        const data = await res.json();
        
        if (data.success) {
            resultDiv.innerHTML = '<div class="alert alert-success">✅ ' + data.message + '</div>';
            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            document.getElementById('bookGenre').value = '';
            document.getElementById('bookCover').value = '';
            
            setTimeout(() => resultDiv.innerHTML = '', 3000);
        } else {
            resultDiv.innerHTML = '<div class="alert alert-error">❌ ' + data.error + '</div>';
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="alert alert-error">❌ Erreur</div>';
    }
}

// Open Edit Modal
async function openEditModal(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;
    
    document.getElementById('editBookId').value = book.id;
    document.getElementById('editBookTitle').value = book.title;
    document.getElementById('editBookAuthor').value = book.author;
    document.getElementById('editBookGenre').value = book.genre;
    document.getElementById('editBookCover').value = book.coverImageUrl || '';
    
    document.getElementById('editModal').classList.add('active');
}

// Close Edit Modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

// Update Book
async function updateBook() {
    const bookId = document.getElementById('editBookId').value;
    const title = document.getElementById('editBookTitle').value;
    const author = document.getElementById('editBookAuthor').value;
    const genre = document.getElementById('editBookGenre').value;
    const coverImageUrl = document.getElementById('editBookCover').value;
    
    try {
        const res = await fetch(`${API}/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            },
            body: JSON.stringify({ title, author, genre, coverImageUrl })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert('✅ Livre modifié');
            closeEditModal();
            loadBooks();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        alert('❌ Erreur');
    }
}

// Delete Book
async function deleteBook(bookId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return;
    
    try {
        const res = await fetch(`${API}/books/${bookId}`, {
            method: 'DELETE',
            headers: {
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            }
        });
        
        const data = await res.json();
        alert(data.success ? '✅ ' + data.message : '❌ ' + data.error);
        if (data.success) loadBooks();
    } catch (error) {
        alert('❌ Erreur');
    }
}

// Get Status Text
function getStatusText(status) {
    const texts = {
        'pending': '⏳ En attente',
        'approved': '✅ Approuvé',
        'rejected': '❌ Rejeté',
        'returned': '📖 Retourné'
    };
    return texts[status] || status;
}

// Load Users (Admin Only)
async function loadUsers() {
    const list = document.getElementById('usersList');
    list.innerHTML = '<div class="loader">Chargement...</div>';
    
    try {
        const res = await fetch(`${API}/auth/users`, {
            headers: {
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            }
        });
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
            list.innerHTML = data.data.map(user => `
                <div class="user-card">
                    <div class="user-card-left">
                        <div class="user-card-avatar">${user.name.charAt(0).toUpperCase()}</div>
                        <div class="user-card-info">
                            <h3>${user.name}</h3>
                            <p>${user.email}</p>
                        </div>
                    </div>
                    <div class="user-card-right">
                        ${user.id === currentUser.id ? 
                            `<span class="role-badge ${user.role.toLowerCase()}">${user.role}</span>` :
                            `<select class="role-select" onchange="changeUserRole('${user.id}', this.value, '${user.name}')">
                                <option value="Member" ${user.role === 'Member' ? 'selected' : ''}>Member</option>
                                <option value="Librarian" ${user.role === 'Librarian' ? 'selected' : ''}>Librarian</option>
                                <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                            </select>`
                        }
                    </div>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<div class="empty-state">Aucun utilisateur</div>';
        }
    } catch (error) {
        list.innerHTML = '<div class="empty-state">Erreur de chargement</div>';
    }
}

// Change User Role
async function changeUserRole(userId, newRole, userName) {
    if (!confirm(`Changer le rôle de ${userName} en ${newRole} ?`)) {
        loadUsers(); // Reset select
        return;
    }
    
    try {
        const res = await fetch(`${API}/auth/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            },
            body: JSON.stringify({ newRole })
        });
        
        const data = await res.json();
        alert(data.success ? '✅ ' + data.message : '❌ ' + data.error);
        if (data.success) loadUsers();
    } catch (error) {
        alert('❌ Erreur');
        loadUsers();
    }
}

// Return Book
async function returnBook(requestId) {
    if (!confirm('Êtes-vous sûr de vouloir retourner ce livre ?')) return;
    
    try {
        const res = await fetch(`${API}/library/return/${requestId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            }
        });
        
        const data = await res.json();
        alert(data.success ? '✅ ' + data.message : '❌ ' + data.error);
        if (data.success) loadMyBorrowings();
    } catch (error) {
        alert('❌ Erreur lors du retour');
    }
}

// Load Active Loans (Librarian/Admin)
async function loadActiveLoans() {
    const list = document.getElementById('activeLoansList');
    list.innerHTML = '<div class="loader">Chargement...</div>';
    
    try {
        const res = await fetch(`${API}/library/active-loans`, {
            headers: {
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            }
        });
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
            document.getElementById('activeLoansCount').textContent = data.data.length;
            const now = Date.now();
            
            list.innerHTML = data.data.map(loan => {
                const isLate = loan.dueDateTimestamp && now > loan.dueDateTimestamp;
                
                return `
                    <div class="loan-item ${isLate ? 'late' : ''}">
                        <div class="loan-header">
                            <img src="${loan.book?.coverImageUrl || 'https://via.placeholder.com/60x80/6366f1/ffffff?text=Book'}" 
                                 class="loan-cover" alt="${loan.book?.title || 'Livre'}">
                            <div class="loan-info">
                                <h3 class="loan-title">${loan.book?.title || 'Livre inconnu'}</h3>
                                <p class="loan-subtitle">Par: ${loan.book?.author || 'N/A'}</p>
                                <p class="loan-subtitle">📌 Emprunté par: <strong>${loan.user?.name || 'Inconnu'}</strong> (${loan.user?.email || 'N/A'})</p>
                                <p class="loan-subtitle">📅 Approuvé le: ${loan.approvalDate}</p>
                                <p class="loan-subtitle ${isLate ? 'text-danger' : ''}">⏰ À retourner avant: <strong>${loan.dueDate}</strong></p>
                                ${isLate ? '<span class="late-badge">⚠️ EN RETARD</span>' : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            document.getElementById('activeLoansCount').textContent = '0';
            list.innerHTML = '<div class="empty-state"><div class="icon">📚</div><p>Aucun emprunt actif</p></div>';
        }
    } catch (error) {
        document.getElementById('activeLoansCount').textContent = '0';
        list.innerHTML = '<div class="empty-state"><div class="icon">❌</div><p>Erreur</p></div>';
    }
}

// Close modals on click outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Return Book
async function returnBook(requestId) {
    if (!confirm('Confirmer le retour de ce livre ?')) return;
    
    try {
        const res = await fetch(`${API}/library/return/${requestId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            }
        });
        
        const data = await res.json();
        alert(data.success ? '✅ ' + data.message : '❌ ' + data.error);
        if (data.success) loadMyBorrowings();
    } catch (error) {
        alert('❌ Erreur lors du retour');
    }
}

// Close modals on click outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
