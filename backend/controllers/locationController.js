
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_KEY = process.env.POSITIONSTACK_API_KEY;

export const searchPlaces = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: "Query is required" });

    const url = `http://api.positionstack.com/v1/forward?access_key=${ACCESS_KEY}&query=${encodeURIComponent(query)}`;
    console.log(`Searching Positionstack: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("Positionstack Error:", data.error);
      return res.status(400).json({ success: false, message: data.error.message || "Positionstack API Error" });
    }

    res.status(200).json({ success: true, data: data.data });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ success: false, message: "Error fetching data from Positionstack", error: error.message });
  }
};

export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: "Latitude and Longitude are required" });

    const query = `${lat},${lon}`;
    const url = `http://api.positionstack.com/v1/reverse?access_key=${ACCESS_KEY}&query=${query}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("Positionstack Reverse Geocode Error:", data.error);
      return res.status(400).json({ success: false, message: data.error.message });
    }

    res.status(200).json({ success: true, data: data.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching data from Positionstack", error: error.message });
  }
};

export const getIpLocation = async (req, res) => {
  try {
    const ip = req.query.ip || ''; // Optional: Pass specific IP
    const accessKey = process.env.APIIP_KEY;
    if (!accessKey) {
      return res.status(500).json({ success: false, message: "APIIP_KEY not configured" });
    }

    const url = `https://apiip.net/api/check?accessKey=${accessKey}${ip ? `&ip=${ip}` : ''}`;
    console.log(`Fetching IP Location: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Apiip HTTP Status: ${response.status}`);
    }
    const data = await response.json();

    if (data.success === false) { // Apiip returns validation errors in this format sometimes? Check docs. Usually check 'code' or 'success' if wrapper.
      // Based on user snippet, axios.get(url).data returns the object directly.
    }

    // Check for specific error fields if any, apiip usually just returns the object or an error object.
    if (data.error) {
      return res.status(400).json({ success: false, message: data.error.info || "Apiip Error" });
    }

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error("Apiip Error:", error);
    res.status(500).json({ success: false, message: "Error fetching IP location", error: error.message });
  }
};
