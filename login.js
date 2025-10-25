(async () => {
  // Cifrar y descifrar usando Web Crypto API
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  async function getKey() {
    const keyData = await crypto.subtle.digest("SHA-256", encoder.encode("itla-extension-secret"));
    return crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  }

  async function encrypt(text) {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(text));
    return { cipher: Array.from(new Uint8Array(encrypted)), iv: Array.from(iv) };
  }

  async function decrypt(cipher, iv) {
    const key = await getKey();
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, new Uint8Array(cipher));
    return decoder.decode(decrypted);
  }

  // Referencias del formulario
  const usernameInput = document.querySelector("#username");
  const passwordInput = document.querySelector("#password");
  const loginForm = document.querySelector("form#login");

  if (!usernameInput || !passwordInput || !loginForm) return;

  // Boton para borrar los datos
  const clearBtn = document.createElement("button");
  clearBtn.textContent = "No guardar mi contraseña";
  clearBtn.type = "button";
  clearBtn.style.marginTop = "10px";
  clearBtn.className = "btn btn-block";
  passwordInput.parentNode.appendChild(clearBtn);

  // Intentar autocompletar si hay datos guardados
  chrome.storage.local.get(["userData"], async (result) => {
    if (result.userData) {
      try {
        const { username, cipher, iv } = result.userData;
        const decryptedPass = await decrypt(cipher, iv);
        usernameInput.value = username;
        passwordInput.value = decryptedPass;
      } catch (e) {
        console.error("Error al descifrar:", e);
      }
    }
  });

  // Guardar credenciales cifradas al iniciar sesión
  loginForm.addEventListener("submit", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username && password) {
      const { cipher, iv } = await encrypt(password);
      await chrome.storage.local.set({ userData: { username, cipher, iv } });
    }
  });

  // Borrar credenciales guardadas
  clearBtn.addEventListener("click", async () => {
    await chrome.storage.local.remove("userData");
    usernameInput.value = "";
    passwordInput.value = "";
  });
})();
