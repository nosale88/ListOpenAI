chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ isPremium: false });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getRecommendations') {
    // Implement the logic to fetch recommendations here
    // You can use the Firebase Functions URL or implement the logic directly here
    // For now, we'll just send a mock response
    sendResponse({ recommendations: [] });
  }
});