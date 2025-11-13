// ===============================
// STATE MANAGEMENT
// ===============================
const AppState = {
  currentSection: 'home',
  currentDay: new Date().getDay(),
  profile: null,
  trainings: {},
  jumpRecords: [],
  theme: 'dark',
  editingExerciseId: null,

  init() {
    this.loadProfile();
    this.loadTrainings();
    this.loadJumpRecords();
    this.loadTheme();
  },

  loadProfile() {
    try {
      const saved = localStorage.getItem('userProfile');
      this.profile = saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading profile:', error);
      this.profile = null;
    }
  },

  saveProfile(data) {
    try {
      localStorage.setItem('userProfile', JSON.stringify(data));
      this.profile = data;
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  },

  loadTrainings() {
    try {
      const saved = localStorage.getItem('trainings');
      this.trainings = saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading trainings:', error);
      this.trainings = {};
    }
  },

  saveTrainings() {
    try {
      localStorage.setItem('trainings', JSON.stringify(this.trainings));
      return true;
    } catch (error) {
      console.error('Error saving trainings:', error);
      return false;
    }
  },

  loadJumpRecords() {
    try {
      const saved = localStorage.getItem('jumpRecords');
      this.jumpRecords = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading jump records:', error);
      this.jumpRecords = [];
    }
  },

  saveJumpRecords() {
    try {
      localStorage.setItem('jumpRecords', JSON.stringify(this.jumpRecords));
      return true;
    } catch (error) {
      console.error('Error saving jump records:', error);
      return false;
    }
  },

  loadTheme() {
    try {
      const saved = localStorage.getItem('theme');
      this.theme = saved || 'dark';
    } catch (error) {
      console.error('Error loading theme:', error);
      this.theme = 'dark';
    }
  },

  saveTheme(theme) {
    try {
      localStorage.setItem('theme', theme);
      this.theme = theme;
      return true;
    } catch (error) {
      console.error('Error saving theme:', error);
      return false;
    }
  },

  clearData() {
    try {
      localStorage.clear();
      this.profile = null;
      this.trainings = {};
      this.jumpRecords = [];
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },

  getExercisesForDay(day) {
    return this.trainings[day] || [];
  },

  addExercise(day, exercise) {
    if (!this.trainings[day]) {
      this.trainings[day] = [];
    }
    exercise.id = Date.now().toString();
    exercise.completed = false;
    this.trainings[day].push(exercise);
    this.saveTrainings();
    return exercise;
  },

  updateExercise(day, exerciseId, updates) {
    const exercises = this.trainings[day] || [];
    const index = exercises.findIndex(ex => ex.id === exerciseId);
    if (index !== -1) {
      exercises[index] = { ...exercises[index], ...updates };
      this.saveTrainings();
      return true;
    }
    return false;
  },

  deleteExercise(day, exerciseId) {
    if (this.trainings[day]) {
      this.trainings[day] = this.trainings[day].filter(ex => ex.id !== exerciseId);
      this.saveTrainings();
      return true;
    }
    return false;
  },

  toggleExerciseCompletion(day, exerciseId) {
    const exercises = this.trainings[day] || [];
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      exercise.completed = !exercise.completed;
      this.saveTrainings();
      return true;
    }
    return false;
  },

  // Jump Records Management
  addJumpRecord(record) {
    const newRecord = {
      id: Date.now().toString(),
      height: record.height,
      date: record.date,
      notes: record.notes || '',
      timestamp: new Date().toISOString()
    };
    this.jumpRecords.unshift(newRecord); // Add to beginning
    this.saveJumpRecords();
    return newRecord;
  },

  deleteJumpRecord(id) {
    this.jumpRecords = this.jumpRecords.filter(record => record.id !== id);
    this.saveJumpRecords();
    return true;
  },

  getBestJump() {
    if (this.jumpRecords.length === 0) return null;
    return this.jumpRecords.reduce((best, current) =>
      current.height > best.height ? current : best
    );
  },

  getJumpRecordsSorted() {
    return [...this.jumpRecords].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );
  }
};

