document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const newMenu = document.querySelector('.new-menu');
    const backdrop = document.querySelector('.menu-backdrop');

    // Toggle menu and backdrop
    menuToggle.addEventListener('click', () => {
        newMenu.classList.toggle('show');
        backdrop.classList.toggle('show');
    });

    // Close menu when backdrop is clicked
    backdrop.addEventListener('click', () => {
        newMenu.classList.remove('show');
        backdrop.classList.remove('show');
    });

    // Collapsible menu categories
    document.querySelectorAll('.menu-category-title').forEach(title => {
        title.addEventListener('click', () => {
            const links = title.nextElementSibling;
            links.classList.toggle('show');
            title.classList.toggle('collapsed');
        });
    });
});
