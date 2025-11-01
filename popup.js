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

            // Generar un fondo oscuro basado en el tono del color principal
            const createDarkBackground = (hexColor) => {
              // Convertir hex a RGB
              let r = parseInt(hexColor.slice(1, 3), 16);
              let g = parseInt(hexColor.slice(3, 5), 16);
              let b = parseInt(hexColor.slice(5, 7), 16);
              
              // Reducir cada canal a una fracción muy pequeña (creando un fondo casi negro con tinte del color)
              r = Math.floor(r * 0.04);
              g = Math.floor(g * 0.04);
              b = Math.floor(b * 0.04);
              
              // Convertir de vuelta a hex
              return "#" + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
              }).join("");
            };

            const darkBg = createDarkBackground(color);
            document.documentElement.style.setProperty("--accent-sec", darkBg);
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
          // Generar un fondo oscuro basado en el tono del color principal
          const createDarkBackground = (hexColor) => {
            // Convertir hex a RGB
            let r = parseInt(hexColor.slice(1, 3), 16);
            let g = parseInt(hexColor.slice(3, 5), 16);
            let b = parseInt(hexColor.slice(5, 7), 16);
            
            // Reducir cada canal a una fracción muy pequeña (creando un fondo casi negro con tinte del color)
            r = Math.floor(r * 0.04);
            g = Math.floor(g * 0.04);
            b = Math.floor(b * 0.04);
            
            // Convertir de vuelta a hex
            return "#" + [r, g, b].map(x => {
              const hex = x.toString(16);
              return hex.length === 1 ? "0" + hex : hex;
            }).join("");
          };

          const darkBg = createDarkBackground(color);
          document.documentElement.style.setProperty("--accent-sec", darkBg);
        },
        args: [accentColor]
      });
    });
  }
});
