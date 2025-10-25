document.querySelectorAll('.defaultuserpic').forEach(img => {
    img.src = 'https://i.imgur.com/scCsFte.jpeg';
});


chrome.storage.sync.get("accentColor", ({ accentColor }) => {
  if (accentColor) {
    document.documentElement.style.setProperty("--accent", accentColor);
  }
});
