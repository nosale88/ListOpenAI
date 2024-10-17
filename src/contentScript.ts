// This script runs on every page
// You can use it to inject UI elements or gather information about the current page

console.log('AI Recommendation Extension content script loaded');

// Example: Send the current URL to the background script
chrome.runtime.sendMessage({
  action: 'getRecommendations',
  url: window.location.href
});