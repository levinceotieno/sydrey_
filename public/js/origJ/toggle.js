document.addEventListener('DOMContentLoaded', () => {
  const toggleMenu = document.getElementById('toggle-menu');
  const navLinks = document.getElementById('nav-links');

  if (!toggleMenu || !navLinks) {
    console.error("Toggle menu or nav links element is missing in the DOM.");
    return;
  }

  toggleMenu.addEventListener('click', () => {
    navLinks.classList.toggle('hidden');
    console.log("Toggle menu clicked, visibility toggled.");
  });
});
