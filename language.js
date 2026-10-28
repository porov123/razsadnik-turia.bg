(() => {
  const routes = {bg: 'index.html', en: 'en.html'};
  const current = document.documentElement.lang;
  const file = location.pathname.split('/').pop();
  const detail = file.match(/^(.+)-(bg|en)\.html$/);
  const routeFor = lang => (detail ? `${detail[1]}-${lang}.html` : routes[lang]) + (lang === 'bg' ? '?lang=bg' : '') + location.hash;
  let saved;
  try { saved = localStorage.getItem('nursery-language'); if (saved && !(saved in routes)) { localStorage.removeItem('nursery-language'); saved = null; } } catch (_) {}
  if ((!file || file === 'index.html') && new URLSearchParams(location.search).get('lang') !== 'bg' && saved in routes && saved !== current) {
    location.replace(routeFor(saved));
    return;
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-language]').forEach(link => {
      const lang = link.dataset.language;
      if (!(lang in routes)) return;
      link.href = routeFor(lang);
      if (lang === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
      link.addEventListener('click', () => {
        try { localStorage.setItem('nursery-language', lang); } catch (_) {}
        link.href = routeFor(lang);
      });
    });
  });
})();
