// Account-creation related behavior moved from account-creation.html
(function () {
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
  if (form) form.appendChild(status);

  if (!form) {
    console.warn('createForm not found');
    return;
  }

  const email = form.elements['email'] || null;
  const password = form.elements['password'] || null;
  const concelho = form.elements['concelho'] || null;

  function getCategoriaValues(el) {
    if (!el) return [];
    if (el.selectedOptions) {
      return Array.from(el.selectedOptions)
        .map(o => (o.value || '').trim())
        .filter(Boolean);
    }
    const val = (el.value || '').trim();
    return val ? [val] : [];
  }

  function clearCategoria() {
    if (!categoria) return;
    Array.from(categoria.options || []).forEach(o => (o.selected = false));
  }

  function showCategory(show) {
    if (!wrapper) return;
    wrapper.style.display = show ? 'block' : 'none';
    if (!show) clearCategoria();
  }

  function validateForm() {
    const emailVal = (email && email.value || '').trim();
    const passVal = (password && password.value || '').trim();
    const concVal = (concelho && concelho.value || '').trim();
    const entVal = (ent && ent.value || '').trim();
    const catVals = getCategoriaValues(categoria);

    const basic = emailVal !== '' && passVal !== '' && concVal !== '' && entVal !== '';
    const ok = basic && (entVal !== 'Empreiteiro' || catVals.length > 0);

    if (btn) {
      btn.disabled = !ok;
      btn.setAttribute('aria-disabled', String(!ok));
    }

    if (!basic) {
      status.textContent = 'Preencha E-mail, Password, Entidade e Concelho para activar o botao.';
    } else if (entVal === 'Empreiteiro' && catVals.length === 0) {
      status.textContent = 'Se seleccionou Empreiteiro, escolha pelo menos uma Categoria.';
    } else {
      status.textContent = '';
    }

    console.debug('validateForm', { emailVal, passVal, concVal, entVal, catVals, ok });
    return ok;
  }

  function update() {
    if (ent) showCategory(ent.value === 'Empreiteiro');
    return validateForm();
  }

  // attach listeners defensively
  if (ent) ent.addEventListener('change', update);
  if (categoria) categoria.addEventListener('change', validateForm);
  if (concelho) concelho.addEventListener('change', validateForm);
  if (email) email.addEventListener('input', validateForm);
  if (password) password.addEventListener('input', validateForm);

  // also watch other selects inside form (in case names differ)
  Array.from(form.querySelectorAll('select')).forEach(s => s.addEventListener('change', validateForm));

  // initialize
  update();

  // helper: save all account fields into localStorage under 'accounts'
  function saveAccount(form) {
    try {
      const fields = [
        'nome', 'morada', 'codpostal', 'nif', 'telemovel',
        'concelho', 'email', 'password', 'entidade', 'categoria'
      ];
      const data = {};
      fields.forEach(name => {
        const el = form.elements[name];
        if (!el) return;

        if (name === 'categoria') {
          data[name] = (data.entidade || '').trim() === 'Empreiteiro' ? getCategoriaValues(el) : [];
          return;
        }

        const val = el.value || '';
        data[name] = name === 'email' ? val.trim().toLowerCase() : val.trim();
      });

      const email = data.email || '';
      if (!email) return;

      const stored = JSON.parse(localStorage.getItem('accounts') || '[]');
      const existing = stored.find(a => (a.email || '').toLowerCase() === email);
      if (existing) {
        Object.assign(existing, data);
      } else {
        stored.push(data);
      }
      localStorage.setItem('accounts', JSON.stringify(stored));
    } catch (err) {
      console.warn('Failed to save account to localStorage', err);
    }
  }

  // submission handler
  window.handleSubmit = function (e) {
    e.preventDefault();
    if (!validateForm()) {
      alert('Por favor, preencha todos os campos obrigatorios.');
      return;
    }
    saveAccount(form);
    location.href = 'index.html';
  };
})();
