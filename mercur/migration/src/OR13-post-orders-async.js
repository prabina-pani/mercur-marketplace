import dotenv from "dotenv";
dotenv.config();

async function run() {
  const resp = await fetch(
    `https://${process.env.MIRAKL_URL}/api/orders/async-export`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.API_TOKEN,
      },
      body: JSON.stringify({
        channel_codes: ["INIT"],
        end_date: "2026-01-31T00:00:00.000Z",
        fulfillment_center_codes: "fulfillment_center_codes_001",
        items_per_chunk: 10000,
        megabytes_per_chunk: 100,
        only_null_channel: false,
        order_state_codes: ["WAITING_ACCEPTANCE", "SHIPPING"],
        order_tax_mode: "TAX_INCLUDED",
        refund_state_codes: ["WAITING_REFUND"],
        start_date: "2026-01-01T00:00:00.000Z",
        tax_recalculation_required_only: true,
        waiting_funding_confirmation: false,
        waiting_tax_confirmation: false,
      }),
    },
  );

  const data = await resp.json();
  console.log(data);
}

run();
