import * as admin from "firebase-admin";
import * as express from "express";
import * as functions from "firebase-functions";

const app = express();
app.use(express.json());

// Crear un nuevo paciente
app.post("/api/patients", async (req, res) => {
  try {
    const { fullName, birthYear, documentType, documentNumber, contactInfo, medicalHistory } = req.body;
    const newPatient = {
      fullName,
      birthYear,
      documentType,
      documentNumber,
      contactInfo,
      medicalHistory,
      status: "En espera",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await admin.firestore().collection("patients").add(newPatient);
    res.status(201).json({ id: docRef.id, ...newPatient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exportar la función HTTP
export const api = functions.https.onRequest(app);