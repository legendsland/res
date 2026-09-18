import fs from 'fs/promises';
import sharp from 'sharp';
import os from 'os';

async function compressBase64Image(base64String, quality = 80, maxWidth = 1920) {
    const buffer = Buffer.from(base64String, 'base64');

    const compressedBuffer = await sharp(buffer)
        .resize(maxWidth, null, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .jpeg({ quality, progressive: true })
        .toBuffer();

    return compressedBuffer.toString('base64');
}

async function compressHtmlImages(inputFile, outputFile, options = {}) {
    const {
        quality = 80,
        maxWidth = 1920,
        targetSizeMB = 100,
        skipSmaller = 10240,
        concurrency = os.cpus().length
    } = options;

    console.log(`Reading file: ${inputFile}`);
    const html = await fs.readFile(inputFile, 'utf-8');
    const originalSizeMB = Buffer.byteLength(html, 'utf-8') / (1024 * 1024);
    console.log(`Original size: ${originalSizeMB.toFixed(2)}MB`);
    console.log(`Concurrency:   ${concurrency} workers\n`);

    // ✅ Fast regex scan — no DOM parsing
    console.log('Scanning for base64 images...');
    const scanStart = Date.now();
    const regex = /data:(image\/\w+);base64,([A-Za-z0-9+/=]+)/g;

    // Collect all matches with their positions
    const matches = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
        const [full, mimeType, base64Data] = match;
        if (base64Data.length >= skipSmaller) {
            matches.push({
                full,
                mimeType,
                base64Data,
                index: match.index,
            });
        }
    }

    console.log(`Found ${matches.length} images in ${Date.now() - scanStart}ms\n`);

    let compressedCount = 0;
    let skippedCount = 0;
    let totalSaved = 0;
    let doneCount = 0;

    // Process in parallel batches
    async function processInBatches(tasks, concurrency) {
        let index = 0;
        async function worker() {
            while (index < tasks.length) {
                const i = index++;
                await tasks[i]();
            }
        }
        await Promise.all(Array.from({ length: concurrency }, () => worker()));
    }

    // Results map: original base64 -> compressed base64
    const replacements = new Map();

    const tasks = matches.map((m, i) => async () => {
        try {
            const compressedBase64 = await compressBase64Image(m.base64Data, quality, maxWidth);
            const savedBytes = m.base64Data.length - compressedBase64.length;

            doneCount++;
            process.stdout.write(
                `\r  Progress: ${doneCount}/${matches.length} | Saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB`
            );

            if (savedBytes > 0) {
                replacements.set(
                    m.full,
                    `data:image/jpeg;base64,${compressedBase64}`
                );
                totalSaved += savedBytes;
                compressedCount++;
            } else {
                skippedCount++;
            }

        } catch (error) {
            doneCount++;
            skippedCount++;
            console.error(`\n  Image ${i + 1} failed: ${error.message}`);
        }
    });

    const startTime = Date.now();
    await processInBatches(tasks, concurrency);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n\nCompressed in ${elapsed}s`);

    // ✅ Fast string replacement — no DOM serialization
    console.log('Applying replacements...');
    const replaceStart = Date.now();
    let result = html;
    for (const [original, compressed] of replacements) {
        result = result.replaceAll(original, compressed);
    }
    console.log(`Replaced in ${Date.now() - replaceStart}ms`);

    console.log('Saving output file...');
    await fs.writeFile(outputFile, result, 'utf-8');

    const newSizeMB = Buffer.byteLength(result, 'utf-8') / (1024 * 1024);

    console.log('\n=== Compression Summary ===');
    console.log(`Original size:   ${originalSizeMB.toFixed(2)}MB`);
    console.log(`New size:        ${newSizeMB.toFixed(2)}MB`);
    console.log(`Total saved:     ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Compressed:      ${compressedCount} images`);
    console.log(`Skipped:         ${skippedCount} images`);
    console.log(`Time:            ${elapsed}s`);

    if (newSizeMB > targetSizeMB) {
        console.warn(`\n⚠️  File still larger than ${targetSizeMB}MB`);
        return false;
    }

    console.log(`\n✓ File is under ${targetSizeMB}MB`);
    return true;
}

async function compressUntilTargetSize(inputFile, outputFile, targetSizeMB = 100) {
    const settings = [
        { quality: 95, maxWidth: 1920 },
        { quality: 80, maxWidth: 1920 },
        { quality: 60, maxWidth: 1280 },
        { quality: 40, maxWidth: 1024 },
        { quality: 20, maxWidth: 800  },
    ];

    for (const { quality, maxWidth } of settings) {
        console.log(`\nTrying quality=${quality}, maxWidth=${maxWidth}...\n`);

        const success = await compressHtmlImages(inputFile, outputFile, {
            quality,
            maxWidth,
            targetSizeMB
        });

        if (success) return;
        console.log('Target not reached, trying next settings...');
    }

    console.warn('⚠️  Could not reach target size.');
}

const inputFile  = process.argv[2] || 'input.html';
const outputFile = process.argv[3] || 'output.html';
const targetSize = parseFloat(process.argv[4]) || 100;

compressUntilTargetSize(inputFile, outputFile, targetSize);