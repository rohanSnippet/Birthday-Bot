const fs = require("fs");
require("dotenv").config(); // Optional, for local .env use
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const admin = require("firebase-admin");

//const serviceAccount = require("./firebase-key.json");
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const client = new Client({
  authStrategy: new LocalAuth(), // Stores session to .wwebjs_auth
  puppeteer: {
    headless: true, // or false if you want to see the browser
  },
});

client.on("qr", (qr) => {
  console.log("Scan this QR code with WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp client is ready.");

  // Real code
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      console.log("🎉 Sending birthday wishes...");
      sendBirthdayWishes();
    }
  }, 60000); // Check every minute

  // *******Testing Code

  /*  const now = new Date();
  const targetMinute = now.getMinutes() + 1;

  console.log(
    `⌛ Waiting to send test message at ${now.getHours()}:${targetMinute}...`
  );

  const interval = setInterval(() => {
    const current = new Date();
    if (current.getMinutes() === targetMinute) {
      console.log("🎉 Sending test birthday wishes...");
      sendBirthdayWishes();
      clearInterval(interval); // Run only once
    }
  }, 5000); // Check every 5 seconds */
});

async function sendBirthdayWishes() {
  const today = new Date();
  const mmdd = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  //****** */ for json user files
  /*const users = JSON.parse(fs.readFileSync("birthdays.json"));
    users.forEach((user) => {
    if (user.dob === mmdd) {
      const chatId = `${user.number}@c.us`;
      const message = `🎉 Happy Birthday, ${user.name}! Hope you have a great year ahead! 🥳`;
      // const message = `Hi , ${user.name}! Hope you have a day year ahead! 🥳`;

      client
        .sendMessage(chatId, message)
        .then(() => console.log(`✅ Message sent to ${user.name}`))
        .catch((err) =>
          console.error(`❌ Error sending to ${user.name}:`, err)
        );
    }
  }); */

  //********for db data */
  try {
    const snapshot = await db.collection("contacts").get();
    const users = snapshot.docs.map((doc) => doc.data());

    console.log("🎯 Today:", mmdd);
    console.log("📋 Loaded users:", users.length);

    for (const user of users) {
      console.log(user);
      if (user.dob === mmdd) {
        const chatId = `${user.number}@c.us`;
        console.log(chatId);
        const message = `🎉 Happy Birthday, ${user.name}!  Hope you have a great year ahead!🥳`;
        console.log(message);
        console.log(`📤 Sending to ${user.name} (${chatId})`);
        await client.sendMessage(chatId, message);
        console.log(`✅ Sent to ${user.name}`);
      }
    }
  } catch (error) {
    console.error("❌ Error reading from Firestore:", error);
  }
}

client.initialize();
