import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// We will read the mock files from the frontend
async function main() {
  console.log('Clearing database...');
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  await prisma.admin.deleteMany();

  console.log('Seeding Admins...');
  await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: 'admin@stayzen.com',
      role: 'SUPER_ADMIN',
    }
  });
  await prisma.admin.create({
    data: {
      name: 'John Staff',
      email: 'john@stayzen.com',
      role: 'STAFF',
    }
  });

  // Since importing ts from another project is tricky, we'll just seed standard data.
  console.log('Seeding Users...');
  const u1 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      phone: '+1 234-567-8901',
      status: 'Active',
      verification: 'Verified',
      joinedDate: '2023-01-15',
      lastLogin: '2024-04-20',
      bookingsCount: 12
    }
  });
  
  const u2 = await prisma.user.create({
    data: {
      name: 'Michael Chen',
      email: 'm.chen@example.com',
      phone: '+1 234-567-8902',
      status: 'Active',
      verification: 'Pending',
      joinedDate: '2024-02-10',
      lastLogin: '2024-04-18',
      bookingsCount: 3
    }
  });

  console.log('Seeding Properties...');
  const p1 = await prisma.property.create({
    data: {
      title: 'Luxury Villa with Ocean View',
      ownerId: u1.id,
      ownerName: 'Sarah Jenkins',
      type: 'Villa',
      location: 'Bali, Indonesia',
      price: 450,
      rating: 4.9,
      status: 'Approved',
      description: 'A beautiful luxury villa with a private infinity pool overlooking the ocean. Features modern architecture, lush tropical gardens, and a dedicated staff.',
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 8,
      amenities: JSON.stringify(['Pool', 'WiFi', 'Kitchen', 'Air Conditioning', 'Ocean View']),
      hostEmail: 'sarah.j@example.com',
      hostPhone: '+1 234-567-8901',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
    }
  });

  const p2 = await prisma.property.create({
    data: {
      title: 'Downtown Studio Apartment',
      ownerId: u2.id,
      ownerName: 'Michael Chen',
      type: 'Apartment',
      location: 'New York, USA',
      price: 120,
      rating: 4.7,
      status: 'Pending',
      description: 'A cozy downtown studio in the heart of the city. Perfect for solo travelers or couples looking to explore.',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: JSON.stringify(['WiFi', 'AC', 'Kitchenette', 'Gym Access']),
      hostEmail: 'm.chen@example.com',
      hostPhone: '+1 234-567-8902',
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1c24226133?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80'
    }
  });

  const p3 = await prisma.property.create({
    data: {
      title: 'Rustic Cabin in the Woods',
      ownerId: u1.id,
      ownerName: 'Sarah Jenkins',
      type: 'Cabin',
      location: 'Aspen, Colorado',
      price: 250,
      rating: 4.8,
      status: 'Approved',
      description: 'Escape to nature in this beautiful A-frame cabin. Features a wood-burning fireplace, hot tub, and stunning mountain views.',
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 4,
      amenities: JSON.stringify(['Fireplace', 'Hot Tub', 'WiFi', 'Kitchen', 'Mountain View']),
      hostEmail: 'sarah.j@example.com',
      hostPhone: '+1 234-567-8901',
      imageUrl: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
    }
  });

  const p4 = await prisma.property.create({
    data: {
      title: 'Modern Santorini Cave House',
      ownerId: u2.id,
      ownerName: 'Michael Chen',
      type: 'House',
      location: 'Santorini, Greece',
      price: 320,
      rating: 5.0,
      status: 'Approved',
      description: 'Experience traditional Greek architecture with modern luxury. Stunning caldera views from the private plunge pool.',
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      amenities: JSON.stringify(['Plunge Pool', 'WiFi', 'AC', 'Caldera View', 'Daily Breakfast']),
      hostEmail: 'm.chen@example.com',
      hostPhone: '+1 234-567-8902',
      imageUrl: 'https://images.unsplash.com/photo-1601581875039-e899893d520c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80'
    }
  });

  const p5 = await prisma.property.create({
    data: {
      title: 'Chic Parisian Loft',
      ownerId: u1.id,
      ownerName: 'Sarah Jenkins',
      type: 'Apartment',
      location: 'Paris, France',
      price: 180,
      rating: 4.6,
      status: 'Pending',
      description: 'A stylish loft in Le Marais. High ceilings, large windows, and walkable to amazing cafes and boutiques.',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 3,
      amenities: JSON.stringify(['WiFi', 'Kitchen', 'Washer', 'Balcony']),
      hostEmail: 'sarah.j@example.com',
      hostPhone: '+1 234-567-8901',
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
    }
  });

  console.log('Seeding Bookings...');
  const b1 = await prisma.booking.create({
    data: {
      customerName: 'Alex Smith',
      propertyTitle: p1.title,
      vendorName: p1.ownerName,
      checkIn: '2024-05-10',
      checkOut: '2024-05-15',
      amount: 2250,
      paymentStatus: 'Paid',
      status: 'Confirmed'
    }
  });

  console.log('Seeding Payments...');
  await prisma.payment.create({
    data: {
      date: '2024-04-15',
      amount: 2250,
      type: 'Booking',
      status: 'Completed',
      method: 'Credit Card',
      referenceId: b1.id,
      description: `Booking for ${p1.title}`
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
