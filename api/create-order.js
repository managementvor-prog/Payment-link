module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Log the incoming request for debugging
  console.log("Incoming request:", req.body);

  const { amount, currency, label } = req.body;

  try {
    const response = await fetch('https://api.zaprite.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZAPRITE_API_KEY}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Converts to cents (integer)
        currency: currency,
        label: label,
        externalUniqId: `order-${Date.now()}`, // Unique ID to prevent duplicate issues
        redirect_url: 'https://' + req.headers.host // Optional but recommended
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
