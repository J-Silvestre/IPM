// Built-in example accounts
const contasValidas = [
  { email: "admin@example.com", password: "123456" },
  { email: "teste@dominio.pt", password: "abc123" },
  { email: "joao@empresa.pt", password: "senha" }
];

// Enable/disable "Iniciar Sessão" based on form contents
function validateLoginForm() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  // this button exists only on the login page
  const loginBtn = document.querySelector('.btn.btn-primary[type="button"]');

  if (!emailInput || !passwordInput || !loginBtn) return;

  const hasEmail = emailInput.value.trim() !== '';
  const hasPassword = passwordInput.value.trim() !== '';
  const ok = hasEmail && hasPassword;

  loginBtn.disabled = !ok;
  loginBtn.setAttribute('aria-disabled', String(!ok));
}


function login() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("mensagem");

  // check built-in valid accounts
  const conta = contasValidas.find(c => c.email === email && c.password === password);

  // also check user-created accounts stored in localStorage under 'accounts'
  let storedAccounts = [];
  try{
    storedAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  }catch(e){ storedAccounts = []; }
  const contaLocal = storedAccounts.find(c => c.email === email && c.password === password);

  if (conta || contaLocal) {
    if(msg){ msg.style.color = "green"; msg.textContent = "Login bem-sucedido! A redirecionar..."; }
    setTimeout(() => { location.href = "area.html"; }, 800);
  } else {
    if(msg){ msg.style.color = "red"; msg.textContent = "E-mail ou password inválidos."; }
  }
}

// Theme toggle logic (kept here because index.html exposes the toggle button)
function toggleTheme() {
  const root = document.body;
  const toggled = root.classList.toggle('dark-theme');
  const icon = document.getElementById('themeToggleIcon');
  if(icon) icon.textContent = toggled ? '🌙' : '☀️';
  localStorage.setItem('theme', toggled ? 'dark' : 'light');
}

  // Toggle the help dialog visibility
  function toggleHelp(){
    const panel = document.getElementById('helpPanel');
    if(!panel) return;
    const hidden = panel.getAttribute('aria-hidden') === 'true';
    panel.setAttribute('aria-hidden', String(!hidden));
    // simple focus management: move focus into panel when opened
    if(hidden){
      const close = panel.querySelector('.help-close');
      if(close) close.focus();
    } else {
      // return focus to theme toggle for simplicity
      const themeBtn = document.querySelector('.top-icons .icon-btn[aria-label="Alternar tema"]');
      if(themeBtn) themeBtn.focus();
    }
  }

// Apply stored theme on load
window.addEventListener('DOMContentLoaded', () => {
  const theme = localStorage.getItem('theme');
  const root = document.body;
  const icon = document.getElementById('themeToggleIcon');
  if (theme === 'dark') {
    root.classList.add('dark-theme');
    if (icon) icon.textContent = '🌙';
  } else {
    root.classList.remove('dark-theme');
    if (icon) icon.textContent = '☀️';
  }
  // hook validation to inputs
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  if (emailInput) emailInput.addEventListener('input', validateLoginForm);
  if (passwordInput) passwordInput.addEventListener('input', validateLoginForm);

  // initial state
  validateLoginForm();
});



