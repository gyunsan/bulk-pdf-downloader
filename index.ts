import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';

async function downloadPDFs() {
    try {
        // Read the CSV file
        const csvData = readFileSync('input.csv', 'utf-8');

        // Parse CSV data
        const records = parse(csvData, {
            columns: true,
            skip_empty_lines: true
        });

        // Create downloads directory if it doesn't exist
        const downloadDir = join(process.cwd(), 'downloads');
        if (!await Bun.file(downloadDir).exists()) {
            mkdirSync(downloadDir, { recursive: true });
        }

        // Download each PDF
        for (const record of records) {
            const pdfUrl = record.pdfUrl;
            const fileName = pdfUrl.split('/').pop(); // Simpler way to get filename
            const filePath = join(downloadDir, fileName);

            try {
                // Ensure the file is writable
                const file = Bun.file(filePath);
                const response = await fetch(pdfUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

                const pdfBuffer = await response.arrayBuffer();
                await Bun.write(file, pdfBuffer);

                console.log(`Successfully downloaded: ${fileName}`);
            } catch (error) {
                console.error(`Error downloading ${pdfUrl}:`, error);
            }
        }

        console.log('Download process completed!');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the download function
downloadPDFs();
