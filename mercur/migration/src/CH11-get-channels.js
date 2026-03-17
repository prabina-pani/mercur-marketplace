import dotenv from "dotenv";
dotenv.config();

async function run() {
  const resp = await fetch(
    `https://${process.env.MIRAKL_URL}/api/channels`,
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
