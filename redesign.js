const fs = require('fs');
const path = require('path');

const filePath = '/Users/balaji/Documents/Natesh-Kashminds/Mobile App (Android)/cross-border-blue_base-business/app/screens/myWalletTransfer/MyWalletTransfer.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace dark card gradient with Peach gradient
content = content.replace(/\['#0F172A', '#1E293B', '#334155'\]/g, "['#E94057', '#F27121', '#E94057']");

// Replace primary blue (#0ea5e9) with Peach primary (#E94057)
content = content.replace(/#0ea5e9/g, '#E94057');
content = content.replace(/14, 165, 233/g, '233, 64, 87'); // rgba values of 0ea5e9

// Replace secondary blue (#0369a1) with Peach secondary (#F27121)
content = content.replace(/#0369a1/g, '#F27121');

// Adjust some card label text colors for the new vibrant gradient
content = content.replace(/rgba\(255,255,255,0\.5\)/g, 'rgba(255,255,255,0.8)');
content = content.replace(/rgba\(255,255,255,0\.4\)/g, 'rgba(255,255,255,0.7)');

// Update the background shape colors to peach/sunset theme
content = content.replace(/backgroundColor: 'rgba\(14, 165, 233, 0\.15\)',/g, "backgroundColor: 'rgba(233, 64, 87, 0.15)',");
content = content.replace(/backgroundColor: 'rgba\(186, 230, 253, 0\.25\)',/g, "backgroundColor: 'rgba(242, 113, 33, 0.15)',");

// Update glass overlay to have a slight warm tint instead of blue tint
content = content.replace(/backgroundColor: 'rgba\(240, 248, 255, 0\.4\)',/g, "backgroundColor: 'rgba(255, 245, 240, 0.6)',");
content = content.replace(/backgroundColor: "#F0F8FF",/g, 'backgroundColor: "#FFF5F0",');

// Update elite badge pill styling to match new vibrant theme
content = content.replace(/color: '#0ea5e9',/g, "color: '#FFF',");
content = content.replace(/borderWidth: 1,\n\s*borderColor: 'rgba\(14, 165, 233, 0\.3\)',/g, "borderWidth: 1,\n    borderColor: 'rgba(255, 255, 255, 0.3)',");

// Make card shadow softer
content = content.replace(/shadowColor: '#1E293B'/g, "shadowColor: '#E94057'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('UI updated successfully!');
