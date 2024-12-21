
const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importCsv() {
  const results = [];

  fs.createReadStream('dogdata.csv')  
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      for (let row of results) {
        try {
          await prisma.pet_Breed.create({
            data: {
              breedName: row['Breed Name'],       
              group: row['Group'],
              heightInches: row['Height (Inches)'],
              weightPounds: row['Weight (Pounds)'],
              personality: row['Personality'], 
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

importCsv();
