import type { Template } from '@/types/storytypes';

export const templates: Template[] = [
  {
    id: 'template_car_commercial',
    title: '"Elysian" Car Commercial',
    prompt: 'A sleek, futuristic electric car driving through a breathtaking, neon-lit cityscape at night and a sun-drenched coastal highway during the day.',
    script: `
SCENE 1
EXT. NEON CITY - NIGHT
The ELYSIAN, a silver electric car, glides silently through streets bathed in the glow of holographic ads. Rain slicks the asphalt, reflecting the city's vibrant colors.
A VOICE OVER (V.O.) begins, smooth and confident.
V.O.
Some chase the future. Others build it.

SCENE 2
EXT. COASTAL HIGHWAY - DAY
The Elysian now cruises along a winding road, ocean on one side, cliffs on the other. The sun is bright, the sky a perfect blue.
A WOMAN smiles in the driver's seat, feeling the sun on her face.
V.O.
Engineered for tomorrow. Designed for right now.

SCENE 3
EXT. NEON CITY - NIGHT
A final, stunning hero shot of the Elysian parked atop a skyscraper, overlooking the entire city.
V.O.
Elysian. Drive the dream.
    `,
    storyboard: [
      { id: 't_sb_1', scene_number: 1, prompt: 'Ultra-wide shot of a sleek silver electric car on a wet street in a futuristic city at night. Towering skyscrapers with massive holographic advertisements cast neon reflections on the car and road. Moody, Blade Runner-inspired lighting. Cinematic, anamorphic lens flare.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: null, locationId: 't_loc_1', soundId: 't_sd_1' },
      { id: 't_sb_2', scene_number: 2, prompt: 'Drone shot following the silver car from behind as it navigates a sun-drenched coastal highway. The Pacific Ocean sparkles to the left. The shot feels liberating and full of energy. Shot on Kodak film, warm tones.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_1', locationId: 't_loc_2', soundId: 't_sd_2' },
      { id: 't_sb_3', scene_number: 3, prompt: 'Close-up shot of the female driver, 30s, smiling with effortless cool. The sun creates a beautiful lens flare over her shoulder. The car\'s minimalist, high-tech interior is visible.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_1', locationId: 't_loc_2', soundId: 't_sd_2' },
      { id: 't_sb_4', scene_number: 4, prompt: 'Epic final shot. The silver car is parked on a helipad on top of a skyscraper. The entire sprawling, illuminated cityscape is visible below. The mood is triumphant and aspirational. Twilight hour.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: null, locationId: 't_loc_1', soundId: 't_sd_2' },
    ],
    characters: [
      { id: 't_char_1', name: 'The Driver', description: 'A stylish, confident woman in her 30s who embodies sophistication and freedom.', imageUrl: null, generatingImage: false },
    ],
    locations: [
      { id: 't_loc_1', name: 'Neon City', description: 'A hyper-modern, rain-slicked metropolis inspired by Blade Runner and Tokyo, filled with holographic ads.', imageUrl: null, generatingImage: false },
      { id: 't_loc_2', name: 'Coastal Highway', description: 'A picturesque, sun-bleached highway reminiscent of California\'s Pacific Coast Highway.', imageUrl: null, generatingImage: false },
    ],
    sound_design: [
      { id: 't_sd_1', description: 'A low, futuristic synth hum for the car\'s engine noise.', scene_match: 'Throughout' },
      { id: 't_sd_2', description: 'An uplifting, modern electronic music track that builds in intensity.', scene_match: 'Throughout' },
    ],
    settings: {
      aspectRatio: '16:9',
      resolution: '4K',
      fps: 30,
      stylePreset: 'Hyper-realistic, cinematic, clean, high-contrast',
      autoTransitions: true,
      backgroundMusic: true,
      watermark: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  },
  {
    id: 'template_scifi_short',
    title: 'The Last Signal',
    prompt: 'A lonely communications tech on a desolate ice planet discovers she is not alone when she receives a mysterious, organic signal from beneath the ice.',
    script: `
INT. COMMS OUTPOST - DAY
Snow howls outside the viewport. ELARA (20s), tired but focused, sips coffee, staring at a wall of monitors displaying static. It's been 382 days of silence.
Suddenly, a new signal appears. Not digital. It's a rhythmic, pulsing waveform. Organic.
ELARA
(whispering)
What are you?
She triangulates the source: deep beneath the ice, just a few klicks from the outpost.
After a moment of hesitation, she grabs her thermal gear. She has to know.
    `,
    storyboard: [
      { id: 't_sb_5', scene_number: 1, prompt: 'sits alone, her face illuminated by the cold blue light of static-filled monitors. The mood is one of profound isolation. A huge, reinforced window shows a raging blizzard outside.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_2', locationId: 't_loc_3', soundId: 't_sd_3' },
      { id: 't_sb_6', scene_number: 2, prompt: 'A beautiful, complex, pulsing blue and green waveform appears on a monitor, starkly different from the surrounding digital noise. It looks like a living heartbeat. Her wide, astonished eye is reflected in the screen.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_2', locationId: 't_loc_3', soundId: 't_sd_4' },
      { id: 't_sb_7', scene_number: 3, prompt: 'stands at the outpost\'s airlock door, holding a helmet. She looks determined and fearful. The red "CYCLING" light of the airlock illuminates her face.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_2', locationId: 't_loc_3', soundId: 't_sd_3' },
    ],
    characters: [
      { id: 't_char_2', name: 'Elara', description: 'A bright but lonely communications technician in her late 20s, wearing a functional but worn jumpsuit. Resourceful and curious, she has been isolated for over a year.', imageUrl: null, generatingImage: false },
    ],
    locations: [
      { id: 't_loc_3', name: 'Comms Outpost', description: 'A small, prefabricated habitat half-buried in the snow of a desolate ice planet. It is cramped, functional, and filled with glowing screens showing data and static.', imageUrl: null, generatingImage: false },
    ],
    sound_design: [
        { id: 't_sd_3', description: 'The constant, low howl of a blizzard outside the outpost.', scene_match: 'Scene 1' },
        { id: 't_sd_4', description: 'A mysterious, beautiful, and slightly unsettling chittering/pulsing sound for the alien signal.', scene_match: 'Scene 1' },
    ],
    settings: {
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 24,
      stylePreset: 'Gritty sci-fi, realistic textures, cinematic, high contrast, blue and orange color palette',
      autoTransitions: false,
      backgroundMusic: true,
      watermark: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  },
  {
    id: 'template_cooking_show',
    title: '"QuickBite" Recipe',
    prompt: 'A fast-paced, top-down cooking video for a delicious spicy avocado toast.',
    script: `
SCENE 1
TOP-DOWN SHOT - KITCHEN COUNTER - DAY
Upbeat, quirky music begins.
Hands quickly slice an avocado in half.
SUPER: Spicy Avocado Toast
Hands scoop the avocado into a bowl. Add red pepper flakes, lime juice, salt, pepper. Mash with a fork.
A slice of sourdough bread pops out of a toaster.
Hands spread the avocado mixture on the toast.
Top with a sprinkle of cilantro and a final dash of chili flakes.
The toast is sliced in half, revealing a perfect cross-section.
SUPER: QuickBite. Good food, fast.
    `,
    storyboard: [
      { id: 't_sb_8', scene_number: 1, prompt: 'Clean, top-down shot of hands mashing avocado in a white bowl on a marble countertop. Ingredients like lime and red pepper flakes are artfully scattered nearby. Bright, natural lighting.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: null, locationId: 't_loc_4', soundId: 't_sd_5' },
      { id: 't_sb_9', scene_number: 2, prompt: 'Dynamic top-down shot of the finished spicy avocado toast being sliced diagonally with a sharp knife. The shot is colorful and appetizing.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: null, locationId: 't_loc_4', soundId: 't_sd_6' },
    ],
    characters: [],
    locations: [
      { id: 't_loc_4', name: 'Modern Kitchen Counter', description: 'A bright, clean kitchen space with a marble or light wood countertop.', imageUrl: null, generatingImage: false },
    ],
    sound_design: [
      { id: 't_sd_5', description: 'Upbeat, catchy, royalty-free indie pop music.', scene_match: 'Throughout' },
      { id: 't_sd_6', description: 'Crisp sound effect of a knife slicing toast.', scene_match: 'Scene 2' },
    ],
    settings: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      stylePreset: 'Vibrant, high-contrast, clean, food-blogger aesthetic',
      autoTransitions: true,
      backgroundMusic: true,
      watermark: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  },
  {
    id: 'template_travel_vlog',
    title: '"Wanderlust" Travel Diary',
    prompt: 'A travel vlog montage of Kyoto, Japan, featuring temples, bamboo forests, and street food.',
    script: `
SCENE 1
EXT. ARASHIYAMA BAMBOO GROVE - DAY
A montage of shots:
- A person walks through the towering bamboo grove, sunlight filtering through.
- Close up on hands making matcha tea.
- A walk through the vibrant Gion district at dusk, lanterns glowing.
- A quick shot of delicious-looking street takoyaki.
- A final, peaceful shot of Kinkaku-ji (Golden Pavilion) reflecting in the water.
V.O. (friendly, female)
Sometimes, the best stories aren't written, they're lived. Kyoto.
    `,
    storyboard: [
      { id: 't_sb_10', scene_number: 1, prompt: 'A first-person perspective shot walking through a dense, green bamboo forest. Tall stalks of bamboo tower overhead, and magical sunlight streams through the leaves. Ethereal, dreamy quality.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_3', locationId: 't_loc_5', soundId: 't_sd_7' },
      { id: 't_sb_11', scene_number: 2, prompt: 'A shot of the Gion district in Kyoto at dusk. Traditional wooden buildings line the street, red paper lanterns are lit, and a few people in kimonos are walking by. Nostalgic and beautiful.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_3', locationId: 't_loc_6', soundId: 't_sd_7' },
      { id: 't_sb_12', scene_number: 3, prompt: 'A perfect, symmetrical shot of the Golden Pavilion (Kinkaku-ji) in Kyoto, its golden exterior reflecting flawlessly in the surrounding pond. Serene and majestic. Shot on a clear day.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: null, locationId: 't_loc_7', soundId: 't_sd_7' },
    ],
    characters: [
      { id: 't_char_3', name: 'The Traveler', description: 'An unseen first-person perspective, representing the viewer experiencing the journey.', imageUrl: null, generatingImage: false },
    ],
    locations: [
      { id: 't_loc_5', name: 'Arashiyama Bamboo Grove', description: 'A famous, otherworldly forest of towering green bamboo stalks.', imageUrl: null, generatingImage: false },
      { id: 't_loc_6', name: 'Gion District', description: 'The historic geisha district of Kyoto, with traditional wooden machiya houses.', imageUrl: null, generatingImage: false },
      { id: 't_loc_7', name: 'Kinkaku-ji Temple', description: 'A stunning Zen Buddhist temple covered in gold leaf, set on a reflective pond.', imageUrl: null, generatingImage: false },
    ],
    sound_design: [
      { id: 't_sd_7', description: 'A gentle, lo-fi hip-hop track with a chill and reflective mood.', scene_match: 'Throughout' },
    ],
    settings: {
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 24,
      stylePreset: 'Cinematic travel vlog, warm color grading, slightly desaturated, film grain',
      autoTransitions: true,
      backgroundMusic: true,
      watermark: true,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  },
  {
    id: 'template_horror_short',
    title: '"Echo" Horror Short',
    prompt: 'A short, found-footage style horror clip. Someone camping alone in the woods hears a strange sound.',
    script: `
INT. TENT - NIGHT
The view is from a camera placed on a sleeping bag. The only light is a faint lantern glow. The sound of crickets.
A twig SNAPS outside.
The camera whips around toward the tent flap. Silence.
A low, guttural GROWL is heard, seeming to come from all directions at once.
The camera shakes violently. The sound of panicked breathing.
The zipper of the tent begins to slowly, deliberately UNZIP... from the outside.
    `,
    storyboard: [
      { id: 't_sb_13', scene_number: 1, prompt: 'Found-footage style, point-of-view shot from inside a dark tent at night. The nylon walls are dimly lit by a single lantern. The feeling is claustrophobic and tense. High ISO, digital noise.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: null, locationId: 't_loc_8', soundId: 't_sd_8' },
      { id: 't_sb_14', scene_number: 2, prompt: 'Extreme close-up on the tent\'s zipper, which is slowly being pulled down from the outside. The shot is shaky and unfocused. The only thing visible beyond the opening zipper is pure, impenetrable darkness.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: null, locationId: 't_loc_8', soundId: 't_sd_9' },
    ],
    characters: [],
    locations: [
      { id: 't_loc_8', name: 'Deep Woods', description: 'A dark, foreboding forest at night. The kind of place you shouldn\'t be camping alone.', imageUrl: null, generatingImage: false },
    ],
    sound_design: [
      { id: 't_sd_8', description: 'The sharp, sudden sound of a twig snapping, breaking the ambient night sounds.', scene_match: 'Scene 1' },
      { id: 't_sd_9', description: 'A slow, metallic scraping sound for the tent zipper, amplified to be terrifying.', scene_match: 'Scene 1' },
      { id: 't_sd_10', description: 'Panicked, heavy breathing from the person holding the camera.', scene_match: 'Throughout' },
    ],
    settings: {
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 30,
      stylePreset: 'Found footage, shaky cam, low light, high contrast, terrifying',
      autoTransitions: false,
      backgroundMusic: false,
      watermark: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  },
];