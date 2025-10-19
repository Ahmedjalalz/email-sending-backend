import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ Allow CORS from your frontend only
app.use(cors({ origin: "https://autoemailsender.netlify.app" }));
app.use(express.json());

// ✅ Multer for file upload
const upload = multer({ dest: "uploads/" });

// Gmail credentials
const USER_EMAIL = "ahmedjalalzen@gmail.com";
const APP_PASSWORD = "zbhxtnikcodnfpqg";

// Root route
app.get("/", (req, res) => {
  res.send("✅ Email backend is live on Railway!");
});

// Email route
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

// ✅ Dynamic port for Railway
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
