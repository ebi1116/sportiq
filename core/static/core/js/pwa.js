(() => {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').then(registration => registration.update()).catch(() => {}));

  let installPrompt;
  const button = document.createElement('button');
  button.className = 'pwa-install-button';
  button.type = 'button';
  button.setAttribute('aria-label', 'Install SportIQ app');
  const logo = document.createElement('img');
  logo.className = 'pwa-install-logo';
  logo.src = '/static/core/img/pwa-192.png';
  logo.alt = '';
  const copy = document.createElement('span');
  copy.className = 'pwa-install-copy';
  const title = document.createElement('strong');
  title.textContent = 'Install SportIQ';
  const subtitle = document.createElement('small');
  subtitle.textContent = 'Add to your home screen';
  const arrow = document.createElement('span');
  arrow.className = 'pwa-install-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↓';
  copy.append(title, subtitle);
  button.append(logo, copy, arrow);
  button.hidden = true;
  document.body.append(button);

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    button.hidden = false;
  });
  button.addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    button.hidden = true;
  });
  window.addEventListener('appinstalled', () => { button.hidden = true; });
})();