// ===============================
// THEME MANAGEMENT
// ===============================
const ThemeManager = {
  init() {
    this.applyTheme(AppState.theme);
    this.setupToggle();
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    AppState.theme = theme;
    this.updateToggleUI();
  },

  toggleTheme() {
    const newTheme = AppState.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    AppState.saveTheme(newTheme);
  },

  setupToggle() {
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('change', () => this.toggleTheme());
    }
  },

  updateToggleUI() {
    const toggle = document.getElementById('themeToggle');
    const label = document.getElementById('themeLabel');
    if (toggle) {
      toggle.checked = AppState.theme === 'light';
    }
    if (label) {
      label.textContent = AppState.theme === 'light' ? 'Modo Claro' : 'Modo Escuro';
    }
  }
};

// ===============================
// TOAST NOTIFICATIONS
// ===============================
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toastContainer');
  },

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    this.container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(message, duration) {
    this.show(message, 'success', duration);
  },

  error(message, duration) {
    this.show(message, 'error', duration);
  },

  info(message, duration) {
    this.show(message, 'info', duration);
  },

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }
};

// ===============================
// NAVIGATION
// ===============================
const Navigation = {
  sections: {
    home: document.getElementById('homeSection'),
    treinos: document.getElementById('treinosSection'),
    historico: document.getElementById('historicoSection'),
  },

  buttons: {},

  init() {
    // Get all nav buttons
    this.buttons = {
      home: document.getElementById('homeBtn'),
      treinos: document.getElementById('treinosBtn'),
      historico: document.getElementById('historicoBtn'),
    };

    // Add click listeners
    Object.keys(this.buttons).forEach(key => {
      this.buttons[key].addEventListener('click', () => this.showSection(key));
    });

    // Show initial section
    this.showSection('home');
  },

  showSection(sectionName) {
    // Update sections
    Object.keys(this.sections).forEach(key => {
      this.sections[key].classList.toggle('active', key === sectionName);
    });

    // Update nav buttons
    Object.keys(this.buttons).forEach(key => {
      this.buttons[key].classList.toggle('active', key === sectionName);
    });

    AppState.currentSection = sectionName;
  }
};


// ===============================
// FORM VALIDATION
// ===============================
const Validator = {
  validateName(name) {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return { valid: false, message: 'Nome deve ter pelo menos 2 caracteres' };
    }
    if (trimmed.length > 50) {
      return { valid: false, message: 'Nome muito longo (máximo 50 caracteres)' };
    }
    return { valid: true, value: trimmed };
  },

  validateHeight(height) {
    if (!height) return { valid: true, value: null };

    const num = parseInt(height, 10);
    if (isNaN(num) || num < 100 || num > 250) {
      return { valid: false, message: 'Altura deve estar entre 100 e 250 cm' };
    }
    return { valid: true, value: num };
  },

  validatePosition(position) {
    const validPositions = ['Ponteiro', 'Oposto', 'Central', 'Levantador', 'Líbero'];
    if (!validPositions.includes(position)) {
      return { valid: false, message: 'Posição inválida' };
    }
    return { valid: true, value: position };
  },

  validateExercise(data) {
    if (!data.name || data.name.trim().length < 2) {
      return { valid: false, message: 'Nome do exercício é obrigatório' };
    }
    if (!data.sets || data.sets < 1) {
      return { valid: false, message: 'Número de séries inválido' };
    }
    if (!data.reps || data.reps < 1) {
      return { valid: false, message: 'Número de repetições inválido' };
    }
    if (data.weight && data.weight < 0) {
      return { valid: false, message: 'Carga não pode ser negativa' };
    }
    return {
      valid: true,
      value: {
        name: data.name.trim(),
        sets: parseInt(data.sets),
        reps: parseInt(data.reps),
        weight: data.weight ? parseFloat(data.weight) : 0
      }
    };
  }
};

