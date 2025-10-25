import type { Template } from '@/types/storytypes';

export const templates: Template[] = [
  {
    id: 'template_car_commercial',
    title: 'Elysian Car Commercial',
    category: 'Commercial',
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
    category: 'Sci-Fi',
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
    title: 'QuickBite Recipe',
    category: 'Cooking',
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
    title: 'Wanderlust Travel Diary',
    category: 'Travel',
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
    title: 'Echo Horror Short',
    category: 'Horror',
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
  {
    id: 'template_ugc_skincare',
    title: 'GlowLab Vitamin C Serum Ad',
    category: 'UGC',
    prompt: 'Authentic, casual testimonial-style ad for GlowLab vitamin C serum, shot selfie-style in a bathroom.',
    script: `
INT. BATHROOM - MORNING
MAYA (late 20s) holds her phone camera at arm's length, no makeup, natural lighting from a window. Casual and authentic.
MAYA
(talking to camera)
Okay, so I've been using GlowLab's vitamin C serum for three weeks now and... guys. The difference is insane.
She holds up the product bottle to the camera.
MAYA (CONT'D)
I was so skeptical at first, but look—
She leans closer to the camera, showing her skin.
MAYA (CONT'D)
My dark spots are literally fading. And my skin feels so much smoother. I'm obsessed with GlowLab.
    `,
    storyboard: [
      { id: 't_sb_15', scene_number: 1, prompt: 'Selfie-style shot of a woman in her late 20s in a bright bathroom, holding phone camera. Natural morning light, no makeup, genuine expression. She\'s wearing a cozy robe. Authentic UGC aesthetic.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_4', locationId: 't_loc_9', soundId: null },
      { id: 't_sb_16', scene_number: 2, prompt: 'Close-up of hands holding a vitamin C serum bottle toward the camera. The product label is clearly visible. Bathroom counter with some skincare items in soft focus background.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_4', locationId: 't_loc_9', soundId: null },
      { id: 't_sb_17', scene_number: 3, prompt: 'Extreme close-up of woman\'s face showing clear, glowing skin. She\'s leaning toward camera. Natural lighting highlights skin texture. Genuine, excited expression.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_4', locationId: 't_loc_9', soundId: null },
    ],
    characters: [
      { id: 't_char_4', name: 'Maya', description: 'Relatable woman in her late 20s with clear skin, wearing a cozy bathrobe. Natural, no-makeup look. Genuine and enthusiastic.', imageUrl: null, generatingImage: false },
    ],
    locations: [
      { id: 't_loc_9', name: 'Modern Bathroom', description: 'A clean, bright bathroom with natural light from a window. White tiles, minimal decor, authentic home setting.', imageUrl: null, generatingImage: false },
    ],
    sound_design: [],
    settings: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      stylePreset: 'UGC, authentic, natural lighting, iPhone quality, relatable',
      autoTransitions: false,
      backgroundMusic: false,
      watermark: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  },
  {
    id: 'template_ugc_fitness',
    title: 'PeakPower Pre-Workout Ad',
    category: 'UGC',
    prompt: 'Energetic testimonial for PeakPower pre-workout supplement, filmed at home gym.',
    script: `
INT. HOME GYM - AFTERNOON
JAKE (early 30s, athletic) sets up his phone on a weight rack, filming himself. He's wearing a tank top and workout shorts, slightly sweaty.
JAKE
(breathing a bit heavy, excited)
Alright, so I just finished my workout and I gotta tell you about PeakPower pre-workout I've been using.
He picks up a container from nearby and shows it to camera.
JAKE (CONT'D)
I've tried like ten different brands, and PeakPower actually works. No crash, clean energy, and my lifts have gone up.
He gives a confident nod.
JAKE (CONT'D)
If you're serious about your training, try PeakPower. Link in bio.
    `,
    storyboard: [
      { id: 't_sb_18', scene_number: 1, prompt: 'Medium shot of athletic man in his 30s in a home gym, phone propped on equipment. He\'s slightly sweaty, genuine energy. Weights and gym equipment visible. Natural window light mixed with overhead lights.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_5', locationId: 't_loc_10', soundId: null },
      { id: 't_sb_19', scene_number: 2, prompt: 'Close-up shot of hands holding a pre-workout supplement container toward camera. The product is in focus, gym equipment blurred in background. Authentic UGC framing.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_5', locationId: 't_loc_10', soundId: null },
      { id: 't_sb_20', scene_number: 3, prompt: 'Medium shot of the man giving a confident nod and thumbs up to camera. Authentic, energetic expression. Post-workout glow. Home gym setting.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_5', locationId: 't_loc_10', soundId: null },
    ],
    characters: [
      { id: 't_char_5', name: 'Jake', description: 'Athletic man in early 30s, fit build, wearing tank top and shorts. Slightly sweaty post-workout look. Genuine and energetic personality.', imageUrl: null, generatingImage: false },
    ],
    locations: [
      { id: 't_loc_10', name: 'Home Gym', description: 'A modest home gym setup with weights, rack, and exercise equipment. Natural and overhead lighting. Authentic, lived-in space.', imageUrl: null, generatingImage: false },
    ],
    sound_design: [],
    settings: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      stylePreset: 'UGC, authentic, natural lighting, energetic, relatable fitness content',
      autoTransitions: false,
      backgroundMusic: false,
      watermark: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  },
  {
    id: 'template_ugc_fashion',
    title: 'Threadly Fashion Haul Ad',
    category: 'Fashion',
    prompt: 'Casual try-on haul for Threadly clothing brand, filmed in bedroom with natural vibes.',
    script: `
INT. BEDROOM - DAY
SOPHIE (mid 20s, trendy) sits on her bed, phone propped up on a shelf. Clothes scattered around her. Natural, conversational energy.
SOPHIE
(excited, talking fast)
Okay so this package from Threadly just came and I had to show you. I ordered from them after seeing them on TikTok and—
She holds up a sweater.
SOPHIE (CONT'D)
Look how cute this is! And the quality? Way better than I expected for the price.
Quick cut - she's now wearing the sweater, showing it off.
SOPHIE (CONT'D)
It fits perfect, it's so soft, and I'm definitely ordering more colors from Threadly. Use code SOPHIE15 for 15% off.
    `,
    storyboard: [
      { id: 't_sb_21', scene_number: 1, prompt: 'Medium shot of trendy woman in mid 20s sitting on bed, phone camera view. Clothes and packages scattered around. Bright natural window light. Cozy bedroom aesthetic. Authentic UGC style.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_6', locationId: 't_loc_11', soundId: null },
      { id: 't_sb_22', scene_number: 2, prompt: 'Close-up of hands holding up a trendy sweater toward camera. The fabric and details are visible. Soft focus bedroom background. Natural enthusiastic energy.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_6', locationId: 't_loc_11', soundId: null },
      { id: 't_sb_23', scene_number: 3, prompt: 'Full body shot of woman wearing the sweater, showing it off to camera. She\'s standing in bedroom, natural pose. Happy, genuine expression. Bright natural lighting.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_6', locationId: 't_loc_11', soundId: null },
    ],
    characters: [
      { id: 't_char_6', name: 'Sophie', description: 'Trendy woman in mid 20s with Gen-Z fashion sense. Casual, energetic personality. Relatable and authentic style.', imageUrl: null, generatingImage: false },
    ],
    locations: [
      { id: 't_loc_11', name: 'Cozy Bedroom', description: 'A bright, modern bedroom with natural light from windows. Lived-in, authentic space with trendy decor.', imageUrl: null, generatingImage: false },
    ],
    sound_design: [],
    settings: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      stylePreset: 'UGC, bright natural light, authentic, Gen-Z aesthetic, iPhone quality',
      autoTransitions: true,
      backgroundMusic: false,
      watermark: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  },
  {
    id: 'template_ugc_tech',
    title: 'SoundWave Pro Earbuds Ad',
    category: 'Tech',
    prompt: 'Authentic unboxing and first impressions of SoundWave Pro wireless earbuds, shot at desk.',
    script: `
INT. HOME OFFICE - DAY
MARCUS (late 20s, tech enthusiast) sits at his desk with his phone propped up. A product box sits in front of him.
MARCUS
(casual, confident)
Just got the new SoundWave Pro earbuds everyone's been talking about. Let's see if they're actually worth the hype.
He opens the box, showing the contents to camera.
MARCUS (CONT'D)
Okay, packaging is clean. Nice. Let's try them out.
Quick cut - earbuds are now in. He nods along to music.
MARCUS (CONT'D)
Sound quality is actually really good. And the noise cancellation? Way better than my last pair. For the price, SoundWave Pro is a steal.
    `,
    storyboard: [
      { id: 't_sb_24', scene_number: 1, prompt: 'Medium shot of man in late 20s at desk with product box. Phone camera POV. Natural home office setting with monitor and tech items visible. Natural window light. Authentic reviewer energy.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_7', locationId: 't_loc_12', soundId: null },
      { id: 't_sb_25', scene_number: 2, prompt: 'Top-down shot of hands unboxing wireless earbuds. Clean product packaging visible. Desk surface and some tech items in frame. Well-lit, product-focused shot.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_7', locationId: 't_loc_12', soundId: null },
      { id: 't_sb_26', scene_number: 3, prompt: 'Medium shot of man wearing the earbuds, nodding along to music with satisfied expression. Natural, genuine reaction. Home office background. Good lighting.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_7', locationId: 't_loc_12', soundId: null },
    ],
    characters: [
      { id: 't_char_7', name: 'Marcus', description: 'Tech-savvy man in late 20s. Casual but knowledgeable demeanor. Trustworthy reviewer persona. Wearing casual shirt.', imageUrl: null, generatingImage: false },
    ],
    locations: [
      { id: 't_loc_12', name: 'Home Office', description: 'Clean, modern home office with desk, monitor, and tech accessories. Natural lighting from window. Professional but authentic setting.', imageUrl: null, generatingImage: false },
    ],
    sound_design: [],
    settings: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      stylePreset: 'UGC, natural lighting, authentic tech review, clean but casual',
      autoTransitions: false,
      backgroundMusic: false,
      watermark: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  },
  {
    id: 'template_ugc_food',
    title: 'FreshPlate Meal Delivery Ad',
    category: 'Food',
    prompt: 'Relatable testimonial for FreshPlate meal prep delivery service, filmed in kitchen.',
    script: `
INT. KITCHEN - EVENING
LISA (30s, busy professional) stands in her kitchen with meal prep containers on the counter. Phone propped against a fruit bowl.
LISA
(relieved, conversational)
So I'm gonna be real with you. I hate cooking after work. Like, I get home exhausted and the last thing I want to do is spend an hour in the kitchen.
She gestures to the containers.
LISA (CONT'D)
FreshPlate has literally saved me. Everything's pre-portioned, healthy, and actually tastes good.
She opens a container, showing the food.
LISA (CONT'D)
Tonight I'm having this teriyaki chicken bowl. Takes five minutes to heat up. FreshPlate is the way.
    `,
    storyboard: [
      { id: 't_sb_27', scene_number: 1, prompt: 'Medium shot of professional woman in 30s standing in modern kitchen. Meal prep containers on counter. Phone camera POV. Natural evening light. Relatable, tired-after-work energy. Authentic home kitchen.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_8', locationId: 't_loc_13', soundId: null },
      { id: 't_sb_28', scene_number: 2, prompt: 'Close-up shot of hands opening a meal prep container revealing healthy, appetizing food. Kitchen counter visible. Natural lighting. Food looks fresh and appealing.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_8', locationId: 't_loc_13', soundId: null },
      { id: 't_sb_29', scene_number: 3, prompt: 'Medium shot of woman holding the open container, smiling with relief and satisfaction. Natural, genuine expression. Warm kitchen lighting. Relatable mood.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_8', locationId: 't_loc_13', soundId: null },
    ],
    characters: [
      { id: 't_char_8', name: 'Lisa', description: 'Busy professional woman in her 30s. Tired but relieved expression. Wearing casual home clothes. Relatable, authentic personality.', imageUrl: null, generatingImage: false },
    ],
    locations: [
      { id: 't_loc_13', name: 'Modern Kitchen', description: 'Clean, lived-in modern kitchen. Natural evening light. Counter with typical kitchen items. Authentic home setting.', imageUrl: null, generatingImage: false },
    ],
    sound_design: [],
    settings: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      stylePreset: 'UGC, natural lighting, authentic, relatable lifestyle content',
      autoTransitions: false,
      backgroundMusic: false,
      watermark: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  },
  {
    id: 'template_ugc_pet',
    title: 'TailWaggers Dog Treats Ad',
    category: 'Pet',
    prompt: 'Cute and authentic testimonial for TailWaggers dog treats, filmed with excited dog.',
    script: `
INT. LIVING ROOM - DAY
EMMA (late 20s, dog mom energy) sits on the floor with her golden retriever. Phone propped on coffee table.
EMMA
(excited, talking to camera and dog)
Okay so Buddy has been obsessed with these TailWaggers treats I found. Look at him!
The dog's tail is wagging intensely, staring at the treat bag.
EMMA (CONT'D)
They're all natural, no weird ingredients, and he literally does tricks I didn't even know he knew just to get one.
She gives the dog a treat. He chomps happily.
EMMA (CONT'D)
Also they don't smell disgusting like other treats. Win-win. Get TailWaggers, link in my bio!
    `,
    storyboard: [
      { id: 't_sb_30', scene_number: 1, prompt: 'Medium shot of woman sitting on floor with excited golden retriever. Living room setting with couch visible. Phone POV from coffee table. Natural bright lighting. Dog is alert and happy. Authentic pet owner energy.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_9', locationId: 't_loc_14', soundId: null },
      { id: 't_sb_31', scene_number: 2, prompt: 'Close-up of dog treat bag being held up, with golden retriever\'s excited face in frame, staring at treats. Natural home lighting. Adorable and engaging composition.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_9', locationId: 't_loc_14', soundId: null },
      { id: 't_sb_32', scene_number: 3, prompt: 'Medium shot of woman giving treat to golden retriever. Dog is happily eating. Both look joyful. Natural, candid moment. Bright living room setting.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: 't_char_9', locationId: 't_loc_14', soundId: null },
    ],
    characters: [
      { id: 't_char_9', name: 'Emma', description: 'Dog mom in late 20s with enthusiastic, genuine energy. Casual comfortable clothes. Natural, relatable personality.', imageUrl: null, generatingImage: false },
    ],
    locations: [
      { id: 't_loc_14', name: 'Living Room', description: 'Cozy, bright living room with couch and coffee table. Natural daylight. Authentic home setting with pet-friendly vibes.', imageUrl: null, generatingImage: false },
    ],
    sound_design: [],
    settings: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      stylePreset: 'UGC, bright natural light, authentic, cute pet content, relatable',
      autoTransitions: false,
      backgroundMusic: false,
      watermark: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  },
  {
    id: 'template_ugc_app',
    title: 'TaskFlux Productivity App Ad',
    category: 'App',
    prompt: 'Quick testimonial for TaskFlow task management app, screen recording style.',
    script: `
INT. HOME OFFICE - DAY
Screen recording of a phone showing a productivity app. A VOICEOVER narrates.
V.O. (ALEX, 20s, casual and relatable)
Okay so I used to be the most disorganized person ever. I had like seven different to-do lists and still forgot everything.
The screen shows the app interface, clean and intuitive.
V.O. (CONT'D)
Then I found TaskFlow and it actually changed my life. Everything's in one place, I can set reminders, and it syncs across all my devices.
The screen shows tasks being checked off satisfyingly.
V.O. (CONT'D)
I've been using TaskFlow for two months and I haven't missed a deadline since. If you're a mess like me, you need this.
    `,
    storyboard: [
      { id: 't_sb_33', scene_number: 1, prompt: 'Clean screen recording of smartphone showing productivity app home screen. Modern, intuitive interface with task lists visible. Bright screen, clear UI elements. Professional but accessible look.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: null, locationId: null, soundId: null },
      { id: 't_sb_34', scene_number: 2, prompt: 'Screen recording showing hands interacting with app, adding tasks and setting reminders. Smooth animations. Clear demonstration of app features. Professional screen capture quality.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: null, locationId: null, soundId: null },
      { id: 't_sb_35', scene_number: 3, prompt: 'Screen recording showing satisfying animation of tasks being checked off with subtle confetti effect. Multiple items completing. Rewarding visual feedback. Clean interface.', imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: null, locationId: null, soundId: null },
    ],
    characters: [],
    locations: [],
    sound_design: [],
    settings: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      stylePreset: 'Screen recording, clean UI, authentic voiceover, relatable tech content',
      autoTransitions: true,
      backgroundMusic: false,
      watermark: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  },
];