import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// ✅ Dynamic CORS setup
const allowedOrigins = ["https://autoemailsender.netlify.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// ✅ Multer setup (store uploads in /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Gmail credentials
const USER_EMAIL = process.env.EMAIL_USER || "ahmedjalalzen@gmail.com";
const APP_PASSWORD = process.env.EMAIL_PASS || "zbhxtnikcodnfpqg";

// ✅ Root route for testing
app.get("/", (req, res) => {
  res.send("✅ Email backend is live and running!");
});

// ✅ Send Email route (multiple attachments supported)
app.post("/send-email", upload.array("attachments", 10), async (req, res) => {
  const { to, subject, message, repeat } = req.body;
  const files = req.files;

  console.log("📨 Received:", req.body);
  console.log("📎 Files:", files?.map((f) => f.originalname));

  if (!to || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields (to, subject, message)",
    });
  }

  try {
    // ✅ Setup transporter
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
      attachments: files
        ? files.map((file) => ({
            filename: file.originalname,
            path: file.path,
          }))
        : [],
    };

    const total = parseInt(repeat) || 1;
    for (let i = 0; i < total; i++) {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email ${i + 1} of ${total} sent`);
    }

    // ✅ Clean up files
    if (files?.length > 0) {
      for (const file of files) {
        fs.unlink(file.path, (err) => {
          if (err) console.error("⚠️ Error deleting file:", err);
        });
      }
    }

    res.json({ success: true, message: `All ${total} emails sent successfully!` });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Dynamic Port (for Koyeb)
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`This is after multer fix3`);
  
});
