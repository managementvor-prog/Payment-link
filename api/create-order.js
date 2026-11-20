module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency, label } = req.body;

  // Log incoming request for debugging
  console.log("Incoming request:", { amount, currency, label });

  try {
    const response = await fetch('https://api.zaprite.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZAPRITE_API_KEY}`
      },
      body: JSON.stringify({
        // Zaprite expects an integer in the smallest unit (e.g., cents)
        amount: Math.round(Number(amount) * 100),
        currency: currency,
        label: label,
        redirect_url: 'https://' + req.headers.host
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        // This will print the FULL error to your Vercel logs
        console.error("Zaprite Full Error:", JSON.stringify(data));
        return res.status(response.status).json({ error: data.message || 'Zaprite error' });
    }

    res.status(200).json({ checkoutUrl: data.checkoutUrl || data.url });
  } catch (error) {
    console.error("Backend Network Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
