console.log("checkout.js loaded");
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  console.log('Form submitted');
  const deliveryLocation = document.querySelector('input[name="deliveryLocation"]:checked').value;
  const deliveryAddress = document.getElementById('deliveryAddress').value;

  try {
    const response = await fetch('/cart/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId, // Use the global variable set in the EJS file
        deliveryLocation,
        deliveryAddress,
      }),
    });

    const result = await response.json();
    if (response.ok) {
      alert(result.message);
      window.location.href = '/orders/history';
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error during checkout:', error);
    alert('An error occurred. Please try again.');
  }
});

// Modal functionality
document.addEventListener('DOMContentLoaded', () => {
  const checkoutBtn = document.getElementById('checkout-btn');
  const checkoutModal = document.getElementById('checkout-modal');
  const closeModal = document.getElementById('close-modal');

  if (!checkoutBtn || !checkoutModal || !closeModal) {
    console.error("One or more elements (button/modal/close button) are missing.");
    return; // Only use return here inside a conditional or function
  }

  console.log("All modal elements found:");
  console.log("Checkout Button:", checkoutBtn);
  console.log("Checkout Modal:", checkoutModal);
  console.log("Close Modal:", closeModal);

  // Open modal
  if (checkoutBtn) {
     checkoutBtn.addEventListener('click', () => {
        console.log("Checkout button clicked");
        checkoutModal.classList.toggle('hidden');
	console.log("Modal visibility toggled. Current classes:", checkoutModal.className);
     });
  } else {
     console.error("Checkout button not found in DOM.");
  }

  // Close modal
  closeModal.addEventListener('click', () => {
    checkoutModal.classList.add('hidden');
  });

  // Close modal when clicking outside the modal content
  window.addEventListener('click', (event) => {
    if (event.target === checkoutModal) {
      checkoutModal.classList.add('hidden');
    }
  });
});
