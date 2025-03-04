//const BASE_URL = "https://uncomfortable-gertruda-sydrey-backend-3a3c7743.koyeb.app";

async function updateCart(productId) {
  const quantityInput = document.getElementById(`quantity-${productId}`);
  const quantity = parseInt(quantityInput.value);

  if (quantity < 1) {
    alert("Quantity must be at least 1.");
    return;
  }

  try {
    // Disable the input to prevent further changes during processing
    quantityInput.disabled = true;

    const response = await fetch(`/cart/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId, quantity }),
    });

    const result = await response.json();
    if (result.success) {
      const totalPriceElement = document.getElementById(`total-price-${productId}`);
      totalPriceElement.textContent = `Ksh. ${quantity * result.pricePerUnit}`;

      const grandTotalElement = document.getElementById('grand-total');
      const allPrices = Array.from(document.querySelectorAll('[id^="total-price-"]'))
	.map(el => parseFloat(el.textContent.replace('Ksh.', '').trim()));
      const grandTotal = allPrices.reduce((sum, price) => sum + price, 0);
      grandTotalElement.textContent = `Ksh. ${grandTotal}`;
    } else {
      alert(result.message || 'Failed to update the cart.');
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    alert('An error occurred while updating the cart.');
  } finally {
      // Re-enable the input after processing is complete
      quantityInput.disabled = false;
  }
}

async function removeFromCart(productId) {
  if (!confirm("Are you sure you want to remove this item from the cart?")) {
    return;
  }

  try {
    const response = await fetch(`/cart/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId }),
    });

    const result = await response.json();
    if (result.success) {
      alert(result.message || 'Item removed from the cart.');
      window.location.reload(); // Refresh the cart page to show updated data
    } else {
      alert(result.message || 'Failed to remove item from the cart.');
    }
  } catch (error) {
    console.error('Error removing item from cart:', error);
    alert('An error occurred while removing the item.');
  }
}

async function updateStatus(orderId, newStatus) {
  try {
      const response = await fetch(`/admin/update-order-status`, {
	method: 'POST',
	headers: {
	       'Content-Type': 'application/json',
	},
	credentials: 'include',
	body: JSON.stringify({ orderId, status: newStatus }),
      });
      const result = await response.json();
      if (result.success) {
	 alert('Order status updated successfully');
      } else {
	 alert('Failed to update order status');
      }
  } catch (error) {
     console.error('Error updating order status:', error);
  }
}

async function deleteOrder(orderId) {
   if (!confirm('Are you sure you want to delete this order?')) return;
   try {
      const response = await fetch(`/admin/delete-order/${orderId}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
	 alert('Order deleted successfully');
	 location.reload(); // Refresh the page
      } else {
	 alert('Failed to delete order');
      }
   } catch (error) {
	console.error('Error deleting order:', error);
   }
}
