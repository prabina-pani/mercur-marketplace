import dotenv from "dotenv";
dotenv.config();

async function run() {
  const trackingId = "41ec8b22-d41b-489f-abe5-58ee7d74bd0f";
  const resp = await fetch(
    `https://${process.env.MIRAKL_URL}/api/orders/async-export/status/${trackingId}`,
    {
      method: "GET",
      headers: {
        Authorization: process.env.API_TOKEN,
      },
    },
  );

  const data = await resp.json();
  console.log(data);
}

run();
