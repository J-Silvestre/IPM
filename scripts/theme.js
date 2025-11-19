// Apply saved theme preference on pages that don't load the full login.js
(function applySavedTheme(){
  try{
    const theme = localStorage.getItem('theme');
    if(theme === 'dark') document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
  }catch(e){
    // silent fail
    console.warn('theme.js: cannot read theme from localStorage', e);
  }
})();
(function(){
  'use strict';

  function applyTheme(){
    try{
      const theme = localStorage.getItem('theme');
      if(theme === 'dark') document.body.classList.add('dark-theme');
      else document.body.classList.remove('dark-theme');
    }catch(e){
      // ignore
    }
  }

  function toggleTheme(iconEl){
    try{
      const isDark = document.body.classList.toggle('dark-theme');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      if(iconEl){ iconEl.textContent = isDark ? '🌙' : '☀️'; }
      return isDark;
    }catch(e){ return false; }
  }

  // expose a global helper
  window.theme = { applyTheme, toggleTheme };

  // apply as early as possible
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyTheme);
  else applyTheme();
})();