// ===============================
// TRAINING MANAGER
// ===============================
const TrainingManager = {
  currentDay: new Date().getDay(),

  init() {
    this.setupDaySelector();
    this.setupExerciseForm();
    this.selectDay(this.currentDay);
  },

  setupDaySelector() {
    const dayButtons = document.querySelectorAll('.day-btn');
    dayButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.day);
        this.selectDay(day);
      });
    });
  },

  selectDay(day) {
    this.currentDay = day;
    AppState.currentDay = day;

    // Update active button
    document.querySelectorAll('.day-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.day) === day);
    });

    // Update day name
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const dayNameEl = document.getElementById('selectedDayName');
    if (dayNameEl) {
      dayNameEl.textContent = dayNames[day];
    }

    this.renderExercises();
  },

  renderExercises() {
    const container = document.getElementById('exercisesList');
    const exercises = AppState.getExercisesForDay(this.currentDay);

    if (exercises.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📋</div>
          <p>Nenhum exercício cadastrado para este dia.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = exercises.map(ex => `
      <div class="exercise-card ${ex.completed ? 'completed' : ''}" data-id="${ex.id}">
        <div class="exercise-header">
          <div class="exercise-name">${ex.name}</div>
          <div class="exercise-actions">
            <button class="btn-icon success" onclick="TrainingManager.toggleCompletion('${ex.id}')" title="Marcar como ${ex.completed ? 'não concluído' : 'concluído'}">
              ${ex.completed ? '✓' : '○'}
            </button>
            <button class="btn-icon" onclick="TrainingManager.editExercise('${ex.id}')" title="Editar">
              ✏️
            </button>
            <button class="btn-icon danger" onclick="TrainingManager.deleteExercise('${ex.id}')" title="Excluir">
              🗑️
            </button>
          </div>
        </div>
        <div class="exercise-details">
          <div class="exercise-detail">
            <div class="label">Séries</div>
            <div class="value">${ex.sets}</div>
          </div>
          <div class="exercise-detail">
            <div class="label">Reps</div>
            <div class="value">${ex.reps}</div>
          </div>
          <div class="exercise-detail">
            <div class="label">Carga</div>
            <div class="value">${ex.weight ? ex.weight + 'kg' : '--'}</div>
          </div>
        </div>
      </div>
    `).join('');
  },

  setupExerciseForm() {
    const addBtn = document.getElementById('addExerciseBtn');
    const form = document.getElementById('exerciseFormElement');
    const cancelBtn = document.getElementById('cancelExerciseBtn');

    addBtn.addEventListener('click', () => this.showExerciseForm());
    cancelBtn.addEventListener('click', () => this.hideExerciseForm());
    form.addEventListener('submit', (e) => this.handleFormSubmit(e));
  },

  showExerciseForm(exercise = null) {
    const formContainer = document.getElementById('exerciseForm');
    const formTitle = document.getElementById('formTitle');

    if (exercise) {
      formTitle.textContent = 'Editar Exercício';
      document.getElementById('exerciseName').value = exercise.name;
      document.getElementById('exerciseSets').value = exercise.sets;
      document.getElementById('exerciseReps').value = exercise.reps;
      document.getElementById('exerciseWeight').value = exercise.weight || '';
      AppState.editingExerciseId = exercise.id;
    } else {
      formTitle.textContent = 'Novo Exercício';
      document.getElementById('exerciseFormElement').reset();
      AppState.editingExerciseId = null;
    }

    formContainer.style.display = 'block';
    document.getElementById('exerciseName').focus();
  },

  hideExerciseForm() {
    document.getElementById('exerciseForm').style.display = 'none';
    document.getElementById('exerciseFormElement').reset();
    AppState.editingExerciseId = null;
  },

  handleFormSubmit(e) {
    e.preventDefault();

    const data = {
      name: document.getElementById('exerciseName').value,
      sets: document.getElementById('exerciseSets').value,
      reps: document.getElementById('exerciseReps').value,
      weight: document.getElementById('exerciseWeight').value
    };

    const validation = Validator.validateExercise(data);
    if (!validation.valid) {
      Toast.error(validation.message);
      return;
    }

    if (AppState.editingExerciseId) {
      // Update existing exercise
      if (AppState.updateExercise(this.currentDay, AppState.editingExerciseId, validation.value)) {
        Toast.success('Exercício atualizado!');
        this.hideExerciseForm();
        this.renderExercises();
        UI.updateStats();
      } else {
        Toast.error('Erro ao atualizar exercício');
      }
    } else {
      // Add new exercise
      AppState.addExercise(this.currentDay, validation.value);
      Toast.success('Exercício adicionado!');
      this.hideExerciseForm();
      this.renderExercises();
      UI.updateStats();
    }
  },

  editExercise(id) {
    const exercises = AppState.getExercisesForDay(this.currentDay);
    const exercise = exercises.find(ex => ex.id === id);
    if (exercise) {
      this.showExerciseForm(exercise);
    }
  },

  deleteExercise(id) {
    if (confirm('Deseja realmente excluir este exercício?')) {
      if (AppState.deleteExercise(this.currentDay, id)) {
        Toast.success('Exercício removido');
        this.renderExercises();
        UI.updateStats();
      } else {
        Toast.error('Erro ao remover exercício');
      }
    }
  },

  toggleCompletion(id) {
    if (AppState.toggleExerciseCompletion(this.currentDay, id)) {
      this.renderExercises();
      UI.updateStats();
    }
  }
};

