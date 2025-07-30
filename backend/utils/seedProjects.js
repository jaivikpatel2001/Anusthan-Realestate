const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
require('dotenv').config();

const sampleProjects = [
  {
    title: "Skyline Residences",
    description: "A premium residential complex featuring modern amenities and stunning city views. This project offers luxury living with state-of-the-art facilities including a swimming pool, gym, and landscaped gardens.",
    shortDescription: "Premium residential complex with modern amenities and city views",
    location: "Bandra West, Mumbai",
    address: {
      street: "123 Hill Road",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India"
    },
    status: "ongoing",
    category: "residential",
    startingPrice: 8500000,
    maxPrice: 15000000,
    totalUnits: 120,
    availableUnits: 45,
    heroImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
        caption: "Building Exterior",
        isHero: true
      },
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        caption: "Interior View"
      }
    ],
    amenities: [
      { name: "Swimming Pool", icon: "pool", description: "Olympic size swimming pool" },
      { name: "Gymnasium", icon: "gym", description: "Fully equipped fitness center" },
      { name: "Garden", icon: "garden", description: "Landscaped gardens" }
    ],
    features: ["24/7 Security", "Power Backup", "Parking", "Elevator"],
    specifications: {
      totalFloors: 25,
      parkingSpaces: 150,
      elevators: 4,
      constructionArea: 250000,
      landArea: 50000
    },
    timeline: {
      startDate: new Date('2023-01-15'),
      expectedCompletion: new Date('2025-06-30')
    },
    progress: 65,
    isFeatured: true
  },
  {
    title: "Green Valley Apartments",
    description: "Eco-friendly residential project surrounded by lush greenery. Features sustainable design, solar panels, and rainwater harvesting systems for environmentally conscious living.",
    shortDescription: "Eco-friendly apartments with sustainable design",
    location: "Whitefield, Bangalore",
    address: {
      street: "456 ITPL Road",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560066",
      country: "India"
    },
    status: "completed",
    category: "residential",
    startingPrice: 4500000,
    maxPrice: 8500000,
    totalUnits: 80,
    availableUnits: 12,
    heroImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
        caption: "Green Building",
        isHero: true
      }
    ],
    amenities: [
      { name: "Solar Panels", icon: "solar", description: "Renewable energy source" },
      { name: "Rainwater Harvesting", icon: "water", description: "Water conservation system" },
      { name: "Organic Garden", icon: "garden", description: "Community organic garden" }
    ],
    features: ["Eco-friendly", "Energy Efficient", "Green Building Certified"],
    specifications: {
      totalFloors: 15,
      parkingSpaces: 100,
      elevators: 3,
      constructionArea: 180000,
      landArea: 35000
    },
    timeline: {
      startDate: new Date('2022-03-01'),
      expectedCompletion: new Date('2024-08-31'),
      actualCompletion: new Date('2024-07-15')
    },
    progress: 100,
    isFeatured: true
  },
  {
    title: "Metro Commercial Hub",
    description: "State-of-the-art commercial complex strategically located near metro station. Perfect for offices, retail spaces, and business centers with modern infrastructure.",
    shortDescription: "Modern commercial complex near metro station",
    location: "Connaught Place, Delhi",
    address: {
      street: "789 CP Block",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India"
    },
    status: "upcoming",
    category: "commercial",
    startingPrice: 12000000,
    maxPrice: 25000000,
    totalUnits: 60,
    availableUnits: 60,
    heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
        caption: "Commercial Building",
        isHero: true
      }
    ],
    amenities: [
      { name: "Metro Connectivity", icon: "metro", description: "Direct metro access" },
      { name: "Food Court", icon: "restaurant", description: "Multi-cuisine food court" },
      { name: "Conference Rooms", icon: "meeting", description: "Modern meeting facilities" }
    ],
    features: ["Prime Location", "Metro Access", "Modern Infrastructure"],
    specifications: {
      totalFloors: 20,
      parkingSpaces: 200,
      elevators: 6,
      constructionArea: 400000,
      landArea: 80000
    },
    timeline: {
      startDate: new Date('2024-09-01'),
      expectedCompletion: new Date('2026-12-31')
    },
    progress: 5
  },
  {
    title: "Luxury Villas Estate",
    description: "Exclusive gated community of luxury villas with private gardens, swimming pools, and premium amenities. Each villa is designed with contemporary architecture and high-end finishes.",
    shortDescription: "Exclusive luxury villas with private amenities",
    location: "Gurgaon Sector 47",
    address: {
      street: "Villa Complex Road",
      city: "Gurgaon",
      state: "Haryana",
      zipCode: "122018",
      country: "India"
    },
    status: "ongoing",
    category: "residential",
    startingPrice: 25000000,
    maxPrice: 45000000,
    totalUnits: 30,
    availableUnits: 18,
    heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
        caption: "Luxury Villa",
        isHero: true
      }
    ],
    amenities: [
      { name: "Private Pool", icon: "pool", description: "Individual swimming pools" },
      { name: "Private Garden", icon: "garden", description: "Landscaped private gardens" },
      { name: "Club House", icon: "club", description: "Exclusive club facilities" }
    ],
    features: ["Gated Community", "24/7 Security", "Luxury Finishes", "Private Amenities"],
    specifications: {
      totalFloors: 3,
      parkingSpaces: 90,
      elevators: 0,
      constructionArea: 150000,
      landArea: 200000
    },
    timeline: {
      startDate: new Date('2023-06-01'),
      expectedCompletion: new Date('2025-12-31')
    },
    progress: 40,
    isFeatured: true
  },
  {
    title: "Tech Park Plaza",
    description: "Mixed-use development combining office spaces, retail outlets, and residential units. Designed for the modern urban lifestyle with integrated work-live-play concept.",
    shortDescription: "Mixed-use development with work-live-play concept",
    location: "Electronic City, Bangalore",
    address: {
      street: "Electronic City Phase 1",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560100",
      country: "India"
    },
    status: "ongoing",
    category: "mixed",
    startingPrice: 6500000,
    maxPrice: 18000000,
    totalUnits: 200,
    availableUnits: 85,
    heroImage: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=600&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=600&fit=crop",
        caption: "Mixed Use Building",
        isHero: true
      }
    ],
    amenities: [
      { name: "Office Spaces", icon: "office", description: "Modern office facilities" },
      { name: "Retail Outlets", icon: "shop", description: "Shopping and dining options" },
      { name: "Residential Units", icon: "home", description: "Luxury apartments" }
    ],
    features: ["Mixed Use", "Tech Hub Location", "Integrated Facilities"],
    specifications: {
      totalFloors: 30,
      parkingSpaces: 300,
      elevators: 8,
      constructionArea: 500000,
      landArea: 100000
    },
    timeline: {
      startDate: new Date('2023-09-01'),
      expectedCompletion: new Date('2026-03-31')
    },
    progress: 30
  }
];

async function seedProjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realstate');
    console.log('Connected to MongoDB');

    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Clear existing projects
    await Project.deleteMany({});
    console.log('Cleared existing projects');

    // Add creator to each project
    const projectsWithCreator = sampleProjects.map(project => ({
      ...project,
      createdBy: adminUser._id
    }));

    // Insert sample projects
    const insertedProjects = await Project.insertMany(projectsWithCreator);
    console.log(`Inserted ${insertedProjects.length} sample projects`);

    console.log('Sample projects seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding projects:', error);
    process.exit(1);
  }
}

// Run the seeding function
if (require.main === module) {
  seedProjects();
}

module.exports = seedProjects;
