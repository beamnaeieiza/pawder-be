// importCsv.js
const fs = require('fs');
const csv = require('csv-parser');  // Library to parse CSV
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importCsv() {
  const results = [];

  // Read the CSV file
  fs.createReadStream('dogdata.csv')  // Adjust the file path to your CSV file
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      // After CSV is read, insert the data into the database
      for (let row of results) {
        try {
          await prisma.pet_Breed.create({
            data: {
              breedName: row['Breed Name'],           // Example of a column name
              group: row['Group'],
              heightInches: row['Height (Inches)'],
              weightPounds: row['Weight (Pounds)'],
              personality: row['Personality'],        // This will be a string (comma or slash-separated)
              goodWithDogs: parseInt(row['Good with other dogs']),
              playfulnessLevel: parseInt(row['Playfulness Level']),
              watchdog: parseInt(row['Watchdog']),
              adaptability: parseInt(row['Adaptability']),
              energyLevel: parseInt(row['Energy Level']),
            },
          });
          console.log(`Inserted breed: ${row['Breed Name']}`);
        } catch (error) {
          console.error(`Error inserting ${row['Breed Name']}:`, error);
        }
      }

      console.log('CSV Import Complete!');
      prisma.$disconnect();
    });
}

// Run the import function
importCsv();
