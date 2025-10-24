import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";
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

// ✅ Multer memory storage (no file system)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Gmail credentials
const USER_EMAIL = process.env.EMAIL_USER;
const APP_PASSWORD = process.env.EMAIL_PASS;
// const USER_EMAIL = process.env.EMAIL_USER || "ahmedjalalzen@gmail.com";
// const APP_PASSWORD = process.env.EMAIL_PASS || "zbhxtnikcodnfpqg";

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Email backend is live and running!");
});

// ✅ Send Email route (with progress tracking)
app.post("/send-email", upload.array("attachments", 10), async (req, res) => {
  const { to, subject, message, repeat } = req.body;
  const files = req.files;

  if (!to || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields (to, subject, message)",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: USER_EMAIL, pass: APP_PASSWORD },
    });

    const attachments =
      files?.map((file) => ({
        filename: file.originalname,
        content: file.buffer,
      })) || [];

    const mailOptions = {
      from: USER_EMAIL,
      to,
      subject,
      text: message,
      attachments,
    };

    const total = parseInt(repeat) || 1;
    let sent = 0;

    for (let i = 0; i < total; i++) {
      await transporter.sendMail(mailOptions);
      sent++;
      console.log(`✅ Email ${sent} of ${total} sent`);
    }

    res.json({
      success: true,
      message: `✅ All ${total} emails sent successfully!`,
    });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Dynamic Port (for deployment)
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Env aded`);
});
