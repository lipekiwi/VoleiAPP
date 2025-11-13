// ===============================
// NAVEGAÇÃO ENTRE AS SEÇÕES
// ===============================
const sections = {
  home: document.getElementById("homeSection"),
  treinos: document.getElementById("treinosSection"),
  historico: document.getElementById("historicoSection"),
};

function showSection(section) {
  for (const key in sections) {
    sections[key].classList.remove("active");
  }
  sections[section].classList.add("active");
}

// Botões do menu inferior
document.getElementById("homeBtn").addEventListener("click", () => showSection("home"));
document.getElementById("treinosBtn").addEventListener("click", () => showSection("treinos"));
document.getElementById("historicoBtn").addEventListener("click", () => showSection("historico"));

// ===============================
// PERFIL LOCAL - SALVAR E CARREGAR
// ===============================
const profileForm = document.getElementById("profileForm");
const profileModal = document.getElementById("profileModal");
const logoutBtn = document.getElementById("logoutBtn");
const closeProfile = document.getElementById("closeProfile");
const profileBtn = document.getElementById("profileBtn");

function loadProfile() {
  const savedProfile = JSON.parse(localStorage.getItem("userProfile"));
  if (savedProfile) {
    document.getElementById("profileName").value = savedProfile.name;
    document.getElementById("profileHeight").value = savedProfile.height;
    document.getElementById("profilePosition").value = savedProfile.position;
  }
}

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const profileData = {
    name: document.getElementById("profileName").value,
    height: document.getElementById("profileHeight").value,
    position: document.getElementById("profilePosition").value,
  };
  localStorage.setItem("userProfile", JSON.stringify(profileData));
  alert("Perfil salvo com sucesso!");
  profileModal.classList.add("hidden");
  updateHomeProfile();
});

logoutBtn.addEventListener("click", () => {
  if (confirm("Deseja realmente sair? Todos os dados locais serão apagados.")) {
    localStorage.clear();
    alert("Você saiu do app. Perfil removido.");
    location.reload();
  }
});

closeProfile.addEventListener("click", () => {
  profileModal.classList.add("hidden");
});

profileBtn.addEventListener("click", () => {
  loadProfile();
  profileModal.classList.remove("hidden");
});

function updateHomeProfile() {
  const savedProfile = JSON.parse(localStorage.getItem("userProfile"));
  const nameField = document.querySelector(".user-name");
  if (savedProfile && nameField) {
    nameField.textContent = savedProfile.name || "Atleta";
  }
}

// ===============================
// MOSTRAR DIA DA SEMANA
// ===============================
function mostrarDiaAtual() {
  const dias = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
  const hoje = new Date();
  const dia = dias[hoje.getDay()];
  document.getElementById("diaAtual").textContent = dia;
}

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  updateHomeProfile();
  mostrarDiaAtual();
});

// ===============================
// TEMA CLARO/ESCURO
// ===============================
const themeToggle = document.getElementById("toggleTheme");

function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☀️ Modo Claro" : "🌙 Modo Escuro";
}

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  updateHomeProfile();
  mostrarDiaAtual();
});

