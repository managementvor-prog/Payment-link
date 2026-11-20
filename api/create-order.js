module.exports = async function handler(req, res) {
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
        // Zaprite expects the amount as a string in the smallest unit (cents)
        amount: (Math.round(Number(amount) * 100)).toString(),
        currency: currency,
        label: label,
        redirect_url: 'https://' + req.headers.host
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("Zaprite Full Error:", JSON.stringify(data));
        return res.status(response.status).json({ error: data.message || 'Zaprite error' });
    }

    res.status(200).json({ checkoutUrl: data.checkoutUrl || data.url });
  } catch (error) {
    console.error("Backend Network Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
