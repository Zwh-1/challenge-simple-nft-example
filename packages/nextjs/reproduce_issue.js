
const fs = require('fs');

function parseCSV(csvText) {
    console.log("--- Parsing CSV ---");
    console.log(`Input (first 50 chars): ${JSON.stringify(csvText.substring(0, 50))}...`);
    
    try {
        const lines = csvText.split('\n');
        // Logic from route.ts
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        console.log("Headers:", headers);

        const nftData = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                const nft = {};
                headers.forEach((header, index) => {
                    nft[header] = values[index] || '';
                });
                nftData.push(nft);
            }
        }
        return nftData;
    } catch (e) {
        console.error("Error parsing:", e.message);
        return [];
    }
}

// Test Case 1: Standard CSV
const standardCSV = `name,description,image_file
NFT1,Description1,image1.png
NFT2,Description2,image2.png`;

console.log("\nTest Case 1: Standard CSV");
console.log(JSON.stringify(parseCSV(standardCSV), null, 2));

// Test Case 2: BOM
const bomCSV = `\ufeffname,description,image_file
NFT1,Description1,image1.png`;

console.log("\nTest Case 2: BOM");
const result2 = parseCSV(bomCSV);
console.log(JSON.stringify(result2, null, 2));
if (result2.length > 0 && !result2[0].name) {
    console.log("FAIL: 'name' property missing due to BOM (likely became '\\ufeffname')");
}

// Test Case 3: Commas in quotes
const commaCSV = `name,description,image_file
NFT1,"Description, with comma",image1.png`;

console.log("\nTest Case 3: Commas in quotes");
const result3 = parseCSV(commaCSV);
console.log(JSON.stringify(result3, null, 2));
if (result3.length > 0 && result3[0].description !== "Description, with comma") {
    console.log("FAIL: Description split incorrectly");
}

// Test Case 4: Windows Line Endings
const windowsCSV = "name,description,image_file\r\nNFT1,Description1,image1.png\r\n";
console.log("\nTest Case 4: Windows Line Endings");
const result4 = parseCSV(windowsCSV);
console.log(JSON.stringify(result4, null, 2));
// Check if last property has \r
if (result4.length > 0 && result4[0].image_file.endsWith('\r')) {
     console.log("FAIL: Last value contains \\r"); // Actually the current logic does .trim() so it might handle it, but let's see.
}
