import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ Allow your Netlify frontend to access backend
app.use(
  cors({
    origin: "https://autoemailsender.netlify.app",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// ✅ Multer for file uploads
const upload = multer({ dest: "uploads/" });

// ✅ Gmail credentials (you can later move these to Railway variables)
const USER_EMAIL = "ahmedjalalzen@gmail.com";
const APP_PASSWORD = "zbhxtnikcodnfpqg";

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("✅ Email backend is live on Railway!");
});

// ✅ Email route
app.post("/send-email", upload.single("attachment"), async (req, res) => {
  const { to, subject, message, repeat } = req.body;
  const file = req.file;

  console.log("📨 Received:", req.body);
  console.log("📎 Attachment:", file?.originalname);

  if (!to || !subject || !message) {
    return res
      .status(400)
      .json({ success: false, message: "Missing email fields" });
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

    for (let i = 0; i < (repeat || 1); i++) {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email ${i + 1} sent successfully`);
    }

    if (file) fs.unlinkSync(file.path);

    res.json({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Dynamic port (Railway requires this)
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
