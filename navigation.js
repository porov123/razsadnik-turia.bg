(() => {
  const dialog = document.getElementById('navigation-dialog');
  if (!dialog) return;
  document.querySelectorAll('.navigation-address').forEach(address => {
    address.addEventListener('click', () => dialog.showModal());
  });
  dialog.querySelector('.navigation-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  // Provider-owned HTTPS links handle installed apps and browser fallbacks.
  // No custom schemes, UA guessing or delayed redirects that can fail on iOS.
  // Google: developers.google.com/maps/documentation/urls/get-started
  // Apple: developer.apple.com/documentation/mapkit/unified-map-urls
  // Waze: developers.google.com/waze/deeplinks
  dialog.querySelectorAll('nav a').forEach(link => {
    link.target = '_blank';
    link.rel = 'noopener noreferrer external';
  });
})();
