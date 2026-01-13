import XLSX from 'xlsx';

// File path
const filePath = './public/sales_data.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = 'Sales';

    if (!workbook.SheetNames.includes(sheetName)) {
        console.error(`Sheet "${sheetName}" not found. Available sheets:`, workbook.SheetNames);
        process.exit(1);
    }

    const sheet = workbook.Sheets[sheetName];
    // Get headers (first row)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const headers = data[0];

    console.log('HEADERS:', JSON.stringify(headers));

    // Show a sample row to understand data types
    if (data.length > 1) {
        console.log('SAMPLE:', JSON.stringify(data[1]));
    }
} catch (error) {
    console.error('Error reading file:', error.message);
}
