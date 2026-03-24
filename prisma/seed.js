const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up existing data...");
  await prisma.expense.deleteMany();
  await prisma.messageRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.note.deleteMany();
  await prisma.tripState.deleteMany();
  await prisma.groupInvite.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding Indian Context Users...");

  const hashPassword = async (pw) => await bcrypt.hash(pw, 10);

  const uRahul = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      password: await hashPassword("password123"),
      bio: "Software engineer who loves weekend getaways and photography."
    }
  });

  const uPriya = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "priya@example.com",
      password: await hashPassword("password123"),
      bio: "Foodie and cultural explorer. Always seeking the best local street food."
    }
  });

  const uAmit = await prisma.user.create({
    data: {
      name: "Amit Desai",
      email: "amit@example.com",
      password: await hashPassword("password123"),
      bio: "Adventure junkie. If it involves mountains or water sports, count me in."
    }
  });

  const uNeha = await prisma.user.create({
    data: {
      name: "Neha Singh",
      email: "neha@example.com",
      password: await hashPassword("password123"),
      bio: "Relaxation and wellness retreats are my vibe. Coffee lover."
    }
  });

  console.log("Seeding 5 Detailed Indian Trips...");

  // 1. Goa Beach House (Public)
  await prisma.group.create({
    data: {
      name: "Goa New Years Eve 2026",
      description: "Renting a massive villa in North Goa for endless beach hopping, seafood, and late night trance parties. Need 3 more people to split the massive Airbnb!",
      targetBudget: "₹40,000",
      maxMembers: 8,
      days: 5,
      isPublic: true,
      members: {
        create: [
          { userId: uRahul.id, role: "admin" },
          { userId: uAmit.id, role: "member" }
        ]
      },
      tripState: {
        create: {
          destination: "Goa, India",
          dates: "Dec 28 - Jan 2",
          budget: "₹40,000 per person"
        }
      }
    }
  });

  // 2. Manali Trek (Private)
  await prisma.group.create({
    data: {
      name: "Manali Base Camp Trek",
      description: "Our private college reunion trip. We are doing the Hampta Pass trek and staying in tents.",
      targetBudget: "₹25,000",
      maxMembers: 4,
      days: 7,
      isPublic: false,
      members: {
        create: [
          { userId: uAmit.id, role: "admin" },
          { userId: uRahul.id, role: "member" },
          { userId: uNeha.id, role: "member" }
        ]
      },
      tripState: {
        create: {
          destination: "Manali, Himachal Pradesh",
          dates: "June 10 - June 17",
          budget: "₹25,000"
        }
      }
    }
  });

  // 3. Kerala Backwaters (Public)
  await prisma.group.create({
    data: {
      name: "Kerala Ayurvedic Retreat",
      description: "Looking for peaceful folks to share a luxury houseboat down the Alleppey backwaters. Lots of yoga, meditation, and amazing South Indian curries.",
      targetBudget: "₹35,000",
      maxMembers: 4,
      days: 4,
      isPublic: true,
      members: {
        create: [
          { userId: uNeha.id, role: "admin" },
          { userId: uPriya.id, role: "member" }
        ]
      },
      tripState: {
        create: {
          destination: "Alleppey, Kerala",
          dates: "Sep 5 - Sep 9",
          budget: "₹35,000"
        }
      }
    }
  });

  // 4. Jaipur Heritage (Private)
  await prisma.group.create({
    data: {
      name: "Jaipur Literature Festival Trip",
      description: "Private group for the lit fest. Booking palatial Airbnbs and doing cafe hopping in the pink city.",
      targetBudget: "₹20,000",
      maxMembers: 5,
      days: 3,
      isPublic: false,
      members: {
        create: [
          { userId: uPriya.id, role: "admin" },
          { userId: uRahul.id, role: "member" }
        ]
      },
      tripState: {
        create: {
          destination: "Jaipur, Rajasthan",
          dates: "Jan 15 - Jan 18",
          budget: "₹20,000"
        }
      }
    }
  });

  // 5. Meghalaya Monsoons (Public)
  await prisma.group.create({
    data: {
      name: "Meghalaya Living Root Bridges",
      description: "Backpacking across the wettest place on earth! Planning to visit Cherrapunji, Dawki river, and trek to the double decker root bridges. Need adventurous souls.",
      targetBudget: "₹30,000",
      maxMembers: 6,
      days: 8,
      isPublic: true,
      members: {
        create: [
          { userId: uAmit.id, role: "admin" }
        ]
      },
      tripState: {
        create: {
          destination: "Shillong & Cherrapunji, Meghalaya",
          dates: "August 10 - August 18",
          budget: "₹30,000"
        }
      }
    }
  });

  console.log("Database seeded successfully with Indian personas and trips!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
