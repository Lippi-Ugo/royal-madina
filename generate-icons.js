#!/usr/bin/env node

/**
 * Script pour générer les icônes PWA depuis logo.svg
 * Usage: node generate-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sharp = Sharp;

const LOGO_PATH = path.join(__dirname, 'src/assets/logo.svg');
const OUTPUT_DIR = path.join(__dirname, 'public');
const RED_COLOR = '#c9302c';

// Tailles d'icônes à générer
const sizes = [192, 512];

async function generateIcons() {
    console.log('🎨 Génération des icônes PWA...');

    if (!fs.existsSync(LOGO_PATH)) {
        console.error(`❌ Logo non trouvé: ${LOGO_PATH}`);
        process.exit(1);
    }

    try {
        for (const size of sizes) {
            // Redimensionner le logo SVG à 80% de la taille de l'icône
            const logoSize = Math.floor(size * 0.80);
            const offset = Math.floor((size - logoSize) / 2);
            const radius = Math.floor(size * 0.08); // Coins arrondis 8%

            // Créer le fond rouge avec bords arrondis
            const redBackground = await createRedBackground(size, radius);

            // Icône standard
            const standardIcon = await sharp(redBackground)
                .composite([
                    {
                        input: await sharp(LOGO_PATH)
                            .resize(logoSize, logoSize, { fit: 'contain', background: 'transparent' })
                            .toBuffer(),
                        top: offset,
                        left: offset
                    }
                ])
                .png()
                .toFile(path.join(OUTPUT_DIR, `icon-${size}x${size}.png`));

            console.log(`✅ Créé: icon-${size}x${size}.png`);

            // Icône maskable (pour icônes adaptatives) - logo 90%
            const logoSizeMaskable = Math.floor(size * 0.90);
            const offsetMaskable = Math.floor((size - logoSizeMaskable) / 2);

            const maskableIcon = await sharp(redBackground)
                .composite([
                    {
                        input: await sharp(LOGO_PATH)
                            .resize(logoSizeMaskable, logoSizeMaskable, { fit: 'contain', background: 'transparent' })
                            .toBuffer(),
                        top: offsetMaskable,
                        left: offsetMaskable
                    }
                ])
                .png()
                .toFile(path.join(OUTPUT_DIR, `icon-maskable-${size}x${size}.png`));

            console.log(`✅ Créé: icon-maskable-${size}x${size}.png`);
        }

        console.log('\n✅ Toutes les icônes ont été générées avec succès!');
    } catch (error) {
        console.error('❌ Erreur lors de la génération:', error);
        process.exit(1);
    }
}

// Fonction pour créer un fond rouge avec coins arrondis
async function createRedBackground(size, radius) {
    const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#c9302c"/>
    </svg>
  `;

    return sharp(Buffer.from(svg))
        .resize(size, size)
        .toBuffer();
}

generateIcons();
