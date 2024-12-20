const toggleMenu = document.getElementById('toggleMenu');
const menu = document.querySelector('.menu');

toggleMenu.addEventListener('click', () => {
  menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
});
