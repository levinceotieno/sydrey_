document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const newMenu = document.querySelector('.new-menu');
    const backdrop = document.querySelector('.menu-backdrop');

    menuToggle.addEventListener('click', () => {
        newMenu.classList.toggle('show');
        backdrop.classList.toggle('show');
    });

    backdrop.addEventListener('click', () => {
        newMenu.classList.remove('show');
        backdrop.classList.remove('show');
    });
});
