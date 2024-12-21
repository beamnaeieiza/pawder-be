const { PrismaClient } = require('@prisma/client');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const prisma = new PrismaClient();

async function exportTableToCSV(tableName, filePath, data) {
  if (data.length === 0) {
    console.log(`No data found for table: ${tableName}`);
    return;
  }

  const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));

  const csvWriter = createCsvWriter({
    path: filePath,
    header: headers,
  });

  await csvWriter.writeRecords(data);
  console.log(`Exported ${tableName} to ${filePath}`);
}

async function exportAllTables() {
  try {
    // Fetch data from each table
    const users = await prisma.user.findMany();
    const pets = await prisma.pet.findMany();
    const petBreeds = await prisma.pet_Breed.findMany();
    const matches = await prisma.match.findMany();
    const chats = await prisma.chat.findMany();
    const chatMessages = await prisma.chat_Message.findMany();
    const groupChats = await prisma.group_Chat.findMany();
    const groupChatMessages = await prisma.group_Chat_Message.findMany();
    const notifications = await prisma.notification.findMany();
    const events = await prisma.event.findMany();
    const eventEnrollments = await prisma.event_UserEnrolled.findMany();
    const ratings = await prisma.rating.findMany();
    const petHabits = await prisma.pet_Habit.findMany();
    const petInterests = await prisma.pet_Interest.findMany();
    const userInterests = await prisma.user_Interest.findMany();
    const userBlocked = await prisma.user_Blocked.findMany();
    const userSaved = await prisma.user_Saved.findMany();
    const userDislike = await prisma.user_Dislike.findMany();
    const userHaveMet = await prisma.user_HaveMet.findMany();
    const userUnmatch = await prisma.user_Unmatch.findMany();

    // Export each table to a CSV file
    await exportTableToCSV('User', './exports/users.csv', users);
    await exportTableToCSV('Pet', './exports/pets.csv', pets);
    await exportTableToCSV('Pet_Breed', './exports/pet_breeds.csv', petBreeds);
    await exportTableToCSV('Match', './exports/matches.csv', matches);
    await exportTableToCSV('Chat', './exports/chats.csv', chats);
    await exportTableToCSV('Chat_Message', './exports/chat_messages.csv', chatMessages);
    await exportTableToCSV('Group_Chat', './exports/group_chats.csv', groupChats);
    await exportTableToCSV('Group_Chat_Message', './exports/group_chat_messages.csv', groupChatMessages);
    await exportTableToCSV('Notification', './exports/notifications.csv', notifications);
    await exportTableToCSV('Event', './exports/events.csv', events);
    await exportTableToCSV('Event_UserEnrolled', './exports/event_enrollments.csv', eventEnrollments);
    await exportTableToCSV('Rating', './exports/ratings.csv', ratings);
    await exportTableToCSV('Pet_Habit', './exports/pet_habits.csv', petHabits);
    await exportTableToCSV('Pet_Interest', './exports/pet_interests.csv', petInterests);
    await exportTableToCSV('User_Interest', './exports/user_interests.csv', userInterests);
    await exportTableToCSV('User_Blocked', './exports/user_blocked.csv', userBlocked);
    await exportTableToCSV('User_Saved', './exports/user_saved.csv', userSaved);
    await exportTableToCSV('User_Dislike', './exports/user_dislike.csv', userDislike);
    await exportTableToCSV('User_HaveMet', './exports/user_have_met.csv', userHaveMet);
    await exportTableToCSV('User_Unmatch', './exports/user_unmatch.csv', userUnmatch);

    console.log('All tables exported successfully!');
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportAllTables();