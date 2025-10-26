import axios from "axios";

const DEMO_DEVICES_URL = "https://demoapi.example.com/devices"; // replace if you have a real demo api

export async function fetchDeviceList() {
  try {
    const res = await axios.get("http://68fe47e07c700772bb135bfd.mockapi.io/deviceList", { timeout: 3000 });
    console.log(res)
    if (Array.isArray(res.data)) return res.data;
  } catch (e) {
  }
  return [
    { id: "dev-1", name: "Greenhouse Sensor A" },
    { id: "dev-2", name: "Warehouse Sensor B" },
    { id: "dev-3", name: "Office Sensor C" }
  ];
}
