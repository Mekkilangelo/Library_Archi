const borrowingService = require('../services/borrowingService');
const bookService = require('../services/bookService');
const userService = require('../services/userService');
const notificationSubject = require('../patterns/observer/notificationSubject');
const DueDateReminderObserver = require('../patterns/observer/dueDateReminderObserver');
const OverdueObserver = require('../patterns/observer/overdueObserver');
const Notification = require('../models/notification');

/**
 * Job de vérification périodique des échéances et retards
 * Vérifie tous les emprunts actifs et envoie des notifications si nécessaire
 */
class DueDateCheckerJob {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.checkIntervalMs = 24 * 60 * 60 * 1000; // 24 heures par défaut
    
    // Initialiser les observers
    this.initializeObservers();
  }

  /**
   * Initialiser les observers pour les rappels et retards
   */
  initializeObservers() {
    const dueDateReminderObserver = new DueDateReminderObserver();
    const overdueObserver = new OverdueObserver();
    
    notificationSubject.attach(Notification.Types.DUE_DATE_REMINDER, dueDateReminderObserver);
    notificationSubject.attach(Notification.Types.OVERDUE, overdueObserver);
    
    console.log('✓ Observers de vérification d\'échéance initialisés');
  }

  /**
   * Démarrer le job périodique
   * @param {number} intervalMs - Intervalle en millisecondes (défaut: 24h)
   */
  start(intervalMs = null) {
    if (this.isRunning) {
      console.log('⚠️ Job de vérification déjà en cours');
      return;
    }

    if (intervalMs) {
      this.checkIntervalMs = intervalMs;
    }

    console.log(`🕐 Démarrage du job de vérification (intervalle: ${this.checkIntervalMs / 1000 / 60} minutes)`);
    
    // Exécuter immédiatement
    this.checkDueDates();
    
    // Puis à intervalles réguliers
    this.interval = setInterval(() => {
      this.checkDueDates();
    }, this.checkIntervalMs);
    
    this.isRunning = true;
  }

  /**
   * Arrêter le job périodique
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      console.log('🛑 Job de vérification arrêté');
    }
  }

  /**
   * Vérifier les échéances et retards de tous les emprunts actifs
   */
  async checkDueDates() {
    try {
      console.log('🔍 Vérification des échéances et retards...');
      
      const now = new Date();
      const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
      
      // Récupérer tous les emprunts actifs (approved)
      const activeLoans = await borrowingService.findBorrowingsByStatus('approved');
      
      if (activeLoans.length === 0) {
        console.log('  ℹ️ Aucun emprunt actif à vérifier');
        return;
      }

      console.log(`  📚 ${activeLoans.length} emprunt(s) actif(s) à vérifier`);
      
      let remindersCount = 0;
      let overdueCount = 0;

      for (const loan of activeLoans) {
        try {
          // Récupérer les informations du livre et de l'utilisateur
          const book = await bookService.findBookById(loan.bookId);
          const user = await userService.findUserById(loan.userId);

          if (!book || !user) {
            console.log(`  ⚠️ Livre ou utilisateur non trouvé pour l'emprunt ${loan.id}`);
            continue;
          }

          const dueDate = new Date(loan.dueDate);
          const timeDiff = dueDate.getTime() - now.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

          // CAS 1: Livre en retard
          if (now > dueDate) {
            const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            
            // Envoyer une notification de retard
            await notificationSubject.notify(Notification.Types.OVERDUE, {
              userId: user.id,
              userName: user.name,
              bookTitle: book.title,
              bookId: book.id,
              dueDate: dueDate,
              daysOverdue: daysOverdue
            });
            
            overdueCount++;
            console.log(`  ⚠️ Retard: "${book.title}" pour ${user.name} (${daysOverdue} jour(s))`);
          }
          // CAS 2: Rappel 2 jours avant l'échéance
          else if (daysDiff <= 2 && daysDiff >= 0) {
            // Envoyer un rappel
            await notificationSubject.notify(Notification.Types.DUE_DATE_REMINDER, {
              userId: user.id,
              userName: user.name,
              bookTitle: book.title,
              bookId: book.id,
              dueDate: dueDate
            });
            
            remindersCount++;
            console.log(`  ⏰ Rappel: "${book.title}" pour ${user.name} (échéance dans ${daysDiff} jour(s))`);
          }
        } catch (error) {
          console.error(`  ❌ Erreur vérification emprunt ${loan.id}:`, error.message);
        }
      }

      console.log(`✓ Vérification terminée: ${remindersCount} rappel(s), ${overdueCount} retard(s)`);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des échéances:', error);
    }
  }

  /**
   * Exécuter la vérification immédiatement (pour testing)
   */
  async checkNow() {
    console.log('🔍 Vérification manuelle des échéances...');
    await this.checkDueDates();
  }
}

// Export singleton
module.exports = new DueDateCheckerJob();
