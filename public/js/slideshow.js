let currentSlide = 0;

function changeSlide(direction) {
  const slides = document.querySelectorAll('.slide');
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
}

// Automatically move to the next slide every 5 seconds
setInterval(() => changeSlide(1), 5000);
