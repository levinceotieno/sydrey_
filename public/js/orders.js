async function updateCart(productId) {
  const quantityInput = document.getElementById(`quantity-${productId}`);
  const quantity = parseInt(quantityInput.value);

  if (quantity < 1) {
    alert("Quantity must be at least 1.");
    return;
  }

  try {
    const response = await fetch('/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    });

    const result = await response.json();
    if (result.success) {
      alert(result.message || 'Cart updated successfully.');
      window.location.reload(); // Refresh the cart page to show updated data
    } else {
      alert(result.message || 'Failed to update the cart.');
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    alert('An error occurred while updating the cart.');
  }
}

async function removeFromCart(productId) {
  if (!confirm("Are you sure you want to remove this item from the cart?")) {
    return;
  }

  try {
    const response = await fetch('/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
