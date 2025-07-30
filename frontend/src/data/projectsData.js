import { progress } from "framer-motion";

export const projects = [
  // Ongoing Projects
  {
    id: 1,
    title: "Skyline Towers",
    location: "Downtown Manhattan",
    category: "residential",
    status: "ongoing",
    progress: 75,
    year: "Q2 2024",
    units: 120,
    value: "$2.5M - $8.5M",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Luxury residential complex with 45 floors featuring modern amenities and breathtaking city views.",
    features: ["Smart Home Technology", "Rooftop Garden", "Fitness Center", "Concierge Service"],
    clientSatisfaction: 98,
  
  },
  {
    id: 2,
    title: "Ocean View Residences",
    location: "Miami Beach",
    category: "residential",
    status: "ongoing",
    progress: 60,
    year: "2024",
    units: 85,
    value: "$1.8M - $6.2M",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Beachfront luxury condominiums with panoramic ocean views and world-class amenities.",
    features: ["Private Beach Access", "Infinity Pool", "Spa & Wellness", "Marina Access"],
    clientSatisfaction: 97
  },
  
  // Completed Projects
  {
    id: 3,
    title: "Crystal Heights",
    location: "New York",
    category: "residential",
    status: "ongoing",
    progress: 10,
    year: "2023",
    units: 150,
    value: "$2.1M - $7.5M",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    description: "A stunning 40-story residential tower featuring luxury amenities and panoramic city views.",
    features: ["Luxury Amenities", "City Views", "Smart Home Tech", "Concierge Service"],
    clientSatisfaction: 98,

  },
  {
    id: 2,
    title: "Marina Bay Complex",
    location: "San Francisco",
    category: "commercial",
    year: "2022",
    units: 75,
    value: "$320M",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    description: "Modern commercial complex with premium office spaces and retail outlets.",
    features: ["Premium Offices", "Retail Spaces", "Conference Centers", "Parking Garage"],
    clientSatisfaction: 95,
 
  },
  {
    id: 3,
    title: "Sunset Villas",
    location: "Los Angeles",
    category: "residential",
    year: "2023",
    units: 24,
    value: "$180M",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    description: "Exclusive luxury villas with private pools and stunning sunset views.",
    features: ["Private Pools", "Sunset Views", "Luxury Finishes", "Landscaped Gardens"],
    clientSatisfaction: 97,
   
  },
  {
    id: 4,
    title: "Tech Hub Center",
    location: "Seattle",
    category: "commercial",
    year: "2022",
    units: 200,
    value: "$280M",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    description: "State-of-the-art technology hub with flexible office spaces and innovation labs.",
    features: ["Innovation Labs", "Flexible Spaces", "High-Speed Internet", "Collaboration Areas"],
    clientSatisfaction: 96,
 
  },
  {
    id: 5,
    title: "Riverside Apartments",
    location: "Portland",
    category: "residential",
    year: "2021",
    units: 180,
    value: "$220M",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    description: "Eco-friendly apartment complex with river views and sustainable features.",
    features: ["River Views", "Eco-Friendly", "Community Garden", "Bike Storage"],
    clientSatisfaction: 99,
 
  },
  {
    id: 6,
    title: "Downtown Plaza",
    location: "Chicago",
    category: "mixed",
    year: "2023",
    units: 300,
    value: "$520M",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    description: "Mixed-use development combining residential, commercial, and retail spaces.",
    features: ["Mixed-Use", "Retail Spaces", "Public Plaza", "Transit Access"],
    clientSatisfaction: 97,
   
  }
];

export const categories = [
  { id: 'all', label: 'All Projects' },
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'mixed', label: 'Mixed-Use' }
];
