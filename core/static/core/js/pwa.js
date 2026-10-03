(() => {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(() => {}));

  let installPrompt;
  const button = document.createElement('button');
  button.className = 'pwa-install-button';
  button.type = 'button';
  button.textContent = 'Install SportIQ';
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
