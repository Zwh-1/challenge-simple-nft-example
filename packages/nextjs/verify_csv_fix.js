
const Papa = require('papaparse');

function parseCSV(csvText) {
    console.log("--- Parsing CSV with PapaParse ---");
    console.log(`Input (first 50 chars): ${JSON.stringify(csvText.substring(0, 50))}...`);

    const parseResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().replace(/^[\uFEFF]/, ''), // Remove BOM
    });

    if (parseResult.errors.length > 0) {
        console.warn("Warnings:", parseResult.errors);
    }

    return parseResult.data;
}

// Test Case 1: Standard CSV
const standardCSV = `name,description,image_file
NFT1,Description1,image1.png
NFT2,Description2,image2.png`;

console.log("\nTest Case 1: Standard CSV");
const result1 = parseCSV(standardCSV);
console.log(JSON.stringify(result1, null, 2));

// Test Case 2: BOM
const bomCSV = `\ufeffname,description,image_file
NFT1,Description1,image1.png`;

console.log("\nTest Case 2: BOM");
const result2 = parseCSV(bomCSV);
console.log(JSON.stringify(result2, null, 2));

if (result2.length > 0 && result2[0].name === "NFT1") {
    console.log("PASS: BOM handled correctly");
} else {
    console.error("FAIL: BOM not handled");
}

// Test Case 3: Commas in quotes
const commaCSV = `name,description,image_file
NFT1,"Description, with comma",image1.png`;

console.log("\nTest Case 3: Commas in quotes");
const result3 = parseCSV(commaCSV);
console.log(JSON.stringify(result3, null, 2));

if (result3.length > 0 && result3[0].description === "Description, with comma") {
    console.log("PASS: Quoted commas handled correctly");
} else {
    console.error("FAIL: Quoted commas not handled");
}
