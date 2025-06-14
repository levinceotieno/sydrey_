console.log("checkout.js loaded");
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

// Checkout form submission
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  console.log('Form submitted');
  const deliveryLocationUI = document.querySelector('input[name="deliveryLocation"]:checked').value;
  const deliveryLocation = deliveryLocationUI === 'Within Kenya' ? 'withinKenya' : 'outsideKenya';

  const deliveryAddress = document.getElementById('deliveryAddress').value;
  const email = document.getElementById('userEmail').value;
  const userId = document.getElementById('userId').value;
	  
  const grandTotal = parseFloat(document.getElementById('grand-total').textContent.replace(/[^0-9.-]+/g, ''));

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const formattedDeliveryDate = deliveryDate.toISOString().split('T')[0]; // YYYY-MM-DD form
  
  console.log('Payment details:', { 
    email, 
    amount: grandTotal, 
    userId, 
    deliveryLocation, 
    deliveryAddress,
    deliveryDate: formattedDeliveryDate 
  });

  try {
    // Initialize Payment
    const paymentResponse = await fetch('/payment/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
	email, 
	amount: grandTotal, 
	userId, 
	deliveryLocation, 
	deliveryAddress,
	deliveryDate: formattedDeliveryDate
      }),
    });

    const paymentData = await paymentResponse.json();
    console.log('Payment initialization response:', paymentData);

    if (paymentData.status) {
      // Redirect to Paystack payment page
      window.location.href = paymentData.data.authorization_url;
    } else {
      alert('Failed to initialize payment: ' + (paymentData.message || 'Unknown error'));
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
