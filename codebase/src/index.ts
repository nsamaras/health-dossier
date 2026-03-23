/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();

const db = admin.firestore();

/**
 * WiFi Thermometer ingest endpoint.
 *
 * POST payload:
 * {
 *   "deviceId":    "esp32-fridge-1",
 *   "secret":      "your-device-secret",
 *   "temperature": 3.5,
 *   "slot":        "morning" | "afternoon"   // ignored for HOTS / COOKED
 * }
 *
 * Device config is stored in Firestore: thermometer-devices/{deviceId}
 * {
 *   urid:     "firebase-user-id",
 *   name:     "Ψυγείο 1",
 *   category: "FRIDGES-BY-DATE" | "FREEZERS-BY-DATE" | "HOTS-BY-DATE" | "COOKED-BY-DATE",
 *   secret:   "your-device-secret"
 * }
 *
 * Writes to: temperatures/{urid}/{category}/{docId}
 * — identical structure to saveTemperature() in temperature.service.ts
 */
export const ingestTemperature = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { deviceId, secret, temperature, slot } = req.body;

  if (!deviceId || !secret || temperature === undefined) {
    res.status(400).send("Missing required fields: deviceId, secret, temperature");
    return;
  }

  try {
    // 1. Look up device config
    const deviceDoc = await db.collection("thermometer-devices").doc(deviceId).get();
    if (!deviceDoc.exists) {
      res.status(404).send("Device not found");
      return;
    }

    const device = deviceDoc.data() as {
      urid: string;
      name: string;
      category: string;
      secret: string;
    };

    // 2. Validate secret
    if (device.secret !== secret) {
      res.status(401).send("Unauthorized");
      return;
    }

    const { urid, name, category } = device;

    // 3. Build today's midnight Timestamp (same as the Angular date-picker produces)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = admin.firestore.Timestamp.fromDate(today);

    // 4. Deterministic docId so the same device + day always hits the same document
    const dateStr = today.toISOString().split("T")[0]; // e.g. "2025-03-23"
    const docId = `${deviceId}-${dateStr}`;

    const docRef = db
      .collection("temperatures")
      .doc(urid)
      .collection(category)
      .doc(docId);

    const tempValue = String(temperature);
    const isSlotBased =
      category === "FRIDGES-BY-DATE" || category === "FREEZERS-BY-DATE";

    const existing = await docRef.get();

    if (existing.exists) {
      // 5a. Update only the relevant slot field
      const updates: Record<string, string> = {};
      if (isSlotBased) {
        updates[slot === "morning" ? "temperatureMorning" : "temperatureAfternoon"] =
          tempValue;
      } else {
        updates["temperature"] = tempValue;
      }
      await docRef.update(updates);
      logger.info(`Updated: device=${deviceId} docId=${docId} slot=${slot} temp=${temperature}`);
    } else {
      // 5b. Create new record — mirrors TemperatureModel exactly
      const newRecord: Record<string, unknown> = {
        urid,
        name,
        category,
        docId,
        date: todayTimestamp,
      };

      if (isSlotBased) {
        newRecord[slot === "morning" ? "temperatureMorning" : "temperatureAfternoon"] =
          tempValue;
      } else {
        newRecord["temperature"] = tempValue;
      }

      await docRef.set(newRecord);
      logger.info(`Created: device=${deviceId} docId=${docId} slot=${slot} temp=${temperature}`);
    }

    res.status(200).json({ success: true, docId });
  } catch (error) {
    logger.error("Error ingesting temperature:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
