const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Firebase Realtime Database URL
const databaseUrl = 'https://menubyqr-default-rtdb.firebaseio.com/LANDING';

// Languages to update
const languages = ['en', 'ru', 'am'];
const translationDir = path.join(__dirname, './public/locales');
// Function to fetch and update translations
async function fetchAndUpdateTranslations() {   
  console.log("Starting translation update...");
  console.log(translationDir.toString)
  try {
    for (const lang of languages) {
      console.log(`Fetching translations for language: ${lang}`);
      
      // Fetch translation data from Firebase Realtime Database
      const response = await axios.get(`${databaseUrl}/${lang}.json`);
      const data = response.data;

      if (data) {
        const localFilePath = path.join(translationDir, lang, 'common.json');
        // Create directory if it doesn't exist
        fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
        fs.writeFileSync(localFilePath, JSON.stringify(data, null, 2));
        console.log(`Updated translations for ${lang}:`, new Date().toLocaleString());
      } else {
        console.error(`No data found for language: ${lang}`);
      }
    }
  } catch (error) {
    console.error('Error fetching translations:', error.message);
  }
}

// Update translations immediately on startup
fetchAndUpdateTranslations();

// Schedule translations update every hour

setInterval(fetchAndUpdateTranslations, 3600);  