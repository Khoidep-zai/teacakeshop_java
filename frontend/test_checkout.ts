import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

async function run() {
  try {
    // 1. Get products
    const products = await api.get('/products').then(r => r.data.content);
    console.log('Products:', products.length);
    if (products.length === 0) return;

    // 2. Create cart
    const cart = await api.post('/carts').then(r => r.data);
    const token = cart.token;
    console.log('Cart Token:', token);

    // 3. Add to cart
    await api.post(`/carts/${token}/items`, {
      itemType: 'PRODUCT',
      itemId: products[0].id,
      quantity: 1
    });
    console.log('Added item to cart');

    // 4. Checkout
    const order = await api.post('/orders/checkout', {
      cartToken: token,
      customerName: 'Test',
      customerPhone: '0123456789',
      customerEmail: 'test@test.com',
      shippingAddress: '123 Test St',
      orderType: 'NORMAL'
    }).then(r => r.data);
    console.log('Order created:', order.id, order.totalAmount);

    // 5. Simulate payment
    const payment = await api.post('/payments/simulate', {
      orderId: order.id,
      paymentMethod: 'MOMO_SIMULATION',
      purpose: 'FULL'
    }).then(r => r.data);
    console.log('Payment success:', payment.id);

  } catch (e: any) {
    console.error('Error:', e.response?.status, e.response?.data || e.message);
  }
}

run();
