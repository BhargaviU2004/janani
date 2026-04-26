import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

let twilioClient: twilio.Twilio | null = null;

function getTwilio() {
  if (!twilioClient) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required");
    }
    twilioClient = twilio(sid, token);
  }
  return twilioClient;
}

/**
 * Formats a phone number to E.164 format.
 * Defaults to India (+91) if no country code is provided for 10-digit numbers.
 */
function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, "");
  
  if (!cleaned.startsWith("+")) {
    if (cleaned.length === 10) {
      cleaned = "+91" + cleaned;
    } else if (cleaned.startsWith("91") && cleaned.length === 12) {
      cleaned = "+" + cleaned;
    }
  }
  return cleaned;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for SOS
  app.post("/api/sos", async (req, res) => {
    try {
      const { message, contacts } = req.body;
      
      console.log("Incoming SOS Request:", {
        message: message.substring(0, 50) + "...",
        contactCount: contacts?.length,
        contacts: contacts // Log full contact list for debugging
      });

      if (!contacts || !Array.isArray(contacts)) {
        return res.status(400).json({ error: "No emergency contacts listed" });
      }

      const rawFromNumber = (process.env.TWILIO_FROM_NUMBER || "").trim();
      // Remove any internal spaces or characters from the fromNumber
      const fromNumber = rawFromNumber.startsWith("+") 
        ? "+" + rawFromNumber.replace(/\D/g, "")
        : rawFromNumber.replace(/\D/g, "");

      const client = getTwilio();

      const results = await Promise.all(
        contacts.map(async (contact: any, index: number) => {
          if (contact.phone) {
            const formattedPhone = `whatsapp:${formatPhoneNumber(contact.phone)}`;
            
            // Validation: Ensure we're not using a dummy placeholder
            if (!fromNumber || fromNumber === "+1234567890") {
               const error = "TWILIO_FROM_NUMBER is missing or placeholder. Please set it to +14155238886 in Settings > Secrets.";
               console.error(`[SOS Blocked] ${error}`);
               return { error, name: contact.name };
            }

            const whatsappFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;
            
            console.log(`[SOS WhatsApp] Attempt: From ${whatsappFrom} to ${formattedPhone} (${contact.name || 'Unknown'})`);
            
            try {
              const msg = await client.messages.create({
                body: message,
                from: whatsappFrom,
                to: formattedPhone,
              });
              console.log(`[SOS Success] SID: ${msg.sid} to ${formattedPhone}`);
              return { success: true, phone: formattedPhone, name: contact.name, sid: msg.sid };
            } catch (err: any) {
              console.error(`[SOS Failed] From ${whatsappFrom} to ${formattedPhone}: ${err.message}`);
              // Provide more context for common Twilio errors
              let errorMsg = err.message;
              if (errorMsg.includes('Channel')) {
                errorMsg = `WhatsApp sender number (${whatsappFrom}) is not a registered WhatsApp sender for your Twilio account. Check your Sandbox settings.`;
              }
              return { error: errorMsg, phone: formattedPhone, name: contact.name };
            }
          }
          return { error: "No phone number provided", name: contact.name };
        })
      );

      res.json({ success: true, results });
    } catch (error: any) {
      console.error("SOS Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
