const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const existingCount = await prisma.property.count();
    const needed = 48 - existingCount;
    if (needed <= 0) {
      console.log('Already have 48 or more properties.');
      return;
    }

    const baseProperties = [
      { title: 'Royal Palace Heritage Hotel', type: 'Villa', location: 'Jaipur, Rajasthan, India', price: 350, rating: 4.9, status: 'Approved', imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80', description: 'Experience royal luxury in this authentic heritage palace.', bedrooms: 6, bathrooms: 8, maxGuests: 12, amenities: ['WiFi', 'Private Pool', 'Spa'] },
      { title: 'Serene Backwaters Retreat', type: 'House', location: 'Alleppey, Kerala, India', price: 180, rating: 4.8, status: 'Approved', imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80', description: 'A beautiful traditional houseboat anchored in the tranquil backwaters.', bedrooms: 3, bathrooms: 3, maxGuests: 6, amenities: ['WiFi', 'AC', 'Private Deck'] },
      { title: 'Himalayan Panorama Cabin', type: 'Cabin', location: 'Manali, Himachal Pradesh, India', price: 120, rating: 4.7, status: 'Pending', imageUrl: 'https://images.unsplash.com/photo-1629807469720-31f13b194098?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80', description: 'A cozy wooden cabin perched on a hillside with breathtaking views.', bedrooms: 2, bathrooms: 1, maxGuests: 4, amenities: ['Fireplace', 'Mountain View', 'Kitchen'] },
      { title: 'Modern Alpine Chalet', type: 'Villa', location: 'Zermatt, Switzerland', price: 850, rating: 5.0, status: 'Suspended', imageUrl: 'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80', description: 'An ultra-luxurious, modern chalet with floor-to-ceiling windows.', bedrooms: 5, bathrooms: 6, maxGuests: 10, amenities: ['Ski-in/Ski-out', 'Hot Tub', 'Sauna'] },
      { title: 'Overwater Bungalow Oasis', type: 'House', location: 'Bora Bora, French Polynesia', price: 1200, rating: 4.9, status: 'Approved', imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80', description: 'Experience paradise in this exclusive overwater bungalow.', bedrooms: 1, bathrooms: 2, maxGuests: 2, amenities: ['Ocean View', 'Private Plunge Pool', 'Snorkeling Gear'] },
      { title: 'Santorini Cliffside Villa', type: 'Villa', location: 'Oia, Santorini, Greece', price: 600, rating: 4.9, status: 'Pending', imageUrl: 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80', description: 'A stunning white-washed cave villa carved into the caldera cliff.', bedrooms: 2, bathrooms: 2, maxGuests: 4, amenities: ['Infinity Pool', 'Ocean View', 'WiFi'] }
    ];

    const admin = await prisma.user.findFirst({ where: { roleId: { not: null } } });

    console.log(`Adding ${needed} properties...`);
    for (let i = 0; i < needed; i++) {
      const base = baseProperties[i % baseProperties.length];
      await prisma.property.create({
        data: {
          title: `${base.title} (Unit ${existingCount + i + 1})`,
          type: base.type,
          location: base.location,
          price: base.price,
          rating: base.rating,
          status: base.status,
          imageUrl: base.imageUrl,
          description: base.description,
          bedrooms: base.bedrooms,
          bathrooms: base.bathrooms,
          maxGuests: base.maxGuests,
          amenities: base.amenities.join(', '),
          hostName: 'Super Admin',
          hostEmail: 'admin@stayzen.com',
          hostPhone: '+1 234 567 8900',
          hostJoinDate: new Date(),
          ownerId: admin ? admin.id : '1'
        }
      });
    }
    console.log(`Successfully added ${needed} properties.`);
  } catch(e) {
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
