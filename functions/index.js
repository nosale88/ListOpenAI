const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const Groq = require("groq-sdk");

admin.initializeApp();

const groq = new Groq({ apiKey: functions.config().groq.apikey });

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SHEET_ID = '1T524Y2nqBCbXqPshTDXssRyoOwL-wO1cM2K2mwKKSjM';

async function getAuthToken() {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  });
  return await auth.getClient();
}

async function getSheetData(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:D',
  });
  return response.data.values;
}

async function findSimilarSites(url, sheetData) {
  const currentSite = sheetData.find(row => row[3] === url);
  if (!currentSite) return [];

  const currentCategories = currentSite[2].split(' ');

  return sheetData
    .filter(row => {
      if (row[3] === url) return false;
      const rowCategories = row[2].split(' ');
      return currentCategories.some(cat => rowCategories.includes(cat));
    })
    .map(row => ({
      name: row[0],
      iconUrl: row[1],
      category: row[2],
      url: row[3],
      updated: "Recently",
      likes: Math.floor(Math.random() * 1000)
    }));
}

async function getAIRecommendations(url, categories) {
  const prompt = `Current site: ${url}\nCategories: ${categories.join(', ')}\n\nRecommend 5 similar AI tool websites. Provide name and URL for each.`;
  
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are an AI tool recommendation expert. Suggest similar AI tools based on the provided information." },
      { role: "user", content: prompt }
    ],
    model: "llama3-8b-8192",
  });

  const recommendations = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
  return recommendations.recommendations.map(rec => ({
    name: rec.name,
    category: categories[0],
    url: rec.url,
    description: rec.description,
    iconUrl: "https://via.placeholder.com/32",
    updated: "Recently",
    likes: Math.floor(Math.random() * 1000)
  }));
}

exports.getRecommendations = functions.https.onRequest(async (req, res) => {
  try {
    const { url, isPremium } = req.body;
    
    const auth = await getAuthToken();
    const sheetData = await getSheetData(auth);
    
    let recommendations = await findSimilarSites(url, sheetData);
    
    if (!isPremium) {
      recommendations = recommendations.slice(0, 5);
    }
    
    if (recommendations.length < 5 || isPremium) {
      const currentSite = sheetData.find(row => row[3] === url);
      if (currentSite) {
        const categories = currentSite[2].split(' ');
        const aiRecommendations = await getAIRecommendations(url, categories);
        recommendations = [...recommendations, ...aiRecommendations];
        recommendations = [...new Set(recommendations.map(r => JSON.stringify(r)))].map(r => JSON.parse(r));
      }
    }
    
    res.json({ recommendations });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});