// ===============================
// JUMP TRACKER
// ===============================
const JumpTracker = {
  init() {
    this.setupForm();
    this.setDefaultDate();
    this.renderJumpRecords();
    this.updateBestJumpDisplay();
  },

  setupForm() {
    const form = document.getElementById('jumpForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  },

  setDefaultDate() {
    const dateInput = document.getElementById('jumpDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
    }
  },

  handleFormSubmit(e) {
    e.preventDefault();

    const height = parseFloat(document.getElementById('jumpHeight').value);
    const date = document.getElementById('jumpDate').value;
    const notes = document.getElementById('jumpNotes').value.trim();

    // Validation
    if (!height || height <= 0 || height > 200) {
      Toast.error('Altura do salto inválida (0-200 cm)');
      return;
    }

    if (!date) {
      Toast.error('Data é obrigatória');
      return;
    }

    // Add record
    const record = AppState.addJumpRecord({ height, date, notes });

    if (record) {
      Toast.success('Salto registrado com sucesso! 🎉');
      document.getElementById('jumpForm').reset();
      this.setDefaultDate();
      this.renderJumpRecords();
      this.updateBestJumpDisplay();
      UI.updateBestJump();
    } else {
      Toast.error('Erro ao registrar salto');
    }
  },

  renderJumpRecords() {
    const container = document.getElementById('jumpRecordsList');
    if (!container) return;

    const records = AppState.getJumpRecordsSorted();

    if (records.length === 0) {
      container.innerHTML = `
        <div class="empty-jump-state">
          <div class="icon">🦘</div>
          <p>Nenhum salto registrado ainda.</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">Adicione seu primeiro registro acima!</p>
        </div>
      `;
      return;
    }

    const bestJump = AppState.getBestJump();

    container.innerHTML = records.map(record => {
      const isBest = bestJump && record.id === bestJump.id;
      const formattedDate = new Date(record.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      return `
        <div class="jump-record-card ${isBest ? 'best' : ''}" data-id="${record.id}">
          <div class="jump-record-header">
            <div class="jump-height-display">
              <span class="jump-height-value">${record.height}</span>
              <span class="jump-height-unit">cm</span>
            </div>
            ${isBest ? '<span class="jump-badge">🏆 Melhor</span>' : ''}
          </div>
          <div class="jump-record-details">
            <div class="jump-record-date">
              📅 ${formattedDate}
            </div>
            ${record.notes ? `<div class="jump-record-notes">"${record.notes}"</div>` : ''}
          </div>
          <div class="jump-record-actions">
            <button class="btn-icon danger" onclick="JumpTracker.deleteRecord('${record.id}')" title="Excluir">
              🗑️ Excluir
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  updateBestJumpDisplay() {
    const bestJumpEl = document.getElementById('bestJumpValue');
    if (!bestJumpEl) return;

    const bestJump = AppState.getBestJump();
    bestJumpEl.textContent = bestJump ? bestJump.height : '--';
  },

  deleteRecord(id) {
    if (confirm('Deseja realmente excluir este registro de salto?')) {
      if (AppState.deleteJumpRecord(id)) {
        Toast.success('Registro removido');
        this.renderJumpRecords();
        this.updateBestJumpDisplay();
        UI.updateBestJump();
      } else {
        Toast.error('Erro ao remover registro');
      }
    }
  }
};

// ===============================
// PROFILE MODAL
// ===============================
const ProfileModal = {
  modal: null,
  form: null,
  inputs: {},

  init() {
    this.modal = document.getElementById('profileModal');
    this.form = document.getElementById('profileForm');
    this.inputs = {
      name: document.getElementById('profileName'),
      height: document.getElementById('profileHeight'),
      position: document.getElementById('profilePosition'),
    };

    // Event listeners
    document.getElementById('profileBtn').addEventListener('click', () => this.open());
    document.getElementById('closeProfile').addEventListener('click', () => this.close());
    document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Close on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  },

  open() {
    this.loadData();
    this.modal.classList.add('show');
    this.inputs.name.focus();
  },

  close() {
    this.modal.classList.remove('show');
  },

  isOpen() {
    return this.modal.classList.contains('show');
  },

  loadData() {
    if (AppState.profile) {
      this.inputs.name.value = AppState.profile.name || '';
      this.inputs.height.value = AppState.profile.height || '';
      this.inputs.position.value = AppState.profile.position || 'Ponteiro';
    }
  },

  handleSubmit(e) {
    e.preventDefault();

    // Validate inputs
    const nameValidation = Validator.validateName(this.inputs.name.value);
    if (!nameValidation.valid) {
      Toast.error(nameValidation.message);
      this.inputs.name.focus();
      return;
    }

    const heightValidation = Validator.validateHeight(this.inputs.height.value);
    if (!heightValidation.valid) {
      Toast.error(heightValidation.message);
      this.inputs.height.focus();
      return;
    }

    const positionValidation = Validator.validatePosition(this.inputs.position.value);
    if (!positionValidation.valid) {
      Toast.error(positionValidation.message);
      return;
    }

    // Save profile
    const profileData = {
      name: nameValidation.value,
      height: heightValidation.value,
      position: positionValidation.value,
    };

    if (AppState.saveProfile(profileData)) {
      Toast.success('Perfil salvo com sucesso!');
      this.close();
      UI.updateUserName();
    } else {
      Toast.error('Erro ao salvar perfil. Tente novamente.');
    }
  },

  handleLogout() {
    if (confirm('Deseja realmente sair? Todos os dados locais serão apagados.')) {
      if (AppState.clearData()) {
        Toast.info('Dados removidos com sucesso');
        setTimeout(() => location.reload(), 1000);
      } else {
        Toast.error('Erro ao limpar dados');
      }
    }
  }
};

// ===============================
// UI UPDATES
// ===============================
const UI = {
  init() {
    this.updateUserName();
    this.updateStats();
  },

  updateUserName() {
    const nameElement = document.querySelector('.user-name');
    const welcomeNameElement = document.getElementById('welcomeName');
    const name = AppState.profile?.name || 'Atleta';

    if (nameElement) {
      nameElement.textContent = name;
    }
    if (welcomeNameElement) {
      welcomeNameElement.textContent = name;
    }
  },

  updateStats() {
    this.updateWeeklyTrainings();
    this.updateStreak();
    this.updateBestJump();
  },

  updateWeeklyTrainings() {
    const weeklyEl = document.getElementById('statWeeklyTrainings');
    if (!weeklyEl) return;

    let totalCompleted = 0;
    for (let day = 0; day < 7; day++) {
      const exercises = AppState.getExercisesForDay(day);
      const completed = exercises.filter(ex => ex.completed).length;
      totalCompleted += completed;
    }

    weeklyEl.textContent = totalCompleted;
  },

  updateStreak() {
    const streakEl = document.getElementById('statStreak');
    if (!streakEl) return;

    // Simple streak calculation: count consecutive days with completed exercises
    let streak = 0;
    const today = new Date().getDay();

    for (let i = 0; i < 7; i++) {
      const day = (today - i + 7) % 7;
      const exercises = AppState.getExercisesForDay(day);
      const hasCompleted = exercises.some(ex => ex.completed);

      if (hasCompleted) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    streakEl.textContent = streak;
  },

  updateBestJump() {
    const bestJumpEl = document.getElementById('statBestJump');
    if (!bestJumpEl) return;

    const bestJump = AppState.getBestJump();
    if (bestJump) {
      bestJumpEl.textContent = `${bestJump.height} cm`;
    } else {
      bestJumpEl.textContent = '--';
    }
  }
};

// ===============================
// APP INITIALIZATION
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  AppState.init();
  ThemeManager.init();
  Toast.init();
  Navigation.init();
  ProfileModal.init();
  TrainingManager.init();
  JumpTracker.init();
  UI.init();

  console.log('VoleiAPP initialized successfully');
  console.log('Current theme:', AppState.theme);
  console.log('Jump records:', AppState.jumpRecords.length);
});
