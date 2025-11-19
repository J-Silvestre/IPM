// Account-creation related behavior moved from account-creation.html
(function(){
  // Gather elements (some may be missing during dev; don't fail loudly)
  const ent = document.getElementById('entidadeSelect');
  const wrapper = document.getElementById('categoriaWrapper');
  const categoria = document.getElementById('categoriaSelect');
  const form = document.getElementById('createForm');
  const btn = document.getElementById('createBtn');
  const status = document.createElement('div');
  status.style.marginTop = '8px';
  status.style.color = 'var(--muted)';
  status.style.fontSize = '13px';
  status.id = 'formStatus';
  if(form) form.appendChild(status);

  if(!form){ console.warn('createForm not found'); return; }

  const email = form.elements['email'] || null;
  const password = form.elements['password'] || null;
  const concelho = form.elements['concelho'] || null;

  function showCategory(show){
    if(!wrapper) return;
    wrapper.style.display = show ? 'block' : 'none';
    if(!show && categoria) categoria.value = '';
  }

  function validateForm(){
    // safe reads
    const emailVal = (email && email.value || '').trim();
    const passVal = (password && password.value || '').trim();
    const concVal = (concelho && concelho.value || '').trim();
    const entVal = (ent && ent.value || '').trim();
    const catVal = (categoria && categoria.value || '').trim();

    const basic = emailVal !== '' && passVal !== '' && concVal !== '' && entVal !== '';
    const ok = basic && (entVal !== 'Empreiteiro' || catVal !== '');

    if(btn){
      btn.disabled = !ok;
      btn.setAttribute('aria-disabled', String(!ok));
    }

    // human readable status for debugging/feedback
    if(!basic){
      status.textContent = 'Preencha E-mail, Password, Entidade e Concelho para activar o botão.';
    } else if(entVal === 'Empreiteiro' && catVal === ''){
      status.textContent = 'Se seleccionou Empreiteiro, escolha também a Categoria.';
    } else {
      status.textContent = '';
    }

    console.debug('validateForm', {emailVal, passVal, concVal, entVal, catVal, ok});
    return ok;
  }

  function update(){
    if(ent) showCategory(ent.value === 'Empreiteiro');
    return validateForm();
  }

  // attach listeners defensively
  if(ent) ent.addEventListener('change', update);
  if(categoria) categoria.addEventListener('change', validateForm);
  if(concelho) concelho.addEventListener('change', validateForm);
  if(email) email.addEventListener('input', validateForm);
  if(password) password.addEventListener('input', validateForm);

  // also watch other selects inside form (in case names differ)
  Array.from(form.querySelectorAll('select')).forEach(s => s.addEventListener('change', validateForm));

  // initialize
  update();

  // helper: save account (email + password) into localStorage under 'accounts'
  function saveAccount(form){
    try{
      const emailField = form.elements['email'];
      const passwordField = form.elements['password'];
      const email = emailField ? (emailField.value || '').trim().toLowerCase() : '';
      const password = passwordField ? (passwordField.value || '') : '';
      if(!email || !password) return;
      const stored = JSON.parse(localStorage.getItem('accounts') || '[]');
      const existing = stored.find(a => a.email === email);
      if(existing){
        // update password for existing email
        existing.password = password;
      } else {
        stored.push({ email, password });
      }
      localStorage.setItem('accounts', JSON.stringify(stored));
    }catch(err){
      console.warn('Failed to save account to localStorage', err);
    }
  }

  // submission handler
  window.handleSubmit = function(e){
    e.preventDefault();
    if(!validateForm()){
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    // persist credentials (email + password) locally
    saveAccount(form);
    // proceed: redirect to login page (no popup)
    location.href = 'index.html';
  };

})();
