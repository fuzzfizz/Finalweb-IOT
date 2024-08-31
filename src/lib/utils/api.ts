// utils/api.ts
export async function updateBuzzerValue(buzzerValue: number) {
  try {
    const response = await fetch("/api/iot/put", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ buz: buzzerValue }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating buzzer value:", error);
    throw error;
  }
}
