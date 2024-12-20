document.addEventListener('DOMContentLoaded', () => {
  const statusForms = document.querySelectorAll('.update-status-form');
  
  statusForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
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
          credentials: 'same-origin', // Important for session-based auth
          body: JSON.stringify({
            status: formData.get('status')
          })
        });
        
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

document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('.delete-order-btn');

  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const orderId = button.getAttribute('data-id'); // Add data-id attribute in HTML
      const url = `/admin/orders/delete/${orderId}`;
  
      console.log('Delete URL:', url);

      try {
        const response = await fetch(url, {
          method: 'POST',
          credentials: 'same-origin',
        });

        console.log('Response status:', response.status);
	console.log('Response headers:', response.headers);

	const responseText = await response.text();
	console.log('Response text:', responseText);

        if (!response.ok) {
          throw new Error(errorText || 'Failed to delete order.');
        }

	const result = JSON.parse(responseText);
        alert(result.message || 'Order deleted successfully');
        button.closest('.order-card').remove(); // Remove order from DOM
      } catch (err) {
        console.error('Error deleting order:', err.message);
        alert(`Failed to delete order: ${err.message}`);
      }
    });
  });
});
