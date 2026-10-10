/**
 * DermaGuide - Application JavaScript
 * Enhanced Skin Check questionnaire logic, local photo preview, risk triage engine,
 * ingredient dictionary filter, and routine generation.
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATE MANAGEMENT ---
  const quizState = {
    currentStep: 1,
    totalSteps: 4,
    photoDataUrl: null,
    photoFileName: '',
    answers: {
      mainConcerns: [],
      duration: null,
      symptoms: [],
      progression: null,
      recentProducts: '',
      existingProducts: '',
      userDescription: '',
      budget: null
    }
  };

  // Ingredient Dictionary Database
  const ingredientData = [
    {
      name: 'Niacinamide (Vitamin B3)',
      category: 'soothing',
      categoryLabel: 'Barrier & Tone',
      description: 'Supports skin barrier repair, balances oil production, and fades post-acne marks without irritation.',
      bestFor: 'Oily, Combination, Acne-prone, Sensitive skin'
    },
    {
      name: 'Hyaluronic Acid',
      category: 'hydrating',
      categoryLabel: 'Hydration',
      description: 'Attracts up to 1,000 times its weight in water, plumping skin cells and restoring deep hydration.',
      bestFor: 'Dry, Dehydrated, Normal, Aging skin'
    },
    {
      name: 'Salicylic Acid (BHA)',
      category: 'exfoliating',
      categoryLabel: 'Pore Cleansing',
      description: 'Oil-soluble exfoliant that penetrates deep into pores to dissolve trapped sebum and clear blackheads.',
      bestFor: 'Oily, Acne-prone, Congested skin'
    },
    {
      name: 'Centella Asiatica (Cica)',
      category: 'soothing',
      categoryLabel: 'Calming',
      description: 'Rich in antioxidants and triterpenoids, it rapidly calms redness, irritation, and compromised skin barriers.',
      bestFor: 'Sensitive, Redness-prone, Irritated skin'
    },
    {
      name: 'Ceramides (1, 3, 6-II)',
      category: 'barrier',
      categoryLabel: 'Barrier Repair',
      description: 'Essential lipids naturally found in skin that lock in moisture and protect against environmental stressors.',
      bestFor: 'Dry, Compromised barrier, Eczema-prone skin'
    },
    {
      name: 'Retinol & Retinoids',
      category: 'aging',
      categoryLabel: 'Renewal',
      description: 'Accelerates cell turnover, boosts collagen production, and smooths fine lines and uneven texture.',
      bestFor: 'Fine lines, Hyperpigmentation, Adult acne'
    },
    {
      name: 'Vitamin C (L-Ascorbic Acid)',
      category: 'aging',
      categoryLabel: 'Brightening',
      description: 'Potent antioxidant that neutralizes free radicals, brightens dull skin tone, and boosts collagen synthesis.',
      bestFor: 'Dullness, Dark spots, Environmental protection'
    },
    {
      name: 'Azelaic Acid',
      category: 'soothing',
      categoryLabel: 'Redness & Spots',
      description: 'Gently reduces skin inflammation, unclogs pores, and targets hyperpigmentation with low irritation.',
      bestFor: 'Rosacea, Hyperpigmentation, Sensitive acne'
    }
  ];

  // Routine Knowledge Base mapped to concerns and budget tiers
  const routineDatabase = {
    acne: {
      title: 'Acne-like Spots / Breakout Guidance',
      am: [
        { title: 'Cleanse', desc: 'Gentle Salicylic Acid 1% or Foaming Gel Cleanser' },
        { title: 'Treat', desc: 'Niacinamide 5% + Zinc Serum (Oil Control)' },
        { title: 'Moisturize', desc: 'Lightweight Oil-Free Gel-Cream' },
        { title: 'Protect', desc: 'Non-Comedogenic Matte Fluid SPF 50+' }
      ],
      pm: [
        { title: 'First Cleanse', desc: 'Micellar Water to break down SPF and oil' },
        { title: 'Second Cleanse', desc: 'Gentle pH-balanced Cleanser' },
        { title: 'Target Active', desc: 'Salicylic Acid 2% Liquid Exfoliant (2-3 nights/week)' },
        { title: 'Barrier Support', desc: 'Soothing Barrier Lotion with Ceramides' }
      ],
      hero: 'Salicylic Acid (BHA), Niacinamide, Centella Asiatica',
      avoid: 'Comedogenic heavy oils (Coconut oil), harsh physical walnut scrubs, over-washing with hot water.',
      tip: 'Introduce active BHA exfoliants gradually. Never squeeze or pick inflamed spots to prevent post-inflammatory dark marks.'
    },
    pigmentation: {
      title: 'Hyperpigmentation & Tone Guidance',
      am: [
        { title: 'Cleanse', desc: 'Mild Cream or Hydrating Gel Cleanser' },
        { title: 'Brighten', desc: 'Vitamin C (L-Ascorbic Acid 10-15%) Antioxidant Serum' },
        { title: 'Moisturize', desc: 'Niacinamide Hydrating Lotion' },
        { title: 'Protect (Crucial)', desc: 'High Protection Broad-Spectrum SPF 50+ (Reapply outdoors)' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Gentle Oil or Milk Cleanser' },
        { title: 'Target Active', desc: 'Azelaic Acid 10% Cream or Alpha Arbutin' },
        { title: 'Moisturize', desc: 'Ceramide Rich Night Repair Cream' }
      ],
      hero: 'Vitamin C, Azelaic Acid, Alpha Arbutin, Niacinamide',
      avoid: 'Unprotected sun exposure, violent face scrubbing, unbuffered glycolic acid on active breakouts.',
      tip: 'Daily sunscreen is mandatory when targeting dark patches—sunlight activates melanin production within minutes.'
    },
    redness: {
      title: 'Redness & Sensitivity Calming Guidance',
      am: [
        { title: 'Gentle Rinse', desc: 'Lukewarm water or Ultra-Gentle Cica Milk Cleanser' },
        { title: 'Soothe', desc: 'Centella Asiatica (Cica) & Panthenol Hydrating Essence' },
        { title: 'Moisturize', desc: 'Fragrance-Free Barrier Recovery Balm' },
        { title: 'Protect', desc: '100% Mineral Zinc Oxide SPF 50+ (Gentle on reactive skin)' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Ultra-Gentle Fragrance-Free Cleanser' },
        { title: 'Calm & Repair', desc: 'Madacassoside + Bifida Ferment Barrier Serum' },
        { title: 'Lock In', desc: 'Soothing Lipid Replenishing Cream' }
      ],
      hero: 'Centella Asiatica (Cica), Panthenol (Vitamin B5), Ceramides, Allantoin',
      avoid: 'Essential oils, synthetic fragrances, alcohol toners, strong AHA/BHA exfoliants, hot saunas.',
      tip: 'Keep your routine strictly minimalist to give your skin moisture barrier time to repair and calm down.'
    },
    dryness: {
      title: 'Dryness & Barrier Hydration Guidance',
      am: [
        { title: 'Cleanse', desc: 'Hydrating Non-Foaming Cleansing Lotion' },
        { title: 'Hydrate', desc: 'Multi-Molecular Hyaluronic Acid Serum (Apply to damp skin)' },
        { title: 'Moisturize', desc: 'Nourishing Cream with Ceramides & Glycerin' },
        { title: 'Protect', desc: 'Dewy Hydrating SPF 50+ Sunscreen' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Nourishing Cleansing Balm / Cream Cleanser' },
        { title: 'Deep Moisture', desc: 'Squalane & Hyaluronic Acid Barrier Booster' },
        { title: 'Seal', desc: 'Rich Overnight Recovery Cream' }
      ],
      hero: 'Hyaluronic Acid, Ceramides 1,3,6-II, Squalane, Glycerin',
      avoid: 'Harsh foaming sulfate cleansers, alcohol toners, long hot showers.',
      tip: 'Apply your hydrating serums directly onto damp skin right after cleansing to lock in extra moisture.'
    },
    oiliness: {
      title: 'Oiliness & Pore Clarity Guidance',
      am: [
        { title: 'Cleanse', desc: 'Purifying Foam Gel Cleanser (pH 5.5)' },
        { title: 'Balance', desc: 'Niacinamide 5% + Zinc PCA Serum' },
        { title: 'Moisturize', desc: 'Water Gel Oil-Free Hydrator' },
        { title: 'Protect', desc: 'Weightless Fluid Sunscreen (Matte Finish)' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Deep Pore Gel Cleanser' },
        { title: 'Exfoliate', desc: 'Salicylic Acid 2% Liquid (3 nights/week)' },
        { title: 'Hydrate', desc: 'Lightweight Lotion (Non-comedogenic)' }
      ],
      hero: 'Niacinamide, Salicylic Acid, Zinc PCA, Green Tea Extract',
      avoid: 'Heavy mineral oils, pore-clogging waxes, aggressive stripping cleansers that trigger rebound oiliness.',
      tip: 'Oily skin still needs hydration! Depriving skin of moisturizer causes over-compensation and increased sebum production.'
    },
    blackheads_whiteheads: {
      title: 'Blackheads & Whiteheads Pore Guidance',
      am: [
        { title: 'Cleanse', desc: 'Gentle Pore Cleansing Salicylic Acid Cleanser' },
        { title: 'Balance', desc: 'Niacinamide 5% Pore Refining Serum' },
        { title: 'Moisturize', desc: 'Oil-Free Hydrating Gel Lotion' },
        { title: 'Protect', desc: 'Lightweight Non-Comedogenic Sunscreen SPF 50+' }
      ],
      pm: [
        { title: 'Double Cleanse', desc: 'Gentle Cleansing Oil followed by Gel Cleanser' },
        { title: 'Exfoliate', desc: 'Salicylic Acid 2% Liquid Exfoliant (3 nights/week)' },
        { title: 'Hydrate', desc: 'Ceramide Barrier Support Gel Cream' }
      ],
      hero: 'Salicylic Acid (BHA), Niacinamide, Zinc PCA',
      avoid: 'Pore-stripping nose tapes, thick petrolatum balms on comedones, aggressive pore squeezing.',
      tip: 'BHA penetrates oil-filled pores to dissolve dead skin and sebum from within.'
    },
    dark_spots: {
      title: 'Dark Spots & Post-Acne Marks Guidance',
      am: [
        { title: 'Cleanse', desc: 'Gentle Hydrating Cleanser' },
        { title: 'Target', desc: 'Alpha Arbutin 2% + Hyaluronic Serum' },
        { title: 'Moisturize', desc: 'Lightweight Brightening Lotion' },
        { title: 'Protect', desc: 'Broad-Spectrum SPF 50+ Sunscreen' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Gentle pH-Balanced Cleanser' },
        { title: 'Renew', desc: 'Azelaic Acid 10% Cream' },
        { title: 'Lock In', desc: 'Barrier Support Night Cream' }
      ],
      hero: 'Alpha Arbutin, Azelaic Acid, Niacinamide, Vitamin C',
      avoid: 'Picking at blemishes, skipping sunscreen, lemon juice DIY remedies.',
      tip: 'Preventing UV damage stops post-acne dark marks from deepening.'
    },
    uneven_tone: {
      title: 'Uneven Skin Tone Guidance',
      am: [
        { title: 'Cleanse', desc: 'Gentle Cream-to-Foam Cleanser' },
        { title: 'Tone Support', desc: 'Niacinamide 5% Serum' },
        { title: 'Moisturize', desc: 'Hydrating Daily Lotion' },
        { title: 'Protect', desc: 'Broad Spectrum SPF 50+' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Mild Cleanser' },
        { title: 'Exfoliate', desc: 'Lactic Acid 5% Serum (2 nights/week)' },
        { title: 'Moisturize', desc: 'Ceramide Barrier Recovery Cream' }
      ],
      hero: 'Niacinamide, Lactic Acid, Vitamin C',
      avoid: 'Over-exfoliating with multiple acids simultaneously.',
      tip: 'Consistent gentle hydration improves skin clarity and even tone.'
    },
    tanning: {
      title: 'Tanning & Sun Exposure Guidance',
      am: [
        { title: 'Cleanse', desc: 'Cooling Soothing Cleanser' },
        { title: 'Antioxidant', desc: 'Vitamin C Antioxidant Serum' },
        { title: 'Moisturize', desc: 'Aloe & Panthenol Soothing Lotion' },
        { title: 'Protect', desc: 'High Defense Broad-Spectrum SPF 50+ PA++++' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Gentle Cleansing Lotion' },
        { title: 'Calm', desc: 'Centella Asiatica (Cica) Serum' },
        { title: 'Repair', desc: 'Nourishing Barrier Repair Cream' }
      ],
      hero: 'Vitamin C, Centella Asiatica, Panthenol, SPF 50+',
      avoid: 'Harsh bleach creams, immediate strong AHA/BHA chemical peels on fresh tan.',
      tip: 'Prioritize skin barrier recovery and strict daily sun protection.'
    },
    sensitive: {
      title: 'Sensitive & Reactive Skin Guidance',
      am: [
        { title: 'Cleanse', desc: 'Fragrance-Free Non-Foaming Cleansing Lotion' },
        { title: 'Soothe', desc: 'Panthenol 5% + Centella Serum' },
        { title: 'Moisturize', desc: 'Minimalist Ceramide Cream' },
        { title: 'Protect', desc: 'Mineral Zinc Oxide SPF 50+' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Gentle Micellar Rinse or Cream Cleanser' },
        { title: 'Repair', desc: 'Barrier Support Serum with Ceramides & Allantoin' },
        { title: 'Moisturize', desc: 'Soothe & Lock Repair Balm' }
      ],
      hero: 'Centella Asiatica, Ceramides, Panthenol, Allantoin',
      avoid: 'Fragrance, denatured alcohol, essential oils, physical scrubs.',
      tip: 'Patch test new cosmetic products behind your ear for 24 hours before applying to face.'
    },
    dehydrated: {
      title: 'Dehydrated Skin Moisture Guidance',
      am: [
        { title: 'Cleanse', desc: 'Gentle Hydrating Cleansing Lotion' },
        { title: 'Hydrate', desc: 'Hyaluronic Acid 2% + Polyglutamic Acid Serum' },
        { title: 'Moisturize', desc: 'Lightweight Gel Cream with Glycerin' },
        { title: 'Protect', desc: 'Hydrating Moisture Sunscreen SPF 50+' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Mild Cream Cleanser' },
        { title: 'Boost', desc: 'Squalane & Panthenol Essence' },
        { title: 'Seal', desc: 'Hydrating Night Repair Lotion' }
      ],
      hero: 'Hyaluronic Acid, Polyglutamic Acid, Glycerin, Squalane',
      avoid: 'Over-exfoliating, stripping alcohol toners, skipping moisturizer.',
      tip: 'Dehydration means lack of water in skin cells; layered hydrating serums work best.'
    },
    pores: {
      title: 'Enlarged Pores Guidance',
      am: [
        { title: 'Cleanse', desc: 'Foaming Pore Cleanser' },
        { title: 'Tighten', desc: 'Niacinamide 10% + Zinc PCA Serum' },
        { title: 'Moisturize', desc: 'Oil-Free Mattifying Hydrator' },
        { title: 'Protect', desc: 'Pore-Refining Sunscreen SPF 50+' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Pore Deep Cleansing Gel' },
        { title: 'Refine', desc: 'BHA 2% Liquid Exfoliant (2-3 nights/week)' },
        { title: 'Moisturize', desc: 'Light Barrier Gel' }
      ],
      hero: 'Niacinamide, Salicylic Acid (BHA), Zinc PCA',
      avoid: 'Comedogenic pore-clogging creams, violent pore pulling strips.',
      tip: 'Niacinamide and Salicylic Acid keep sebum flowing freely to visibly refine pore appearance.'
    },
    texture: {
      title: 'Rough & Uneven Texture Guidance',
      am: [
        { title: 'Cleanse', desc: 'Mild Hydrating Cleanser' },
        { title: 'Smooth', desc: 'Niacinamide 5% Serum' },
        { title: 'Moisturize', desc: 'Softening Ceramide Cream' },
        { title: 'Protect', desc: 'Broad-Spectrum SPF 50+' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Gentle Cleanser' },
        { title: 'Exfoliate', desc: 'Lactic Acid 5% or AHA Exfoliant (2 nights/week)' },
        { title: 'Moisturize', desc: 'Rich Barrier Repair Cream' }
      ],
      hero: 'Lactic Acid (AHA), Niacinamide, Ceramides',
      avoid: 'Harsh physical walnut scrubs, over-exfoliating active acids.',
      tip: 'Gentle chemical AHAs loosen dead surface cells without tearing skin.'
    },
    small_bumps: {
      title: 'Small Bumps & Texture Guidance',
      am: [
        { title: 'Cleanse', desc: 'Gentle Clarifying Cleanser' },
        { title: 'Balance', desc: 'Niacinamide 5% Serum' },
        { title: 'Moisturize', desc: 'Non-Comedogenic Hydrating Gel' },
        { title: 'Protect', desc: 'Lightweight SPF 50+' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Mild pH-Balanced Cleanser' },
        { title: 'Target', desc: 'Salicylic Acid 1-2% Solution (2-3 nights/week)' },
        { title: 'Moisturize', desc: 'Barrier Support Lotion' }
      ],
      hero: 'Salicylic Acid, Niacinamide, Centella Asiatica',
      avoid: 'Squeezing tiny bumps, heavy oil-based ointments on forehead/face.',
      tip: 'Small non-inflamed bumps respond well to gentle BHA pore unclogging.'
    },
    dullness: {
      title: 'Dull-Looking Skin Radiance Guidance',
      am: [
        { title: 'Cleanse', desc: 'Revitalizing Gel Cleanser' },
        { title: 'Glow', desc: 'Vitamin C Antioxidant Serum' },
        { title: 'Moisturize', desc: 'Radiance Hydrating Lotion' },
        { title: 'Protect', desc: 'Dewy Finish Sunscreen SPF 50+' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Gentle Cleansing Balm' },
        { title: 'Renew', desc: 'Glycolic Acid 5% Toner (2 nights/week)' },
        { title: 'Nourish', desc: 'Ceramide Night Recovery Cream' }
      ],
      hero: 'Vitamin C, Glycolic Acid, Niacinamide',
      avoid: 'Dehydration, un-sunprotected exposure, skipping evening cleansing.',
      tip: 'Vitamin C in AM and mild AHA in PM boost natural surface cell turnover.'
    },
    under_eye: {
      title: 'Under-Eye Darkness Guidance',
      am: [
        { title: 'Cleanse', desc: 'Gentle Hydrating Cleanser' },
        { title: 'Eye Care', desc: 'Caffeine & Peptide Eye Gel' },
        { title: 'Moisturize', desc: 'Lightweight Daily Lotion' },
        { title: 'Protect', desc: 'Gentle Sunscreen SPF 50+ (Safe around eyes)' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Mild Cleanser' },
        { title: 'Hydrate Eye', desc: 'Hyaluronic Acid & Niacinamide Eye Cream' },
        { title: 'Moisturize', desc: 'Nourishing Night Cream' }
      ],
      hero: 'Caffeine, Peptides, Hyaluronic Acid, Niacinamide',
      avoid: 'Rubbing eyes vigorously, applying strong facial AHA/BHA acids near eyelid margins.',
      tip: 'Gentle patting motion prevents micro-tears in delicate under-eye skin.'
    },
    lip_nose_darkness: {
      title: 'Targeted Dark Areas (Lips / Nose) Guidance',
      am: [
        { title: 'Cleanse', desc: 'Ultra-Gentle Cleanser' },
        { title: 'Tone', desc: 'Niacinamide 5% Brightening Serum' },
        { title: 'Moisturize', desc: 'Barrier Hydration Cream' },
        { title: 'Protect', desc: 'Strict Broad-Spectrum Sunscreen SPF 50+' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Gentle Cleanser' },
        { title: 'Target', desc: 'Azelaic Acid 10% Cream (Apply thinly to dark areas)' },
        { title: 'Moisturize', desc: 'Ceramide Lipid Recovery Balm' }
      ],
      hero: 'Niacinamide, Azelaic Acid, Ceramides',
      avoid: 'Licking lips frequently, harsh facial wax strips, unbuffered strong glycolic acid.',
      tip: 'Perioral skin is thin and easily irritated; use gentle brightening actives.'
    },
    fine_lines: {
      title: 'Fine Lines & Firmness Guidance',
      am: [
        { title: 'Cleanse', desc: 'Hydrating Cream Cleanser' },
        { title: 'Protect Active', desc: 'Vitamin C + Peptide Complex Serum' },
        { title: 'Moisturize', desc: 'Firming Peptide Hydrator' },
        { title: 'Protect', desc: 'Broad-Spectrum Anti-Aging SPF 50+' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Nourishing Cleansing Balm' },
        { title: 'Renew', desc: 'Encapsulated Retinol 0.2% (Gradually 2-3 nights/week)' },
        { title: 'Seal', desc: 'Rich Lipid Replenishing Cream' }
      ],
      hero: 'Peptides, Retinol, Vitamin C, Hyaluronic Acid',
      avoid: 'Unprotected UV exposure, smoking, harsh scrubbing.',
      tip: 'Retinol stimulates collagen production over time; buffer with moisturizer when starting.'
    },
    scars: {
      title: 'Scars & Acne Marks Guidance',
      am: [
        { title: 'Cleanse', desc: 'Gentle Hydrating Cleanser' },
        { title: 'Smooth', desc: 'Niacinamide 5% + Centella Serum' },
        { title: 'Moisturize', desc: 'Barrier Support Cream' },
        { title: 'Protect', desc: 'Broad Spectrum Sunscreen SPF 50+' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Mild pH Cleanser' },
        { title: 'Renew', desc: 'Retinoid / Azelaic Acid Night Lotion' },
        { title: 'Seal', desc: 'Ceramide Repair Balm' }
      ],
      hero: 'Retinoids, Centella Asiatica, Niacinamide, Azelaic Acid',
      avoid: 'Picking at scars, aggressive needle rollers at home.',
      tip: 'For deep indented icepick scars, clinical dermatological treatments (laser, microneedling) yield best results.'
    },
    itching_concern: {
      title: 'Itching & Irritation Soothing Guidance',
      am: [
        { title: 'Gentle Wash', desc: 'Fragrance-Free Soap-Free Cleanser' },
        { title: 'Soothe', desc: 'Centella Asiatica (Cica) & Panthenol Serum' },
        { title: 'Moisturize', desc: 'Colloidal Oatmeal Barrier Balm' },
        { title: 'Protect', desc: '100% Mineral Zinc Oxide SPF 50+' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Ultra-Gentle Soothing Rinse' },
        { title: 'Calm', desc: 'Panthenol 5% + Ceramide Booster' },
        { title: 'Lock In', desc: 'Barrier Recovery Lipid Cream' }
      ],
      hero: 'Colloidal Oatmeal, Centella Asiatica, Panthenol, Ceramides',
      avoid: 'Scratching skin, hot showers, synthetic fragrances, active acid exfoliants.',
      tip: 'Keep skin cool and moisturized. If itching is severe or spreading, consult a doctor.'
    },
    other: {
      title: 'General Skin Barrier Support Guidance',
      am: [
        { title: 'Cleanse', desc: 'Gentle Balanced Daily Cleanser' },
        { title: 'Soothe', desc: 'Hydrating Panthenol & Glycerin Essence' },
        { title: 'Moisturize', desc: 'Daily Barrier Defense Cream' },
        { title: 'Protect', desc: 'Broad-Spectrum SPF 50+' }
      ],
      pm: [
        { title: 'Cleanse', desc: 'Gentle Daily Cleanser' },
        { title: 'Support', desc: 'Ceramide Hydrating Serum' },
        { title: 'Lock In', desc: 'Daily Barrier Cream' }
      ],
      hero: 'Glycerin, Ceramides, Panthenol',
      avoid: 'Unverified strong DIY recipes (lemon juice, baking soda), untested active acid combinations.',
      tip: 'When dealing with uncertain skin symptoms, stick to a basic 3-step routine (Cleanse, Moisturize, Protect) and consult a dermatologist.'
    }
  };

  // --- DOM ELEMENTS ---
  const modalBackdrop = document.getElementById('skinCheckModal');
  const startBtns = document.querySelectorAll('.btn-start-check');
  const closeBtn = document.getElementById('closeModalBtn');
  const quizSteps = document.querySelectorAll('.quiz-step');
  const quizBody = document.getElementById('quizBody');
  const resultsContainer = document.getElementById('resultsContainer');
  const progressBar = document.getElementById('progressBar');
  
  const prevBtn = document.getElementById('prevStepBtn');
  const nextBtn = document.getElementById('nextStepBtn');

  // Photo Upload Elements
  const photoDropzone = document.getElementById('photoDropzone');
  const facePhotoInput = document.getElementById('facePhotoInput');
  const photoPreviewContainer = document.getElementById('photoPreviewContainer');
  const photoPreviewImg = document.getElementById('photoPreviewImg');
  const photoFileName = document.getElementById('photoFileName');
  const removePhotoBtn = document.getElementById('removePhotoBtn');

  // Results Elements
  const urgentAlertBox = document.getElementById('urgentAlertBox');
  const urgentAlertText = document.getElementById('urgentAlertText');
  const dermatologistWarningBox = document.getElementById('dermatologistWarningBox');
  const dermatologistWarningText = document.getElementById('dermatologistWarningText');
  const cosmeticGuidanceContainer = document.getElementById('cosmeticGuidanceContainer');
  
  const resultsPhotoCard = document.getElementById('resultsPhotoCard');
  const resultsPhotoThumb = document.getElementById('resultsPhotoThumb');

  // --- MODAL CONTROLS ---
  function openModal() {
    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    resetQuiz();
  }

  function closeModal() {
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  startBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // --- LOCAL PHOTO UPLOAD (NO AI / NO EXTERNAL STORAGE) ---
  if (facePhotoInput) {
    facePhotoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      handleFileSelection(file);
    });
  }

  if (photoDropzone) {
    photoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      photoDropzone.classList.add('dragover');
    });

    photoDropzone.addEventListener('dragleave', () => {
      photoDropzone.classList.remove('dragover');
    });

    photoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      photoDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (JPG, PNG, WEBP).', 'warning');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size exceeds 10MB limit.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (evt) {
      quizState.photoDataUrl = evt.target.result;
      quizState.photoFileName = file.name;

      photoPreviewImg.src = evt.target.result;
      photoFileName.textContent = file.name;

      photoDropzone.style.display = 'none';
      photoPreviewContainer.style.display = 'block';

      showToast('Photo loaded locally for your preview.', 'success');
    };

    reader.readAsDataURL(file);
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
      clearUploadedPhoto();
    });
  }

  function clearUploadedPhoto() {
    quizState.photoDataUrl = null;
    quizState.photoFileName = '';
    if (facePhotoInput) facePhotoInput.value = '';
    if (photoPreviewImg) photoPreviewImg.src = '';

    photoPreviewContainer.style.display = 'none';
    photoDropzone.style.display = 'block';
  }

  // --- QUIZ STEP MANAGEMENT ---
  function resetQuiz() {
    quizState.currentStep = 1;
    quizState.answers = {
      mainConcerns: [],
      duration: null,
      symptoms: [],
      progression: null,
      recentProducts: '',
      existingProducts: '',
      userDescription: '',
      budget: null
    };

    // Reset inputs
    clearUploadedPhoto();

    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
    document.querySelectorAll('.symptom-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.checkbox-card').forEach(cb => cb.classList.remove('selected'));

    const recentInput = document.getElementById('recentProductsInput');
    const existingInput = document.getElementById('existingProductsInput');
    const userDescInput = document.getElementById('userDescriptionInput');
    if (recentInput) recentInput.value = '';
    if (existingInput) existingInput.value = '';
    if (userDescInput) userDescInput.value = '';

    // Show quiz, hide results
    quizBody.style.display = 'block';
    resultsContainer.style.display = 'none';

    updateStepUI();
  }

  function updateStepUI() {
    quizSteps.forEach(step => {
      step.classList.remove('active');
      if (parseInt(step.dataset.step) === quizState.currentStep) {
        step.classList.add('active');
      }
    });

    // Update Progress Bar (1 to 4 steps)
    const progressPercent = (quizState.currentStep / quizState.totalSteps) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Button state logic
    if (quizState.currentStep === 1) {
      prevBtn.style.visibility = 'hidden';
    } else {
      prevBtn.style.visibility = 'visible';
    }

    if (quizState.currentStep === quizState.totalSteps) {
      nextBtn.textContent = 'View My Guidance';
      nextBtn.classList.add('btn-accent');
    } else {
      nextBtn.textContent = 'Continue';
      nextBtn.classList.remove('btn-accent');
    }
  }

  // Handle Option Card Clicks
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.key;
      const value = card.dataset.value;

      if (key === 'mainConcern') {
        if (!Array.isArray(quizState.answers.mainConcerns)) {
          quizState.answers.mainConcerns = [];
        }

        if (card.classList.contains('selected')) {
          card.classList.remove('selected');
          quizState.answers.mainConcerns = quizState.answers.mainConcerns.filter(v => v !== value);
        } else {
          card.classList.add('selected');
          if (!quizState.answers.mainConcerns.includes(value)) {
            quizState.answers.mainConcerns.push(value);
          }
        }
      } else {
        // Unselect sibling cards in same grid for single-select fields
        card.closest('.options-grid').querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        quizState.answers[key] = value;
      }
    });
  });

  // Handle Checkbox Cards for Symptoms
  document.querySelectorAll('.symptom-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.value === 'none' && cb.checked) {
        // Uncheck all other symptom checkboxes
        document.querySelectorAll('.symptom-checkbox').forEach(other => {
          if (other.value !== 'none') {
            other.checked = false;
            other.closest('.checkbox-card').classList.remove('selected');
          }
        });
      } else if (cb.value !== 'none' && cb.checked) {
        // Uncheck 'none' checkbox
        const noneCb = document.getElementById('symNone');
        if (noneCb) {
          noneCb.checked = false;
          noneCb.closest('.checkbox-card').classList.remove('selected');
        }
      }

      const parentCard = cb.closest('.checkbox-card');
      if (cb.checked) {
        parentCard.classList.add('selected');
      } else {
        parentCard.classList.remove('selected');
      }

      // Update symptom array in state
      const checkedBoxes = Array.from(document.querySelectorAll('.symptom-checkbox:checked')).map(box => box.value);
      quizState.answers.symptoms = checkedBoxes;
    });
  });

  // Step Navigation Buttons
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      // Capture optional user description text from Step 2
      const userDescInput = document.getElementById('userDescriptionInput');
      if (userDescInput) quizState.answers.userDescription = userDescInput.value.trim();

      // Validate current step
      if (!validateStep(quizState.currentStep)) {
        return;
      }

      if (quizState.currentStep < quizState.totalSteps) {
        quizState.currentStep++;
        updateStepUI();
      } else {
        // Collect text inputs before finishing
        const recentInput = document.getElementById('recentProductsInput');
        const existingInput = document.getElementById('existingProductsInput');
        if (recentInput) quizState.answers.recentProducts = recentInput.value.trim();
        if (existingInput) quizState.answers.existingProducts = existingInput.value.trim();

        // Show loading transition before results
        quizBody.style.display = 'none';
        const loadingContainer = document.getElementById('quizLoadingContainer');
        if (loadingContainer) loadingContainer.style.display = 'block';

        setTimeout(() => {
          if (loadingContainer) loadingContainer.style.display = 'none';
          generateAndShowResults();
        }, 950);
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (quizState.currentStep > 1) {
        quizState.currentStep--;
        updateStepUI();
      }
    });
  }

  function validateStep(step) {
    if (step === 1) {
      // Photo is optional!
      return true;
    }

    if (step === 2) {
      const concerns = quizState.answers.mainConcerns || [];
      if (concerns.length === 0 || !quizState.answers.duration) {
        showToast('Please select at least one skin concern and how long it has been present.', 'warning');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!quizState.answers.progression) {
        showToast('Please select whether your concern is spreading or worsening.', 'warning');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!quizState.answers.budget) {
        showToast('Please select your budget preference to view results.', 'warning');
        return false;
      }
      return true;
    }

    return true;
  }

  // --- RISK TRIAGE ENGINE & RESULT GENERATION ---
  function generateAndShowResults() {
    const { mainConcerns, duration, symptoms, progression, recentProducts, existingProducts, budget, userDescription } = quizState.answers;
    const concernsArray = Array.isArray(mainConcerns) ? mainConcerns : (mainConcerns ? [mainConcerns] : []);

    // Check Warning Signs / Red Flag Conditions
    const isUrgent = symptoms.includes('pain') ||
                     symptoms.includes('swelling') ||
                     symptoms.includes('burning') ||
                     symptoms.includes('pus') ||
                     symptoms.includes('bleeding') ||
                     symptoms.includes('blisters') ||
                     symptoms.includes('wounds') ||
                     progression === 'rapidly_worsening';

    // Check Uncertain / Insufficient Information Path (Safer Choice = Professional Assessment)
    const isUncertain = concernsArray.includes('other') || progression === 'not_sure';

    // Check Moderate Risk Conditions (Dermatologist Review Advisory + Basic Routine)
    const needsDermaAdvice = duration === '>6months' || progression === 'gradually_worsening';

    // Update Summary Pills
    const resConcernPill = document.getElementById('resConcernPill');
    const resDurationPill = document.getElementById('resDurationPill');
    const resProgressionPill = document.getElementById('resProgressionPill');

    if (resConcernPill) resConcernPill.textContent = `Skin Concerns: ${formatConcernsList(concernsArray)}`;
    if (resDurationPill) resDurationPill.textContent = `Duration: ${formatDurationName(duration)}`;
    if (resProgressionPill) resProgressionPill.textContent = `Status: ${formatProgressionName(progression)}`;
    
    const budgetPill = document.getElementById('resBudgetPill');
    if (budgetPill) {
      budgetPill.textContent = `Budget: ${formatBudgetPillLabel(budget)}`;
    }

    const resBudgetTierText = document.getElementById('resBudgetTierText');
    if (resBudgetTierText) {
      resBudgetTierText.textContent = formatBudgetLabel(budget);
    }

    // Show/Hide Photo Thumbnail Reference on Results
    if (quizState.photoDataUrl) {
      if (resultsPhotoThumb) resultsPhotoThumb.src = quizState.photoDataUrl;
      if (resultsPhotoCard) resultsPhotoCard.style.display = 'flex';
    } else if (resultsPhotoCard) {
      resultsPhotoCard.style.display = 'none';
    }

    // Show/Hide User Typed Description Card on Results
    const userDescCard = document.getElementById('resultsUserDescCard');
    const userDescText = document.getElementById('resUserDescText');
    if (userDescription && userDescCard && userDescText) {
      userDescText.textContent = `"${userDescription}"`;
      userDescCard.style.display = 'flex';
    } else if (userDescCard) {
      userDescCard.style.display = 'none';
    }

    // Show/Hide Existing Products Card on Results
    const existingCard = document.getElementById('resultsExistingProductsCard');
    const existingText = document.getElementById('resExistingProductsText');
    const combinedProductsNote = [
      existingProducts ? `Currently using: ${existingProducts}` : '',
      recentProducts ? `Recently added: ${recentProducts}` : ''
    ].filter(Boolean).join(' | ');

    if (combinedProductsNote && existingCard && existingText) {
      existingText.textContent = combinedProductsNote;
      existingCard.style.display = 'flex';
    } else if (existingCard) {
      existingCard.style.display = 'none';
    }

    // Triage View Display Logic
    if (isUrgent) {
      // PATH 1: WARNING / PROFESSIONAL ASSESSMENT PATH (Red Flags)
      if (urgentAlertBox) urgentAlertBox.style.display = 'flex';
      if (dermatologistWarningBox) dermatologistWarningBox.style.display = 'none';
      if (cosmeticGuidanceContainer) cosmeticGuidanceContainer.style.display = 'none';

      let alertMsg = 'Your questionnaire answers contain warning signs including ';
      const activeSyms = [];
      if (symptoms.includes('pain')) activeSyms.push('significant pain / tenderness');
      if (symptoms.includes('swelling')) activeSyms.push('swelling / inflammation');
      if (symptoms.includes('burning')) activeSyms.push('burning / stinging');
      if (symptoms.includes('pus')) activeSyms.push('pus / fluid discharge');
      if (symptoms.includes('bleeding')) activeSyms.push('bleeding');
      if (symptoms.includes('blisters')) activeSyms.push('blisters');
      if (symptoms.includes('wounds')) activeSyms.push('open / broken skin');
      if (progression === 'rapidly_worsening') activeSyms.push('rapidly spreading or worsening symptoms');

      alertMsg += activeSyms.join(', ') + '. ';
      alertMsg += 'Applying active cosmetic skincare products on active inflammatory reactions, open skin, or fluid discharge is not recommended as a solution, as over-the-counter products can worsen tissue irritation or delay clinical treatment. An in-person medical evaluation by a qualified dermatologist or healthcare professional is strongly recommended.';

      if (urgentAlertText) urgentAlertText.textContent = alertMsg;

    } else if (isUncertain) {
      // PATH 2A: UNCERTAIN / INSUFFICIENT INFORMATION PATH (Safer Choice = Professional Assessment)
      if (urgentAlertBox) urgentAlertBox.style.display = 'none';
      if (dermatologistWarningBox) dermatologistWarningBox.style.display = 'flex';
      if (cosmeticGuidanceContainer) cosmeticGuidanceContainer.style.display = 'none';

      if (dermatologistWarningText) {
        dermatologistWarningText.textContent = 'Because your questionnaire responses indicate an unspecified skin concern or an uncertain progression pattern, recommending cosmetic products is not the safer choice. An in-person evaluation by a certified dermatologist is recommended for an accurate clinical diagnosis.';
      }

    } else if (needsDermaAdvice) {
      // PATH 2B: DERMATOLOGIST RECOMMENDED ADVISORY + CAUTIOUS BASIC COSMETIC ROUTINE
      if (urgentAlertBox) urgentAlertBox.style.display = 'none';
      if (dermatologistWarningBox) dermatologistWarningBox.style.display = 'flex';
      if (cosmeticGuidanceContainer) cosmeticGuidanceContainer.style.display = 'block';

      if (dermatologistWarningText) {
        if (duration === '>6months') {
          dermatologistWarningText.textContent = 'Because your skin concern has persisted for over 6 months without resolution, an in-person clinical examination by a board-certified dermatologist is recommended before starting high-potency active acid exfoliants.';
        } else {
          dermatologistWarningText.textContent = 'Because your skin concern is gradually worsening over time, professional dermatological assessment is recommended to diagnose the root cause rather than relying solely on cosmetic products.';
        }
      }

      renderCosmeticRoutine(concernsArray, budget);

    } else {
      // PATH 3: MILD / GENERAL GUIDANCE PATH
      if (urgentAlertBox) urgentAlertBox.style.display = 'none';
      if (dermatologistWarningBox) dermatologistWarningBox.style.display = 'none';
      if (cosmeticGuidanceContainer) cosmeticGuidanceContainer.style.display = 'block';

      renderCosmeticRoutine(concernsArray, budget);
    }

    // Hide Quiz Body, Show Results Container
    quizBody.style.display = 'none';
    resultsContainer.style.display = 'block';

    // Save to LocalStorage
    try {
      localStorage.setItem('dermaGuideLastSkinCheck', JSON.stringify({
        timestamp: new Date().toISOString(),
        answers: quizState.answers,
        hasPhoto: !!quizState.photoDataUrl
      }));
    } catch (e) {
      console.log('LocalStorage save skipped');
    }
  }

  function renderCosmeticRoutine(concerns, budgetKey) {
    const concernsArray = Array.isArray(concerns) ? concerns : (concerns ? [concerns] : []);
    const budgetLabel = formatBudgetLabel(budgetKey);

    const amList = document.getElementById('amRoutineList');
    const pmList = document.getElementById('pmRoutineList');

    if (concernsArray.length === 1) {
      const data = routineDatabase[concernsArray[0]] || routineDatabase.acne;

      if (amList) {
        amList.innerHTML = data.am.map((step, idx) => `
          <li class="routine-step-item">
            <div class="step-num-badge">${idx + 1}</div>
            <div class="step-info">
              <strong>${step.title}</strong>
              <span>${step.desc} — ${budgetLabel}</span>
            </div>
          </li>
        `).join('');
      }

      if (pmList) {
        pmList.innerHTML = data.pm.map((step, idx) => `
          <li class="routine-step-item">
            <div class="step-num-badge">${idx + 1}</div>
            <div class="step-info">
              <strong>${step.title}</strong>
              <span>${step.desc} — ${budgetLabel}</span>
            </div>
          </li>
        `).join('');
      }

      const heroEl = document.getElementById('heroIngredientsText');
      const avoidEl = document.getElementById('avoidIngredientsText');
      const tipEl = document.getElementById('routineTipText');

      if (heroEl) heroEl.textContent = data.hero;
      if (avoidEl) avoidEl.textContent = data.avoid;
      if (tipEl) tipEl.textContent = data.tip;
      return;
    }

    // MULTIPLE CONCERNS: Synthesize a minimal, non-conflicting combined routine
    const hasAcneBHA = concernsArray.some(c => ['acne', 'blackheads_whiteheads', 'pores', 'small_bumps', 'oiliness'].includes(c));
    const hasPigmentation = concernsArray.some(c => ['pigmentation', 'dark_spots', 'uneven_tone', 'tanning', 'under_eye', 'lip_nose_darkness'].includes(c));
    const hasDryness = concernsArray.some(c => ['dryness', 'dehydrated', 'texture', 'fine_lines'].includes(c));
    const hasRedness = concernsArray.some(c => ['redness', 'sensitive', 'itching_concern'].includes(c));

    let amSteps = [
      { title: 'Gentle Cleanse', desc: 'Mild pH-balanced gel or hydration cleanser' },
      { title: 'Daytime Hydrate & Balance', desc: 'Niacinamide 5% serum (Multi-benefit for barrier, oil & marks)' },
      { title: 'Moisturize', desc: 'Lightweight non-comedogenic hydration' },
      { title: 'Sun Protection (Crucial)', desc: 'Broad-spectrum SPF 30+ / 50+ sunscreen' }
    ];

    if (hasDryness) {
      amSteps[0] = { title: 'Hydrating Cleanse', desc: 'Mild non-foaming cleansing lotion or lukewarm water' };
      amSteps[2] = { title: 'Barrier Moisturizer', desc: 'Nourishing Ceramide lotion/cream' };
    }

    let pmActiveDesc = 'Gentle active serum suitable for skin barrier repair';
    let heroList = ['Niacinamide'];
    let avoidList = ['Layering too many strong active acids simultaneously', 'Harsh physical walnut scrubs'];

    if (hasAcneBHA && hasPigmentation) {
      pmActiveDesc = 'Alternate nights: Salicylic Acid 1-2% (2 nights/wk) for pores, Azelaic Acid or Alpha Arbutin (3 nights/wk) for marks';
      heroList.push('Salicylic Acid (BHA)', 'Alpha Arbutin / Azelaic Acid', 'Broad-Spectrum SPF');
    } else if (hasAcneBHA) {
      pmActiveDesc = 'Salicylic Acid (BHA) 1-2% liquid exfoliant (2-3 nights per week)';
      heroList.push('Salicylic Acid (BHA)', 'Zinc PCA');
    } else if (hasPigmentation) {
      pmActiveDesc = 'Alpha Arbutin 2% or Azelaic Acid 10% serum for uneven tone';
      heroList.push('Alpha Arbutin', 'Azelaic Acid', 'Vitamin C');
    } else if (hasDryness) {
      pmActiveDesc = 'Hyaluronic Acid & Ceramide barrier recovery serum on damp skin';
      heroList.push('Hyaluronic Acid', 'Ceramides', 'Squalane');
    } else if (hasRedness) {
      pmActiveDesc = 'Centella Asiatica (Cica) & Panthenol calming serum';
      heroList.push('Centella Asiatica (Cica)', 'Panthenol (Vitamin B5)', 'Allantoin');
    } else {
      heroList.push('Ceramides', 'Hyaluronic Acid');
    }

    let pmSteps = [
      { title: 'Gentle Cleanse', desc: 'Mild hydrating cleanser to clear daily buildup and SPF' },
      { title: 'Targeted Evening Active', desc: pmActiveDesc },
      { title: 'Barrier Support Moisturizer', desc: 'Nourishing Ceramide cream to support skin overnight' }
    ];

    if (amList) {
      amList.innerHTML = amSteps.map((step, idx) => `
        <li class="routine-step-item">
          <div class="step-num-badge">${idx + 1}</div>
          <div class="step-info">
            <strong>${step.title}</strong>
            <span>${step.desc} — ${budgetLabel}</span>
          </div>
        </li>
      `).join('');
    }

    if (pmList) {
      pmList.innerHTML = pmSteps.map((step, idx) => `
        <li class="routine-step-item">
          <div class="step-num-badge">${idx + 1}</div>
          <div class="step-info">
            <strong>${step.title}</strong>
            <span>${step.desc} — ${budgetLabel}</span>
          </div>
        </li>
      `).join('');
    }

    const heroEl = document.getElementById('heroIngredientsText');
    const avoidEl = document.getElementById('avoidIngredientsText');
    const tipEl = document.getElementById('routineTipText');

    if (heroEl) heroEl.textContent = Array.from(new Set(heroList)).join(', ');
    if (avoidEl) avoidEl.textContent = Array.from(new Set(avoidList)).join(', ');
    if (tipEl) tipEl.textContent = `Combined Routine Tip: You have selected ${concernsArray.length} skin concerns (${concernsArray.map(c => formatConcernName(c)).join(', ')}). Keep daily steps minimal (Cleanser, 1 Active, Moisturizer, SPF). Introduce active ingredients slowly on alternate nights to prevent barrier irritation.`;
  }

  // --- RESULTS ACTIONS ---
  const backToQuizBtn = document.getElementById('backToQuizBtn');
  if (backToQuizBtn) {
    backToQuizBtn.addEventListener('click', () => {
      resultsContainer.style.display = 'none';
      quizBody.style.display = 'block';
      quizState.currentStep = 4;
      updateStepUI();
    });
  }

  const copyBtn = document.getElementById('copyRoutineBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const summaryText = `DermaGuide Skin Check Summary:
Skin Concerns: ${formatConcernsList(quizState.answers.mainConcerns)}
${quizState.answers.userDescription ? `User Notes: "${quizState.answers.userDescription}"\n` : ''}${quizState.answers.existingProducts ? `Existing Products: "${quizState.answers.existingProducts}"\n` : ''}${quizState.answers.recentProducts ? `Recent Product History: "${quizState.answers.recentProducts}"\n` : ''}Duration: ${formatDurationName(quizState.answers.duration)}
Progression: ${formatProgressionName(quizState.answers.progression)}
Symptoms: ${quizState.answers.symptoms.length ? quizState.answers.symptoms.map(s => formatSymptomName(s)).join(', ') : 'None'}
Budget Preference: ${formatBudgetLabel(quizState.answers.budget)}
Local Photo Attached: ${quizState.photoDataUrl ? 'Yes (Previewed locally in browser)' : 'No'}

Medical Notice: DermaGuide provides general cosmetic reference only, not a medical diagnosis. Consult a board-certified dermatologist for medical care.`;

      navigator.clipboard.writeText(summaryText).then(() => {
        showToast('Skin Check summary copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Could not copy automatically.', 'warning');
      });
    });
  }

  const printBtn = document.getElementById('printRoutineBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const retakeBtn = document.getElementById('retakeQuizBtn');
  if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
      resetQuiz();
    });
  }

  // --- INGREDIENT GLOSSARY LOGIC ---
  const glossaryGrid = document.getElementById('ingredientsGrid');
  const searchInput = document.getElementById('ingredientSearch');
  const tagBtns = document.querySelectorAll('.tag-btn');

  let activeTag = 'all';

  function renderIngredients() {
    if (!glossaryGrid) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = ingredientData.filter(ing => {
      const matchesSearch = ing.name.toLowerCase().includes(searchTerm) || ing.description.toLowerCase().includes(searchTerm);
      const matchesTag = activeTag === 'all' || ing.category === activeTag;
      return matchesSearch && matchesTag;
    });

    if (filtered.length === 0) {
      glossaryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          No matching skincare ingredients found. Try searching for "Niacinamide" or "Hyaluronic".
        </div>
      `;
      return;
    }

    glossaryGrid.innerHTML = filtered.map(ing => `
      <div class="ingredient-card">
        <div class="ingredient-header">
          <h4 class="ingredient-name">${ing.name}</h4>
          <span class="ingredient-tag">${ing.categoryLabel}</span>
        </div>
        <p class="ingredient-desc">${ing.description}</p>
        <div class="ingredient-bestfor">
          <strong>Best For:</strong> ${ing.bestFor}
        </div>
      </div>
    `).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderIngredients);
  }

  tagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tagBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTag = btn.dataset.tag;
      renderIngredients();
    });
  });

  // Initial Glossary Render
  renderIngredients();

  // --- TOAST HELPER ---
  function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- FORMATTING HELPERS ---
  function formatConcernsList(concernsArray) {
    if (!concernsArray || concernsArray.length === 0) return 'None Selected';
    return concernsArray.map(key => formatConcernName(key)).join(', ');
  }

  function formatConcernName(key) {
    switch (key) {
      case 'acne': return 'Acne-like spots';
      case 'pigmentation': return 'Dark patches / Hyperpigmentation';
      case 'redness': return 'Redness & Flushing';
      case 'dryness': return 'Dryness & Flaking';
      case 'oiliness': return 'Oiliness & Excess Sebum';
      case 'blackheads_whiteheads': return 'Blackheads / Whiteheads';
      case 'dark_spots': return 'Dark Spots / Post-Acne Marks';
      case 'uneven_tone': return 'Uneven Skin Tone';
      case 'tanning': return 'Tanning / Sun Damage';
      case 'pores': return 'Enlarged / Visible Pores';
      case 'texture': return 'Rough / Uneven Texture';
      case 'small_bumps': return 'Small Bumps';
      case 'dullness': return 'Dull-Looking Skin';
      case 'sensitive': return 'Sensitive / Easily Irritated Skin';
      case 'under_eye': return 'Under-Eye Darkness';
      case 'lip_nose_darkness': return 'Dark Areas Around Lips / Nose';
      case 'fine_lines': return 'Fine Lines / Early Signs of Aging';
      case 'dehydrated': return 'Dehydrated Skin';
      case 'scars': return 'Scars / Acne Marks';
      case 'itching_concern': return 'Itching / Irritation';
      case 'other': return 'Other / Unsure';
      default: return 'General Skin Check';
    }
  }

  function formatDurationName(key) {
    switch (key) {
      case '<1week': return 'Less than 1 week';
      case '1-4weeks': return '1 to 4 weeks';
      case '1-6months': return '1 to 6 months';
      case '>6months': return 'Over 6 months';
      default: return 'Unknown duration';
    }
  }

  function formatProgressionName(key) {
    switch (key) {
      case 'rapidly_worsening': return 'Rapidly Spreading or Worsening';
      case 'gradually_worsening': return 'Gradually Worsening';
      case 'slowly_worsening': return 'Slowly Getting Worse';
      case 'stable': return 'Stable / Unchanged';
      case 'improving': return 'Improving';
      case 'slowly_improving': return 'Slowly Improving';
      case 'just_appeared': return 'Just Appeared';
      case 'comes_and_goes': return 'Comes and Goes';
      case 'not_sure': return 'Not Sure';
      default: return 'Stable';
    }
  }

  function formatSymptomName(key) {
    switch (key) {
      case 'itching': return 'Itching';
      case 'pain': return 'Pain / Tenderness';
      case 'burning': return 'Burning / Stinging';
      case 'redness_symptom': return 'Redness';
      case 'swelling': return 'Swelling / Inflammation';
      case 'peeling': return 'Dryness / Peeling';
      case 'flaking': return 'Flaking';
      case 'pus': return 'Pus / Fluid';
      case 'bleeding': return 'Bleeding';
      case 'blisters': return 'Blisters';
      case 'wounds': return 'Open / Broken Skin';
      case 'none': return 'None of These';
      default: return key;
    }
  }

  function formatBudgetPillLabel(key) {
    switch (key) {
      case 'budget': return 'Under ₹500';
      case 'mid': return '₹500–₹1,000';
      case 'premium': return 'Above ₹1,000';
      default: return 'Standard';
    }
  }

  function formatBudgetLabel(key) {
    switch (key) {
      case 'budget': return 'Budget-Friendly (Under ₹500)';
      case 'mid': return 'Moderate / Mid-Range (₹500–₹1,000)';
      case 'premium': return 'Premium / Luxury (Above ₹1,000)';
      default: return 'Standard';
    }
  }

});
