import https from "https";

https.get("https://api.ipify.org?format=json", res => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => console.log("Server IP:", data));
});