import dotenv from "dotenv";
dotenv.config();

async function run() {
  const trackingId = "727270d1-3978-41b3-954b-a838717685e3";
  const resp = await fetch(
    `https://${process.env.MIRAKL_URL}/api/orders/async-export/${trackingId}`,
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
