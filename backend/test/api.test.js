import http from "http";

console.log("Testing DentalMarket API Connection...");

http
  .get("http://localhost:4000/health", (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      const parsed = JSON.parse(data);
      if (parsed.status === "ok") {
        console.log("✅ Base Health API test passed:", parsed.message);
      } else {
        console.error("❌ Health API response unexpected:", data);
      }
    });
  })
  .on("error", (err) =>
    console.error(
      "Server offline. Start with `node src/server.js` first.",
      err.message,
    ),
  );

console.log("Testing Auth Protection on /api/orders...");
const authReq = http
  .request(
    {
      hostname: "localhost",
      port: 4000,
      path: "/api/orders",
      method: "GET",
    },
    (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const parsed = JSON.parse(data);
        if (res.statusCode === 401 && parsed.error.includes("Missing")) {
          console.log(
            "✅ Auth Protection test passed: Successfully rejected unauthenticated request.",
          );
        } else {
          console.error(
            "❌ Auth Protection test failed. Expected 401 Rejection. Got:",
            res.statusCode,
            data,
          );
        }
      });
    },
  )
  .on("error", (err) => {
    console.error("Auth test request error:", err.message);
  });
authReq.end();
