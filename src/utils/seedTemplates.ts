import { supabase } from '../lib/supabase';

// Dummy templates data to seed the database
const DUMMY_TEMPLATES = [
  {
    id: "witc_2025_01",
    user_id: "00000000-0000-0000-0000-000000000001", // Placeholder UUID - replace with actual user UUID
    title: "Women In Tech Conference",
    template_image_url: "https://pdpwpmavkqbeypdnxvef.supabase.co/storage/v1/object/public/template-images/pinkish_template.png",
    user_image_placeholders: [{
      x: 190,
      y: 130,
      width: 220,
      height: 220,
      holeShape: "circle"
    }],
    user_text_placeholders: [{
      x: 140,
      y: 400,
      width: 100,
      height: 100,
      fontSize: 22,
      color: "#000000",
      fontFamily: "Poppins",
      textAlign: "center",
      labelText: "Your Name",
      text: "Sample Text",
      fontStyle: "normal",
      textTransform: "none",
      fontWeight: "normal"
    }],
    template_placeholders: [
      {
        type: "text",
        x: 140,
        y: 440,
        fontSize: 20,
        color: "#000000",
        fontFamily: "Poppins",
        textAlign: "left",
        text: "I'll be attending WITC 2025",
        labelText: "Bottom Quote",
        fontStyle: "normal"
      },
      {
        type: "image",
        x: 190,
        y: 130,
        width: 220,
        height: 220,
        labelText: "Logo Image"
      }
    ]
  },
  {
    id: "tech_summit_2025",
    user_id: "5acc278d-d82d-4709-a91d-fd2c32f60272", // Placeholder UUID - replace with actual user UUID
    title: "Tech Summit 2025",
    template_image_url: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
    user_image_placeholders: [{
      x: 150,
      y: 100,
      width: 200,
      height: 200,
      holeShape: "box"
    }],
    user_text_placeholders: [
      {
        x: 100,
        y: 350,
        width: 300,
        height: 50,
        fontSize: 24,
        color: "#FFFFFF",
        fontFamily: "Arial",
        textAlign: "center",
        labelText: "Your Name",
        text: "John Doe",
        fontStyle: "bold",
        textTransform: "uppercase",
        fontWeight: "bold"
      },
      {
        x: 100,
        y: 400,
        width: 300,
        height: 30,
        fontSize: 16,
        color: "#CCCCCC",
        fontFamily: "Arial",
        textAlign: "center",
        labelText: "Your Title",
        text: "Software Engineer",
        fontStyle: "normal",
        textTransform: "none",
        fontWeight: "normal"
      }
    ],
    template_placeholders: [
      {
        type: "text",
        x: 50,
        y: 50,
        fontSize: 32,
        color: "#FFFFFF",
        fontFamily: "Arial",
        textAlign: "left",
        text: "TECH SUMMIT 2025",
        labelText: "Event Title",
        fontStyle: "bold"
      }
    ]
  },
  {
    id: "music_fest_2025",
    user_id: "5acc278d-d82d-4709-a91d-fd2c32f60272", // Placeholder UUID - replace with actual user UUID
    title: "Summer Music Festival",
    template_image_url: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800",
    user_image_placeholders: [{
      x: 200,
      y: 150,
      width: 180,
      height: 180,
      holeShape: "circle"
    }],
    user_text_placeholders: [{
      x: 120,
      y: 380,
      width: 260,
      height: 40,
      fontSize: 20,
      color: "#FF6B6B",
      fontFamily: "Open Sans",
      textAlign: "center",
      labelText: "Your Name",
      text: "Music Lover",
      fontStyle: "normal",
      textTransform: "none",
      fontWeight: "600"
    }],
    template_placeholders: [
      {
        type: "text",
        x: 50,
        y: 450,
        fontSize: 18,
        color: "#FFFFFF",
        fontFamily: "Open Sans",
        textAlign: "center",
        text: "🎵 Ready to rock the festival! 🎵",
        labelText: "Festival Message",
        fontStyle: "normal"
      }
    ]
  }
];

export const seedTemplates = async (): Promise<void> => {
  try {
    console.log('🌱 Starting template seeding...');

    // Check if templates already exist to prevent duplicate seeding
    const { data: existingTemplates, error: checkError } = await supabase
      .from('flier_templates')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking existing templates:', checkError);
      throw checkError;
    }

    if (existingTemplates && existingTemplates.length > 0) {
      console.log('ℹ️ Templates already exist in database. Skipping seeding.');
      return;
    }

    // Insert dummy templates
    const { data, error } = await supabase
      .from('flier_templates')
      .insert(DUMMY_TEMPLATES)
      .select();

    if (error) {
      console.error('❌ Error seeding templates:', error);
      throw error;
    }

    console.log('✅ Successfully seeded templates:', data);
    console.log(`🎉 Added ${data?.length || 0} templates to the database`);

    // Store seeding flag in localStorage to prevent re-seeding
    localStorage.setItem('templates_seeded', 'true');

  } catch (error) {
    console.error('💥 Failed to seed templates:', error);
    throw error;
  }
};

// Function to check if seeding has already been done
export const shouldSeedTemplates = (): boolean => {
  return !localStorage.getItem('templates_seeded');
};

// Function to reset seeding flag (for development purposes)
export const resetSeedingFlag = (): void => {
  localStorage.removeItem('templates_seeded');
  console.log('🔄 Seeding flag reset. Templates will be seeded on next app load.');
};