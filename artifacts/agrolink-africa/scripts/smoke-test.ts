import { useFarmers } from "@/store/farmers";

async function run() {
  try {
    const store = useFarmers as any;
    const before = store.getState().farmers.length;
    console.log("Farmers before:", before);

    const newFarmer = store.getState().addFarmer({
      firstName: "Smoke",
      lastName: "Test",
      gender: "M",
      dob: "1990-01-01",
      nationalId: "SMOKE-001",
      phone: "+263700000000",
      provinceId: "p-har",
      districtId: "d-har",
      wardId: "w-d-har-1",
      villageId: "v-w-d-har-1-1",
      farmSizeHa: 1.5,
      crops: ["Maize"],
      livestock: [],
    });

    const after = store.getState().farmers.length;
    console.log("Added farmer id:", newFarmer.id);
    console.log("Farmers after:", after);

    if (after === before + 1) {
      console.log("SMOKE TEST: PASS - farmer added and store updated.");
      process.exit(0);
    } else {
      console.error("SMOKE TEST: FAIL - store length did not increase.");
      process.exit(2);
    }
  } catch (err) {
    console.error("SMOKE TEST: ERROR", err);
    process.exit(3);
  }
}

run();