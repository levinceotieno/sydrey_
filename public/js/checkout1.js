//const BASE_URL = "https://uncomfortable-gertruda-sydrey-backend-3a3c7743.koyeb.app";

console.log("checkout.js loaded");

// Checkout form submission
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  console.log('Form submitted');
  const deliveryLocation = document.querySelector('input[name="deliveryLocation"]:checked').value;
  const deliveryAddress = document.getElementById('deliveryAddress').value;
  const email = 'user@example.com'; // Replace with actual user email
  const amount = grandTotal; // Use the grand total from your cart
  const userId = 123; // Replace with actual user ID from session

  try {
    // Initialize Payment
    const paymentResponse = await fetch('/payment/initialize', {
	method: 'POST',
	headers: {
	   'Content-Type': 'application/json',
	},
	body: JSON.stringify({ email, amount, userId, deliveryLocation, deliveryAddress }),
    });

    const paymentData = await paymentResponse.json();
    if (paymentData.status) {
	// Redirect to Paystack payment page
	window.location.href = paymentData.data.authorization_url;
    } else {
	alert('Failed to initialize payment');
    }
  } catch (error) {
     console.error('Error during checkout:', error);
     alert('An error occurred. Please try again.');
  }
});

  try {
    const response = await fetch(`/cart/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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

  // Ensure modal elements are present
  if (!checkoutBtn || !checkoutModal || !closeModal) {
    console.error("One or more modal elements (button/modal/close button) are missing.");
    return;
  }

  console.log("All modal elements found:");
  console.log("Checkout Button:", checkoutBtn);
  console.log("Checkout Modal:", checkoutModal);
  console.log("Close Modal:", closeModal);

  // Open modal
  checkoutBtn.addEventListener('click', () => {
    console.log("Checkout button clicked");
    if (checkoutModal.classList.contains('hidden')) {
      checkoutModal.classList.remove('hidden');
      console.log("Modal opened.");
    } else {
      console.log("Modal is already visible.");
    }
  });

  // Close modal on close button click
  closeModal.addEventListener('click', () => {
    checkoutModal.classList.add('hidden');
    console.log("Modal closed via close button.");
  });

  // Close modal when clicking outside modal content
  window.addEventListener('click', (event) => {
    if (event.target === checkoutModal) {
      checkoutModal.classList.add('hidden');
      console.log("Modal closed by clicking outside.");
    }
  });
});
