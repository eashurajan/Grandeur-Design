/*
  project-data.js — content for project.html (not behaviour)

  Each key ("tropical-residence", "garden-residence", …) is one project.
  project.js looks up the key from the URL hash and fills the template.

  Typical fields:
  - category     → architectural | residential | commercial (Works filter)
  - eyebrow      → small line above the title
  - title        → main heading
  - description  → array of paragraphs
  - details      → Type, Scope, Area, Location, Year
  - gallery      → photos (desktop, optional mobile, alt, optional crop/ratio)
  - testimonial  → client quote and photo
  - nextProject  → the "View this project" block at the bottom
*/

window.GRANDEUR_PROJECTS = {
  "tropical-residence": {
    category: "architectural",
    eyebrow: "A Contemporary Tropical Home",
    title: "The Tropical Residence",
    description: [
      "Rooted in nature, the house brings together warm materiality, open volumes, and contemporary architectural lines to create a calm tropical retreat. The architecture is defined by generous glazing, layered timber elements, and broad overhanging roofs that provide shade while strengthening the connection between the interiors and the landscape.",
      "Natural stone, timber, glass, and lush planting establish a tactile palette that continues seamlessly into the interiors. The design balances the clean geometry of contemporary living with organic textures and warm detailing, creating a home that feels refined, relaxed, and deeply connected to its surroundings."
    ],
    details: {
      Type: "Residential",
      Scope: "Architecture",
      Area: "2,800 sq.ft",
      Location: "Coimbatore",
      Year: "2025"
    },
    gallery: [
      {
        desktop: "assets/images/projects/tropical-residence/hero.webp",
        mobile: "assets/images/projects/tropical-residence/hero-mobile.webp",
        alt: "Front elevation of The Tropical Residence"
      },
      {
        desktop: "assets/images/projects/tropical-residence/patio.webp",
        mobile: "assets/images/projects/tropical-residence/patio-mobile.webp",
        alt: "Covered tropical patio and outdoor living area"
      },
      {
        desktop: "assets/images/projects/tropical-residence/exterior-side.webp",
        mobile: "assets/images/projects/tropical-residence/exterior-side-mobile.webp",
        alt: "Timber-clad side elevation surrounded by planting"
      },
      {
        desktop: "assets/images/projects/tropical-residence/courtyard.webp",
        mobile: "assets/images/projects/tropical-residence/courtyard-mobile.webp",
        alt: "Garden courtyard and glazed living spaces"
      },
      {
        desktop: "assets/images/projects/tropical-residence/garden.webp",
        mobile: "assets/images/projects/tropical-residence/garden-mobile.webp",
        alt: "Rear garden elevation with palms"
      }
    ],
    testimonial: {
      role: "Residence Owner",
      name: "Arun Karunakaran",
      quote: "“Grandeur Studio understood how we wanted our home to feel and brought that vision together beautifully. From the architecture to the interiors, every detail feels intentional, warm, and connected to the surrounding landscape. The result is a home that feels both refined and genuinely comfortable to live in.”",
      image: "assets/images/projects/tropical-residence/testimonial.webp",
      mobileImage: "assets/images/projects/tropical-residence/testimonial-mobile.webp",
      imageAlt: "Stone path beside the tropical residence"
    },
    nextProject: {
      key: "garden-residence",
      title: "The Garden Residence",
      image: "assets/images/projects/garden-residence/hero.webp",
      imageAlt: "Garden elevation of The Garden Residence",
      available: true
    }
  },
  "garden-residence": {
    category: "architectural",
    eyebrow: "A Warm Contemporary Family Home",
    title: "The Garden Residence",
    description: [
      "Designed around warmth, openness, and connection to the outdoors, this residence brings together traditional architectural character with a relaxed contemporary interior. Generous glazing draws natural light deep into the home, while timber ceilings, crafted joinery, and warm terracotta flooring create a rich and inviting material palette.",
      "The interior is shaped around comfortable everyday living, with open connections between the kitchen, dining, and living spaces. A glazed garden room extends the living experience beyond the main house, creating a seamless relationship between the interiors and surrounding landscape. Warm timber, soft furnishings, and natural light give the home a comfortable, timeless quality."
    ],
    details: {
      Type: "Residential",
      Scope: "Architecture & Interiors",
      Area: "3,500 sq.ft",
      Location: "Pollachi",
      Year: "2024"
    },
    gallery: [
      {
        desktop: "assets/images/projects/garden-residence/hero.webp",
        ratio: "4096 / 2734",
        alt: "Garden-facing exterior of The Garden Residence"
      },
      {
        desktop: "assets/images/projects/garden-residence/kitchen-dining.webp",
        ratio: "4096 / 2734",
        alt: "Warm timber kitchen and dining area"
      },
      {
        desktop: "assets/images/projects/garden-residence/dining-room.webp",
        ratio: "4096 / 2734",
        alt: "Bright family dining room"
      },
      {
        desktop: "assets/images/projects/garden-residence/kitchen.webp",
        ratio: "4096 / 2734",
        alt: "Open kitchen and dining interior"
      },
      {
        desktop: "assets/images/projects/garden-residence/living-room.webp",
        ratio: "4096 / 2734",
        alt: "Double-height central living hall"
      }
    ],
    testimonial: {
      role: "Residence Owner",
      name: "Suresh Gopi",
      quote: "“We’re truly grateful for all the thought and effort that went into creating our Garden Residence. Grandeur Design took the time to understand our ideas, lifestyle, and the way we wanted our home to feel, and brought them together in a design that feels both personal and beautifully considered. We especially appreciate how they worked with our vision rather than imposing a particular style. The result is a warm, comfortable home that feels naturally connected to the garden and truly feels like our own.”",
      image: "assets/images/projects/garden-residence/testimonial.webp",
      imageAlt: "Glazed garden room surrounded by greenery",
      ratio: "665 / 961",
      crop: { left: "-63.46%", top: "-0.01%", width: "216.54%", height: "100.02%" }
    },
    nextProject: {
      key: "marble-residence",
      title: "The Marble Residence",
      image: "assets/images/projects/marble-residence/hero.webp",
      imageAlt: "Living area in The Marble Residence",
      available: true
    }
  },
  "marble-residence": {
    category: "residential",
    eyebrow: "A Refined Contemporary Residence",
    title: "The Marble Residence",
    description: [
      "A calm and sophisticated interior shaped by clean lines, natural materials, and carefully balanced proportions. Marble surfaces, warm timber, soft neutral tones, and expansive glazing create a refined atmosphere while allowing natural light to move effortlessly through the home.",
      "The design brings together open living spaces and more intimate private areas through subtle material transitions and considered detailing. Glass partitions create visual connections between rooms, while custom furniture, layered lighting, and warm textures add depth and comfort to the minimalist architecture. The result is a contemporary home that feels elegant, functional, and naturally inviting."
    ],
    details: {
      Type: "Residential",
      Scope: "Interior Design",
      Area: "3,200 sq.ft",
      Location: "Chennai",
      Year: "2026"
    },
    gallery: [
      {
        desktop: "assets/images/projects/marble-residence/hero.webp",
        ratio: "1440 / 985",
        crop: { left: "0", top: "-11.47%", width: "100%", height: "120.49%" },
        alt: "Sculptural staircase and lounge in The Marble Residence"
      },
      {
        desktop: "assets/images/projects/marble-residence/living-room.webp",
        ratio: "1440 / 1188",
        crop: { left: "0", top: "-8%", width: "100%", height: "116.06%" },
        alt: "Marble living room and glass partition"
      },
      {
        desktop: "assets/images/projects/marble-residence/dining-room.webp",
        ratio: "4096 / 2731",
        alt: "Minimal timber dining room"
      },
      {
        desktop: "assets/images/projects/marble-residence/bedroom.webp",
        ratio: "4096 / 2734",
        alt: "Soft neutral bedroom"
      },
      {
        desktop: "assets/images/projects/marble-residence/kitchen.webp",
        ratio: "4096 / 2731",
        alt: "White and marble kitchen"
      }
    ],
    testimonial: {
      role: "The Residence Owner",
      name: "Arun Karunakaran",
      quote: "“We’re really happy with how our Marble Residence came together. Grandeur Design understood the clean, contemporary look we wanted while still making the home feel warm and comfortable. The choice of materials, lighting, and finishes was handled beautifully, and every space feels thoughtfully connected. They listened to our ideas throughout the process and turned them into a home that feels both elegant and very much our own.”",
      image: "assets/images/projects/marble-residence/testimonial.webp",
      imageAlt: "Curved lounge chair in a softly lit bedroom",
      ratio: "2731 / 4096"
    },
    nextProject: {
      key: "earth-and-ember",
      title: "Earth & Ember",
      image: "assets/images/projects/earth-and-ember/hero.webp",
      imageAlt: "Earth & Ember restaurant interior",
      available: true
    }
  },
  "earth-and-ember": {
    category: "commercial",
    eyebrow: "A Vibrant Contemporary Restaurant",
    title: "Earth & Ember",
    description: [
      "A warm and characterful dining space that blends contemporary interiors with expressive Indian-inspired details. Rich timber, textured walls, patterned tiles, and deep teal upholstery create a layered palette, while the soft glow of woven pendant lights gives the restaurant an intimate and inviting atmosphere.",
      "The design balances a lively visual identity with the practical needs of a dining environment. Custom timber ceilings, arched architectural details, illustrated wall treatments, and carefully composed seating areas give each part of the restaurant its own character while maintaining a cohesive visual language. The result is a relaxed, immersive space designed to make everyday dining feel memorable."
    ],
    details: {
      Type: "Commercial",
      Scope: "Architectural",
      Area: "5,620 sq.ft",
      Location: "Bengaluru",
      Year: "2025"
    },
    gallery: [
      {
        desktop: "assets/images/projects/earth-and-ember/hero.webp",
        ratio: "4096 / 2305",
        alt: "Main dining hall at Earth & Ember"
      },
      {
        desktop: "assets/images/projects/earth-and-ember/dining-room.webp",
        ratio: "4032 / 3024",
        alt: "Red arched doorway and illustrated dining wall"
      },
      {
        desktop: "assets/images/projects/earth-and-ember/seating.webp",
        ratio: "1440 / 1250",
        crop: { left: "0", top: "-72.77%", width: "100%", height: "172.78%" },
        alt: "Patterned floor and banquette seating"
      },
      {
        desktop: "assets/images/projects/earth-and-ember/table.webp",
        ratio: "660 / 464",
        crop: { left: "0", top: "-89.66%", width: "100%", height: "189.66%" },
        alt: "Colorful intimate dining table"
      }
    ],
    testimonial: {
      role: "Restaurant Owner",
      name: "Karan Deva",
      quote: "“We’re extremely happy with how Earth & Ember turned out. Grandeur Design understood the atmosphere we wanted to create and brought our ideas together in a way that feels warm, inviting, and full of character. The materials, lighting, and details all work beautifully together, and the space feels both distinctive and comfortable. They made the entire design process feel collaborative, and we’re delighted with the final result.”",
      image: "assets/images/projects/earth-and-ember/testimonial.webp",
      imageAlt: "Warm pendant-lit dining area at Earth & Ember",
      ratio: "2731 / 4096"
    },
    nextProject: {
      key: "tropical-residence",
      title: "The Tropical Residence",
      image: "assets/images/projects/tropical-residence/hero.webp",
      imageAlt: "Front elevation of The Tropical Residence",
      available: true
    }
  }
};
