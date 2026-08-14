/**
 * Translation + synonyms dictionary for search query expansion.
 *
 * Each entry groups together the same concept across languages (Arabic and
 * English) plus extra related words. When a user searches a word, every entry
 * containing that word expands the query with all of its aliases and
 * synonyms, so searching "حيوانات" also matches "animal", "fauna", ... and
 * vice-versa.
 */

export interface DictionaryEntry {
  /** The word(s) that trigger this entry across all supported languages. */
  terms: string[];
  /** Extra related words (synonyms) added to the query when this entry matches. */
  synonyms: string[];
}

export const SEARCH_DICTIONARY: DictionaryEntry[] = [
  { terms: ["حيوانات", "حيوان", "animal", "animals", "fauna"], synonyms: ["wildlife", "creatures", "mammals", "pets"] },
  { terms: ["طبيعة", "طبيعي", "nature", "landscape", "scenery"], synonyms: ["outdoors", "wilderness", "earth", "natural"] },
  { terms: ["سيارات", "سيارة", "car", "cars", "automobile", "automobiles"], synonyms: ["vehicle", "motor", "racing-car", "sports-car"] },
  { terms: ["مدينة", "مدن", "city", "cities", "urban"], synonyms: ["skyline", "street", "downtown", "buildings", "cityscape"] },
  { terms: ["فضاء", "space", "galaxy", "galaxies"], synonyms: ["universe", "cosmos", "nebula", "astronomy", "interstellar"] },
  { terms: ["داكن", "مظلم", "dark", "darkness"], synonyms: ["black", "shadow", "noir", "moody", "gothic"] },
  { terms: ["فاتح", "ضوء", "light", "bright"], synonyms: ["sunlight", "luminous", "glow", "shining"] },
  { terms: ["تجريدي", "abstract"], synonyms: ["geometric", "shapes", "artistic", "colorful", "surreal"] },
  { terms: ["سايبربانك", "cyberpunk"], synonyms: ["neon", "sci-fi", "futuristic", "dystopian", "tech-noir"] },
  { terms: ["انمي", "انيمي", "anime", "manga"], synonyms: ["japanese", "otaku", "cartoon", "illustration", "animation"] },
  { terms: ["العاب", "لعبة", "gaming", "game", "games", "gamer"], synonyms: ["esports", "console", "playstation", "xbox", "videogame"] },
  { terms: ["تكنولوجيا", "تقنية", "technology", "tech"], synonyms: ["digital", "future", "gadgets", "electronics", "innovation"] },
  { terms: ["برمجة", "programming", "coding", "code"], synonyms: ["developer", "hacker", "software", "computer", "javascript"] },
  { terms: ["بسيط", "بساطة", "minimal", "minimalist"], synonyms: ["simple", "clean", "modern", "plain", "flat"] },
  { terms: ["رياضة", "رياضات", "sports", "sport"], synonyms: ["athletic", "competition", "fitness", "stadium"] },
  { terms: ["افلام", "فيلم", "movie", "movies", "film", "films"], synonyms: ["cinema", "cinematic", "hollywood", "actor", "cinematography"] },
  { terms: ["موسيقى", "اغاني", "music", "song", "songs"], synonyms: ["concert", "dj", "instruments", "guitar", "piano", "singing"] },
  { terms: ["ثلاثي الابعاد", "3d"], synonyms: ["render", "modeling", "cgi", "digital-art"] },
  { terms: ["خيال", "خيالي", "fantasy"], synonyms: ["magic", "mythical", "fairytale", "enchanted", "wizard", "dragons"] },
  { terms: ["عمارة", "معماري", "architecture", "architectural"], synonyms: ["building", "monument", "design", "facade", "modern-architecture"] },
  { terms: ["طعام", "اكل", "مأكولات", "food", "meal", "meals"], synonyms: ["cooking", "restaurant", "delicious", "cuisine", "dessert"] },
  { terms: ["فخامة", "فاخر", "luxury"], synonyms: ["expensive", "elegant", "gold", "diamond", "premium", "rich"] },
  { terms: ["مركبات", "مركبة", "vehicle", "vehicles"], synonyms: ["truck", "bus", "train", "boat", "airplane", "plane", "transport"] },
  { terms: ["ذكاء اصطناعي", "ai", "ai-art", "artificial-intelligence"], synonyms: ["generative", "neural", "digital", "machine-learning"] },
  { terms: ["بحر", "محيط", "ocean", "sea"], synonyms: ["wave", "waves", "marine", "underwater", "coral", "aquatic"] },
  { terms: ["جبال", "جبل", "mountain", "mountains"], synonyms: ["peak", "alps", "hiking", "summit", "cliff", "hills"] },
  { terms: ["غابة", "forest", "woods"], synonyms: ["trees", "jungle", "rainforest", "green", "woodland"] },
  { terms: ["صحراء", "desert"], synonyms: ["dunes", "sand", "arid", "oasis", "sahara"] },
  { terms: ["شاطئ", "شاطىء", "beach"], synonyms: ["shore", "coast", "tropical", "island", "seaside"] },
  { terms: ["غروب", "شروق", "sunset", "sunrise", "dusk", "dawn"], synonyms: ["golden-hour", "evening", "morning", "twilight"] },
  { terms: ["ليل", "ليلة", "night"], synonyms: ["midnight", "moonlight", "nocturnal", "after-dark"] },
  { terms: ["ثلج", "snow", "winter"], synonyms: ["snowfall", "frost", "ice", "snowy", "christmas", "frozen"] },
  { terms: ["مطر", "ممطر", "rain", "rainy"], synonyms: ["storm", "rainfall", "umbrella", "droplets", "wet"] },
  { terms: ["نار", "حريق", "fire", "flame", "flames"], synonyms: ["burning", "heat", "burn", "blaze"] },
  { terms: ["سماء", "sky"], synonyms: ["clouds", "horizon", "atmosphere", "blue-sky"] },
  { terms: ["غيوم", "سحاب", "cloud", "clouds"], synonyms: ["cloudy", "stormy", "rain-clouds"] },
  { terms: ["قمر", "moon"], synonyms: ["lunar", "crescent", "moonlight", "full-moon"] },
  { terms: ["نجوم", "نجمة", "star", "stars"], synonyms: ["constellation", "shooting-star", "night-sky", "starry"] },
  { terms: ["كوكب", "كواكب", "planet", "planets"], synonyms: ["earth", "mars", "saturn", "orbit", "solar-system"] },
  { terms: ["امرأة", "فتاة", "بنت", "woman", "girl", "female"], synonyms: ["lady", "portrait", "model", "fashion"] },
  { terms: ["رجل", "فتى", "ولد", "man", "boy", "male"], synonyms: ["gentleman", "portrait", "model", "fashion"] },
  { terms: ["بورتريه", "صورة شخصية", "portrait"], synonyms: ["face", "closeup", "person", "close-up"] },
  { terms: ["حب", "حبيبة", "love", "romance"], synonyms: ["romantic", "heart", "couple", "valentine", "romantic-pair"] },
  { terms: ["قلب", "قلوب", "heart", "hearts"], synonyms: ["love", "valentine", "symbol"] },
  { terms: ["زهرة", "زهور", "وردة", "flower", "flowers", "rose", "roses"], synonyms: ["bloom", "petals", "blossom", "garden", "botanical"] },
  { terms: ["شجرة", "اشجار", "tree", "trees"], synonyms: ["leaf", "leaves", "forest", "green", "branches"] },
  { terms: ["بحيرة", "lake"], synonyms: ["water", "reflection", "pond", "still-water"] },
  { terms: ["نهر", "river", "stream"], synonyms: ["waterfall", "current", "waters", "creek"] },
  { terms: ["شلال", "waterfall", "falls"], synonyms: ["cascade", "water", "flowing"] },
  { terms: ["احمر", "أحمر", "red"], synonyms: ["crimson", "scarlet", "ruby"] },
  { terms: ["ازرق", "أزرق", "blue"], synonyms: ["azure", "navy", "cyan", "deep-blue"] },
  { terms: ["اخضر", "أخضر", "green"], synonyms: ["emerald", "lime", "grass", "leafy"] },
  { terms: ["اصفر", "أصفر", "yellow"], synonyms: ["golden", "amber", "sun"] },
  { terms: ["اسود", "أسود", "black"], synonyms: ["charcoal", "ebony", "midnight", "noir"] },
  { terms: ["ابيض", "أبيض", "white"], synonyms: ["snow", "pale", "ivory", "pure"] },
  { terms: ["وردي", "pink"], synonyms: ["rose", "magenta", "blush", "pastel"] },
  { terms: ["برتقالي", "orange"], synonyms: ["amber", "apricot", "sunset", "citrus"] },
  { terms: ["بنفسجي", "ارجواني", "purple"], synonyms: ["violet", "lavender", "magenta", "violet-tones"] },
  { terms: ["ذهبي", "ذهب", "gold", "golden"], synonyms: ["metallic", "luxury", "glow"] },
  { terms: ["فضي", "فضة", "silver"], synonyms: ["metallic", "chrome", "grey"] },
  { terms: ["رمادي", "gray", "grey"], synonyms: ["neutral", "silver", "monochrome"] },
  { terms: ["بني", "brown"], synonyms: ["chocolate", "wood", "earth", "wooden"] },
  { terms: ["نمر", "tiger"], synonyms: ["wild", "striped", "big-cat", "jungle"] },
  { terms: ["اسد", "lion", "lions"], synonyms: ["king", "wild", "savanna", "safari"] },
  { terms: ["قطة", "قط", "cat", "cats"], synonyms: ["kitten", "feline", "pet"] },
  { terms: ["كلب", "كلاب", "dog", "dogs"], synonyms: ["puppy", "canine", "pet"] },
  { terms: ["حصان", "خيل", "horse", "horses"], synonyms: ["stallion", "equestrian", "racing"] },
  { terms: ["طائر", "طيور", "عصفور", "bird", "birds"], synonyms: ["eagle", "falcon", "wing", "feather", "flying"] },
  { terms: ["ذئب", "wolf", "wolves"], synonyms: ["wild", "howl", "pack"] },
  { terms: ["ثعلب", "fox"], synonyms: ["wild", "sly", "orange"] },
  { terms: ["غزال", "deer"], synonyms: ["buck", "graceful", "forest"] },
  { terms: ["دب", "bear", "bears"], synonyms: ["grizzly", "polar", "wild"] },
  { terms: ["نسر", "عقاب", "eagle"], synonyms: ["bird-of-prey", "falcon", "majestic"] },
  { terms: ["بومة", "owl"], synonyms: ["night-bird", "wise", "nocturnal"] },
  { terms: ["ثعبان", "افعى", "snake", "serpent"], synonyms: ["reptile", "slithering"] },
  { terms: ["فراشة", "butterfly"], synonyms: ["insect", "wings", "colorful"] },
  { terms: ["فيل", "elephant"], synonyms: ["african", "safari", "wildlife"] },
  { terms: ["زرافة", "giraffe"], synonyms: ["africa", "tall", "safari"] },
  { terms: ["قرد", "monkey", "monkeys"], synonyms: ["ape", "primate", "jungle"] },
  { terms: ["ارنب", "أرنب", "rabbit"], synonyms: ["bunny", "hare", "cute"] },
  { terms: ["سمك", "سمكة", "fish"], synonyms: ["aquatic", "seafood", "underwater"] },
  { terms: ["حوت", "whale"], synonyms: ["dolphin", "marine", "mammal", "ocean"] },
  { terms: ["دلفين", "dolphin"], synonyms: ["marine", "intelligent", "ocean"] },
  { terms: ["سلحفاة", "turtle", "tortoise"], synonyms: ["sea-turtle", "marine", "reptile"] },
  { terms: ["بطريق", "penguin"], synonyms: ["antarctic", "bird", "snow"] },
  { terms: ["باندا", "panda"], synonyms: ["bamboo", "china", "cute"] },
  { terms: ["حمار وحشي", "zebra"], synonyms: ["africa", "striped", "safari"] },
  { terms: ["تنين", "dragon", "dragons"], synonyms: ["mythical", "fantasy", "fire-breathing"] },
  { terms: ["روبوت", "robot", "robots"], synonyms: ["android", "machine", "mecha", "automaton"] },
  { terms: ["سيف", "سيوف", "sword", "swords"], synonyms: ["blade", "samurai", "katana", "warrior"] },
  { terms: ["ساموراي", "samurai"], synonyms: ["japan", "warrior", "sword", "katana"] },
  { terms: ["نينجا", "ninja"], synonyms: ["japan", "warrior", "stealth", "shadows"] },
  { terms: ["بطل خارق", "superhero", "super-hero"], synonyms: ["comic", "hero", "marvel", "dc"] },
  { terms: ["كرة سلة", "basketball"], synonyms: ["nba", "sport", "court"] },
  { terms: ["كرة قدم", "soccer", "football"], synonyms: ["stadium", "sport", "fifa", "football-pitch"] },
  { terms: ["دراجة نارية", "motorcycle", "motorbike"], synonyms: ["bike", "racing", "biker", "speed"] },
  { terms: ["دراجة", "bicycle", "bike"], synonyms: ["cycling", "cyclist", "city"] },
  { terms: ["صاروخ", "rocket"], synonyms: ["space", "launch", "nasa", "takeoff"] },
  { terms: ["هاتف", "جوال", "mobile", "phone", "smartphone"], synonyms: ["iphone", "android", "device", "cellphone"] },
  { terms: ["حاسوب", "كمبيوتر", "computer"], synonyms: ["laptop", "pc", "desktop", "workstation"] },
  { terms: ["لابتوب", "laptop", "notebook"], synonyms: ["computer", "portable", "macbook"] },
  { terms: ["هاكر", "hacker", "hacking"], synonyms: ["cyber", "security", "code", "terminal"] },
  { terms: ["دائرة كهربائية", "circuit", "circuit-board"], synonyms: ["electronics", "cpu", "processor", "motherboard"] },
  { terms: ["نيون", "neon"], synonyms: ["glowing", "cyberpunk", "sign", "light-signs"] },
  { terms: ["تدرج", "gradient"], synonyms: ["blend", "smooth", "colorful", "fade"] },
  { terms: ["هندسي", "geometric"], synonyms: ["shapes", "patterns", "minimal", "abstract"] },
  { terms: ["نقش", "نمط", "pattern", "patterns"], synonyms: ["texture", "design", "repeating", "tile"] },
  { terms: ["ملمس", "خامة", "texture", "textures"], synonyms: ["surface", "pattern", "material"] },
  { terms: ["سائل", "liquid"], synonyms: ["fluid", "water", "flow", "spill"] },
  { terms: ["موجة", "امواج", "wave", "waves"], synonyms: ["ocean", "soundwave", "flow", "surf"] },
  { terms: ["زجاج", "glass"], synonyms: ["crystal", "window", "reflection", "glassy"] },
  { terms: ["الماس", "diamond"], synonyms: ["jewel", "crystal", "luxury", "gem"] },
  { terms: ["قهوة", "coffee"], synonyms: ["cafe", "caffeine", "cup", "latte"] },
  { terms: ["قلعة", "قلاع", "castle", "castles"], synonyms: ["fortress", "palace", "medieval", "tower"] },
  { terms: ["جسر", "bridge"], synonyms: ["river", "structure", "crossing", "suspension"] },
  { terms: ["طريق", "road", "street"], synonyms: ["highway", "drive", "path", "asphalt"] },
  { terms: ["قوس قزح", "rainbow"], synonyms: ["colors", "spectrum", "sky", "prismatic"] },
  { terms: ["العاب نارية", "firework", "fireworks"], synonyms: ["celebration", "explosion", "light", "burst"] },
  { terms: ["برق", "صاعقة", "lightning", "thunder"], synonyms: ["storm", "electric", "sky", "strike"] },
  { terms: ["شفق", "aurora", "aurora-borealis"], synonyms: ["northern-lights", "polar", "sky", "glow"] },
  { terms: ["سحر", "magic", "magical"], synonyms: ["wizard", "spells", "fantasy", "enchantment"] },
  { terms: ["عصور وسطى", "medieval"], synonyms: ["knight", "castle", "ancient", "middle-ages"] },
  { terms: ["فارس", "knight", "knights"], synonyms: ["armor", "medieval", "warrior", "crusader"] },
  { terms: ["ملك", "king"], synonyms: ["royal", "crown", "throne", "royalty"] },
  { terms: ["ملكة", "queen"], synonyms: ["royal", "crown", "elegance", "royalty"] },
  { terms: ["ملاك", "angel"], synonyms: ["heavenly", "wings", "pure", "divine"] },
  { terms: ["جمجمة", "skull"], synonyms: ["dark", "gothic", "skeleton", "death"] },
  { terms: ["دخان", "smoke"], synonyms: ["fog", "mist", "haze", "smoky"] },
  { terms: ["ضباب", "fog", "mist"], synonyms: ["moody", "haze", "atmospheric", "foggy"] },
  { terms: ["شبح", "ghost", "spooky"], synonyms: ["halloween", "paranormal", "scary", "dark"] },
  { terms: ["كرنفال", "carnival", "festival"], synonyms: ["celebration", "lights", "fun", "fair"] },
  { terms: ["عشاء", "dinner", "restaurant"], synonyms: ["food", "dining", "table", "cuisine"] },
  { terms: ["شوكولاتة", "chocolate"], synonyms: ["dessert", "sweet", "cocoa", "cake"] },
  { terms: ["كيك", "cake"], synonyms: ["dessert", "sweet", "celebration", "baking"] },
  { terms: ["ساعة", "clock", "watch"], synonyms: ["time", "timepiece", "wristwatch", "horology"] },
  { terms: ["عالم", "world", "globe"], synonyms: ["earth", "map", "planet", "international"] },
  { terms: ["جزيرة", "island", "islands"], synonyms: ["tropical", "beach", "ocean", "paradise"] },
  { terms: ["صحراء رملية", "dunes", "sand-dunes"], synonyms: ["desert", "sand", "wind", "golden"] },
  { terms: ["نافورة", "fountain"], synonyms: ["water", "park", "city", "spray"] },
  { terms: ["علم", "flag", "flags"], synonyms: ["country", "patriotic", "national"] },
  { terms: ["حرب", "war", "military"], synonyms: ["army", "soldier", "tactical", "weapon"] },
  { terms: ["طائرة", "airplane", "plane", "aircraft"], synonyms: ["aviation", "flight", "jet", "airline"] },
  { terms: ["قطار", "train"], synonyms: ["railway", "rail", "locomotive", "station"] },
  { terms: ["سفينة", "ship", "boat", "vessel"], synonyms: ["sail", "harbor", "marine", "cruise"] },
  { terms: ["يخت", "yacht"], synonyms: ["luxury", "boat", "sailing", "marina"] },
  { terms: ["انارة", "lighting", "lamps"], synonyms: ["lamp", "bulb", "illumination", "warm-light"] },
  { terms: ["شمعة", "candle", "candles"], synonyms: ["warm", "romantic", "flame", "glow"] },
  { terms: ["مفاتيح", "keys", "keyboard"], synonyms: ["piano", "lock", "typing", "music"] },
  { terms: ["سباق", "racing", "race"], synonyms: ["speed", "competition", "formula-1", "rally"] },
  { terms: ["جري", "running", "run"], synonyms: ["marathon", "sport", "athlete", "sprint"] },
  { terms: ["تسلق", "climbing", "mountaineering"], synonyms: ["rock", "mountain", "adventure", "alpinism"] },
  { terms: ["غطس", "diving", "scuba"], synonyms: ["underwater", "ocean", "deep-sea", "snorkeling"] },
  { terms: ["تصوير", "photography"], synonyms: ["camera", "lens", "photo", "photographer"] },
  { terms: ["كاميرا", "camera"], synonyms: ["photography", "lens", "snapshot", "dslr"] },
];

