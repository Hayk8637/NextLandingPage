const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Firebase Realtime Database URL
const databaseUrl = 'https://menubyqr-default-rtdb.firebaseio.com/LANDING';

// Languages to update
const languages = ['en', 'ru', 'am'];
const translationDir = path.join(__dirname, './public/locales');
async function fetchAndUpdateTranslations() {   
  console.log("Starting translation update...");
  try {
    for (const lang of languages) {
      console.log(`Fetching translations for language: ${lang}`);
      
      const response = await axios.get(`${databaseUrl}/${lang}.json`);
      const data = response.data;

      if (data) {
        const localFilePath = path.join(translationDir, lang, 'common.json');
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


setInterval(fetchAndUpdateTranslations, 360000);  