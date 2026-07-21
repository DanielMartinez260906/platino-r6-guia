// public/js/pwa.js
// Manejo de la instalación de la PWA en PC y Móvil

let deferredPrompt;
const installAppBtn = document.getElementById("installAppBtn");

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => console.log('PWA Service Worker registrado correctamente.', reg.scope))
      .catch((err) => console.warn('Error al registrar Service Worker:', err));
  });
}

// Capturar el evento beforeinstallprompt de Chrome/Edge/Android
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installAppBtn) {
    installAppBtn.classList.remove('hidden');
    installAppBtn.classList.add('pulse-gold');
  }
});

// Evento de clic en el botón de instalación
if (installAppBtn) {
  installAppBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA Prompt resultado: ${outcome}`);
      deferredPrompt = null;
      installAppBtn.classList.add('hidden');
    } else {
      // Si el navegador no dispara beforeinstallprompt o es iOS
      alert(
        "📱 Para instalar esta App en tu dispositivo:\n\n" +
        "• En Android / PC Chrome / Edge: Haz clic en el menú (⋮ o ⊕) y selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'.\n" +
        "• En iPhone / iPad (Safari): Toca el botón 'Compartir' (📤) y selecciona 'Agregar a inicio'."
      );
    }
  });
}

// Detectar si la App ya se abrió en modo Standalone instalada
window.addEventListener('appinstalled', () => {
  console.log('¡PWA Instalada con éxito!');
  if (installAppBtn) installAppBtn.classList.add('hidden');
});
