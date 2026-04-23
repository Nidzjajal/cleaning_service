require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

console.log("Checking Twilio configuration...");
console.log("SID:", process.env.TWILIO_ACCOUNT_SID ? "Found" : "Missing");

async function checkSms() {
  try {
    const toNum = process.argv[2];
    if (!toNum) {
      console.log("Please provide a phone number to test: node test-sms.js +919999999999");
      return;
    }
    
    console.log(`Sending message from ${process.env.TWILIO_PHONE_NUMBER} to ${toNum}...`);
    const message = await client.messages.create({
      body: 'Hello from HelpLender! This is a test message to confirm your SMS is working.',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toNum
    });
    console.log("✅ SUCCESS! Message SID:", message.sid);
    console.log("You should receive the SMS text on your phone shortly.");
  } catch (error) {
    console.error("\n❌ ERROR SENDING SMS:");
    console.error(error.message);
    if (error.code === 21608) {
      console.log("\n-> This means your Twilio account is a TRIAL account, and you haven't verified this destination ('To') phone number on the Twilio website.");
    }
  }
}

checkSms();
