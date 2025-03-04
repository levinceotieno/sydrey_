document.addEventListener("DOMContentLoaded", function() {
    const menuToggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu");
    const main = document.querySelector("main");
    let touchStartX = 0;
    let touchEndX = 0;

    // Toggle menu
    menuToggle.addEventListener("click", function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener("click", function(e) {
        if (menu.classList.contains("visible") && 
            !menu.contains(e.target) && 
            e.target !== menuToggle) {
            menu.classList.remove("visible");
        }
    });

    // Swipe to open/close menu
    document.addEventListener("touchstart", function(e) {
        touchStartX = e.touches[0].clientX;
    }, false);

    document.addEventListener("touchend", function(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        const threshold = 100; // minimum distance for swipe

        if (Math.abs(swipeDistance) >= threshold) {
            if (swipeDistance > 0 && touchStartX < 50) {
                // Swipe right from left edge
                menu.classList.add("visible");
            } else if (swipeDistance < 0 && menu.classList.contains("visible")) {
                // Swipe left when menu is open
                menu.classList.remove("visible");
            }
        }
    }

    function toggleMenu() {
        menu.classList.toggle("visible");
    }
});
