//const BASE_URL = "https://uncomfortable-gertruda-sydrey-backend-3a3c7743.koyeb.app";

document.addEventListener('DOMContentLoaded', () => {
  const statusForms = document.querySelectorAll('.update-status-form');
  statusForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      //const url = `${BASE_URL}${form.action.replace(window.location.origin, '')}`; // Ensure BASE_URL is used
      const url = form.action;
      try {
        console.log('Submitting to URL:', url);
        console.log('Status:', formData.get('status'));
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
	  credentials: 'include',
	  body: JSON.stringify({ status: formData.get('status') })
	});
          //credentials: 'same-origin', // Important for session-based auth
          //body: JSON.stringify({
            //status: formData.get('status')
          //})
        //});
        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(errorText || 'Failed to update order status');
        }
        const result = await response.json();
        // Update the status in the DOM
        const statusElement = form.closest('.order-card').querySelector('[data-status]');
        if (statusElement) {
          statusElement.textContent = result.newStatus;
        }
        alert('Order status updated successfully');
      } catch (error) {
        console.error('Full Error:', error);
        alert(`Failed to update order status: ${error.message}`);
      }
    });
  });
});

document.querySelectorAll('.delete-order-btn').forEach(button => {
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    const orderId = event.target.dataset.id;
    
    if (!orderId) {
      console.error('No order ID found');
      return;
    }

    if (confirm('Are you sure you want to delete this order?')) {
      try {
        const response = await fetch(`/admin/orders/${orderId}/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
	  credentials: 'include'
          //credentials: 'same-origin'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('Order deleted successfully');
        window.location.reload();
      } catch (error) {
        console.error('Error deleting order:', error.message);
        alert('Failed to delete order');
      }
    }
  });
});
