const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const admin = await prisma.admin.findFirst({ where: { role: { name: 'Super Admin' } } });
    if (!admin) {
      console.log("No super admin found");
      return;
    }

    const properties = [
      // Indian Locations
      {
        title: "Royal Palace Heritage Hotel",
        ownerId: admin.id,
        ownerName: admin.name,
        type: "Villa",
        location: "Jaipur, Rajasthan, India",
        price: 350,
        rating: 4.9,
        status: "Approved",
        imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80",
        description: "Experience royal luxury in this authentic heritage palace featuring traditional Rajput architecture, private courtyards, and world-class hospitality.",
        bedrooms: 6,
        bathrooms: 8,
        maxGuests: 12,
        amenities: JSON.stringify(["WiFi", "Private Pool", "Spa", "Butler Service", "Courtyard", "Fine Dining"]),
        hostEmail: "royal@jaipurheritage.in",
        hostPhone: "+91 98765 43210"
      },
      {
        title: "Serene Backwaters Retreat",
        ownerId: admin.id,
        ownerName: admin.name,
        type: "House",
        location: "Alleppey, Kerala, India",
        price: 180,
        rating: 4.8,
        status: "Approved",
        imageUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80",
        description: "A beautiful traditional houseboat anchored in the tranquil backwaters of Kerala, offering stunning sunset views and authentic local cuisine.",
        bedrooms: 3,
        bathrooms: 3,
        maxGuests: 6,
        amenities: JSON.stringify(["WiFi", "AC", "Private Deck", "Chef", "Fishing Gear"]),
        hostEmail: "bookings@keralaretreats.in",
        hostPhone: "+91 98765 43211"
      },
      {
        title: "Himalayan Panorama Cabin",
        ownerId: admin.id,
        ownerName: admin.name,
        type: "Cabin",
        location: "Manali, Himachal Pradesh, India",
        price: 120,
        rating: 4.7,
        status: "Approved",
        imageUrl: "https://images.unsplash.com/photo-1629807469720-31f13b194098?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80",
        description: "A cozy wooden cabin perched on a hillside with breathtaking 180-degree views of the snow-capped Himalayan peaks.",
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        amenities: JSON.stringify(["Fireplace", "Mountain View", "Kitchen", "Heating", "WiFi"]),
        hostEmail: "host@himalayancabins.in",
        hostPhone: "+91 98765 43212"
      },

      // Overseas Locations
      {
        title: "Modern Alpine Chalet",
        ownerId: admin.id,
        ownerName: admin.name,
        type: "Villa",
        location: "Zermatt, Switzerland",
        price: 850,
        rating: 5.0,
        status: "Approved",
        imageUrl: "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80",
        description: "An ultra-luxurious, modern chalet with floor-to-ceiling windows offering unobstructed views of the Matterhorn.",
        bedrooms: 5,
        bathrooms: 6,
        maxGuests: 10,
        amenities: JSON.stringify(["Ski-in/Ski-out", "Hot Tub", "Sauna", "WiFi", "Fireplace", "Home Theater"]),
        hostEmail: "chalet@zermattluxury.ch",
        hostPhone: "+41 44 123 4567"
      },
      {
        title: "Overwater Bungalow Oasis",
        ownerId: admin.id,
        ownerName: admin.name,
        type: "House",
        location: "Bora Bora, French Polynesia",
        price: 1200,
        rating: 4.9,
        status: "Approved",
        imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80",
        description: "Experience paradise in this exclusive overwater bungalow featuring a glass floor and direct access to the crystal-clear lagoon.",
        bedrooms: 1,
        bathrooms: 2,
        maxGuests: 2,
        amenities: JSON.stringify(["Ocean View", "Private Plunge Pool", "Snorkeling Gear", "Room Service", "WiFi"]),
        hostEmail: "reservations@boraboraoasis.pf",
        hostPhone: "+689 40 12 34 56"
      },
      {
        title: "Santorini Cliffside Villa",
        ownerId: admin.id,
        ownerName: admin.name,
        type: "Villa",
        location: "Oia, Santorini, Greece",
        price: 600,
        rating: 4.9,
        status: "Approved",
        imageUrl: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80",
        description: "A stunning white-washed cave villa carved into the caldera cliff, offering the most iconic sunset views in Greece.",
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        amenities: JSON.stringify(["Infinity Pool", "Ocean View", "WiFi", "AC", "Terrace"]),
        hostEmail: "hello@santorinivillas.gr",
        hostPhone: "+30 210 123 4567"
      }
    ];

    for (const p of properties) {
      await prisma.property.create({ data: p });
      console.log(`Created property: ${p.title}`);
    }

    const count = await prisma.property.count();
    console.log("Total properties after:", count);

  } catch(e) {
    console.log(e);
  }
}
run();
