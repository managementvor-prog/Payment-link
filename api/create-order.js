module.exports = async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency, label } = req.body;

  try {
    const response = await fetch('https://api.zaprite.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZAPRITE_API_KEY}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Converts to cents
        currency: currency,
        label: label
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        return res.status(response.status).json({ error: data.message || 'Zaprite error' });
    }

    res.status(200).json({ checkoutUrl: data.checkoutUrl || data.url });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
