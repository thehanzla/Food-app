
import qs from 'querystring';
import https from 'https';

const RAPIDAPI_KEY = '326127e79emsh9cd3b10c228ffd4p1339c0jsn013052ce2bc7';

async function testRapidApi() {
  console.log("--- Testing RapidAPI (Worldwide Restaurants) ---");

  const postData = qs.stringify({
    language: 'en_US',
    location_id: '1', // Just creating dummy data to see what endpoint expects
    currency: 'USD'
  });

  // The user snippet used /detail with empty body. Let's try to search first if we want 'Lahore'.
  // Usually 'worldwide-restaurants' has a /search endpoint.
  // The snippet provided: path: '/detail', body: qs.stringify({})
  // We will try exactly the user snippet first to see what it returns (maybe 400 or a default list).

  // Testing /search with probable Location ID for Lahore (TripAdvisor often uses 295413)
  const options = {
    method: 'POST',
    hostname: 'worldwide-restaurants.p.rapidapi.com',
    port: null,
    path: '/search',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'worldwide-restaurants.p.rapidapi.com',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  console.log("Testing /search for Lahore (ID: 295413)...");

  const searchBody = qs.stringify({
    location_id: '295413',
    language: 'en_US',
    currency: 'USD'
  });

  const req = https.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
      chunks.push(chunk);
    });

    res.on('end', function () {
      const body = Buffer.concat(chunks);
      console.log("Status Code:", res.statusCode);
      const responseText = body.toString();

      try {
        const json = JSON.parse(responseText);
        // Log brief details if successful
        if (json.results && json.results.data) {
          console.log(`\nFound ${json.results.data.length} restaurants!`);
          console.log("Sample 1:", json.results.data[0].name);
          console.log("Sample 2:", json.results.data[1]?.name);
        } else {
          console.log("\nFull Response:", JSON.stringify(json, null, 2));
        }
      } catch (e) {
        console.log("Response (Text):", responseText.substring(0, 500));
      }
    });
  });

  req.write(searchBody);
  req.end();
}

testRapidApi();
