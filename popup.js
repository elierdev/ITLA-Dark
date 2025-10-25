// Agregar transición a todos los elementos que usen los acentos
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: () => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease !important;
        }
      `;
      document.head.appendChild(style);
    }
  });
});

// Evento para cada color
document.querySelectorAll(".color").forEach(el => {
  el.addEventListener("click", () => {
    const color = el.dataset.color;

    // Guardar color en storage
    chrome.storage.sync.set({ accentColor: color }, () => {
      // Aplicar en la página activa dinámicamente
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (color) => {
            // Cambiar variables de acento principales
            document.documentElement.style.setProperty("--accent", color);

            // Generar un segundo tono para --accent-sec (más oscuro)
            const adjust = (c, amt) => {
              let usePound = false;
              if (c[0] === "#") {
                c = c.slice(1);
                usePound = true;
              }
              let num = parseInt(c, 16);
              let r = (num >> 16) + amt;
              let g = ((num >> 8) & 0x00FF) + amt;
              let b = (num & 0x0000FF) + amt;
              r = Math.min(255, Math.max(0, r));
              g = Math.min(255, Math.max(0, g));
              b = Math.min(255, Math.max(0, b));
              return (usePound ? "#" : "") + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            };

            const darker = adjust(color, -30);
            document.documentElement.style.setProperty("--accent-sec", darker);
          },
          args: [color]
        });
      });
    });
  });
});

// Al abrir el popup, aplicar el color guardado sin recargar
chrome.storage.sync.get("accentColor", ({ accentColor }) => {
  if (accentColor) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (color) => {
          document.documentElement.style.setProperty("--accent", color);
          const adjust = (c, amt) => {
            let usePound = false;
            if (c[0] === "#") {
              c = c.slice(1);
              usePound = true;
            }
            let num = parseInt(c, 16);
            let r = (num >> 16) + amt;
            let g = ((num >> 8) & 0x00FF) + amt;
            let b = (num & 0x0000FF) + amt;
            r = Math.min(255, Math.max(0, r));
            g = Math.min(255, Math.max(0, g));
            b = Math.min(255, Math.max(0, b));
            return (usePound ? "#" : "") + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          };
          const darker = adjust(color, -30);
          document.documentElement.style.setProperty("--accent-sec", darker);
        },
        args: [accentColor]
      });
    });
  }
});
