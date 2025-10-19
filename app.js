import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));

// Multer handles multipart/form-data (for text + file)
const upload = multer({ dest: "uploads/" });

// Gmail credentials (you can switch to env vars later)
const USER_EMAIL = "ahmedjalalzen@gmail.com";
const APP_PASSWORD = "zbhxtnikcodnfpqg";

console.log("DEBUG → EMAIL_USER:", JSON.stringify(USER_EMAIL));
console.log("DEBUG → EMAIL_PASS:", JSON.stringify(APP_PASSWORD));

app.get("/", (req, res) => {
  res.send("✅ Email backend is running successfully on Railway!");
});

app.post("/send-email", upload.single("attachment"), async (req, res) => {
  const { to, subject, message, repeat } = req.body;
  const file = req.file;

  console.log("📨 Received fields:", req.body);
  console.log("📎 File:", file?.originalname);

  if (!to || !subject || !message) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: USER_EMAIL,
        pass: APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: USER_EMAIL,
      to,
      subject,
      text: message,
      attachments: file
        ? [{ filename: file.originalname, path: file.path }]
        : [],
    };

    for (let i = 0; i < repeat; i++) {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email ${i + 1} sent successfully`);
    }

    if (file) fs.unlinkSync(file.path);

    res.json({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Use dynamic Railway port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
