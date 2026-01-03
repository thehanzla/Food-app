import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const testEndpoints = async () => {
  try {
    console.log("Testing /test-favorites...");
    try {
      const res1 = await axios.get(`${API_URL}/test-favorites`);
      console.log("✅ /test-favorites success:", res1.data);
    } catch (e) {
      console.log("❌ /test-favorites failed:", e.response ? e.response.status : e.message);
    }

    console.log("Testing /favorites (Expect 401 if no token)...");
    try {
      const res2 = await axios.get(`${API_URL}/favorites`);
      console.log("✅ /favorites success (Unexpected without token):", res2.data);
    } catch (e) {
      if (e.response && e.response.status === 401) {
        console.log("✅ /favorites returned 401 (Correct behavior for Protected Route)");
      } else {
        console.log("❌ /favorites failed with:", e.response ? e.response.status : e.message);
      }
    }

  } catch (error) {
    console.error("Script Error:", error.message);
  }
};

testEndpoints();