/**
 * Normalizes Arabic text (and lowercases English) so that different forms of
 * the same word compare equal: strips diacritics/tatweel, normalizes alef
 * hamza forms to "ا", teh marbuta to "ه", alef maqsura to "ي", and waw/yeh
 * hamza to "و"/"ي".
 */
export function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .trim();
}

/**
 * Expands a search query into a deduplicated list of terms: the original
 * words plus every translation and synonym found in the dictionary. Terms are
 * returned both in their original (lowercased) form and normalized form so
 * Arabic queries keep matching content written either way.
 */
export function expandQuery(query: string, maxTerms = 12): string[] {
  const phrase = query.toLowerCase().trim();
  if (!phrase) return [];

  const results: string[] = [];
  const seen = new Set<string>();

  const addTerm = (term: string) => {
    const raw = term.trim().toLowerCase();
    if (!raw || seen.has(raw)) return;
    seen.add(raw);
    results.push(raw);
    const norm = normalizeArabic(raw);
    if (norm && norm !== raw && !seen.has(norm)) {
      seen.add(norm);
      results.push(norm);
    }
  };

  const normPhrase = normalizeArabic(phrase);
  const compactPhrase = normPhrase.replace(/\s+/g, "");

  const addEntry = (entry: DictionaryEntry) => {
    for (const t of entry.terms) addTerm(t);
    for (const s of entry.synonyms) addTerm(s);
  };

  // Phrase-level match first (handles multi-word concepts like "كرة قدم").
  for (const entry of SEARCH_DICTIONARY) {
    const matched = entry.terms.some((t) => {
      const norm = normalizeArabic(t);
      return norm === normPhrase || norm.replace(/\s+/g, "") === compactPhrase;
    });
    if (matched) addEntry(entry);
  }

  // Token-level match.
  for (const token of phrase.split(/[\s,\u060C+،-]+/).filter(Boolean)) {
    addTerm(token);
    const normToken = normalizeArabic(token);
    for (const entry of SEARCH_DICTIONARY) {
      const matched = entry.terms.some((t) => normalizeArabic(t) === normToken);
      if (matched) addEntry(entry);
    }
    if (results.length >= maxTerms) break;
  }

  return results.slice(0, maxTerms);
}
