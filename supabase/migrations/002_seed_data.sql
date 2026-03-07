-- ============================================================
-- Mwalimu Wangu — Seed Data
-- 5 Sample Teachers + 3 Sample Blog Posts
-- ============================================================

-- ─── Teachers ─────────────────────────────────────────────────────────────────
INSERT INTO teachers (
  slug, name, email, phone, profile_image_url, tagline, bio,
  teaching_approach, experience_years, qualifications, certifications,
  languages_spoken, specializations, hourly_rate, timezone,
  availability_description, is_native_speaker, is_published, rating, total_students
) VALUES

(
  'amina-odhiambo',
  'Amina Odhiambo',
  'amina@example.com',
  '+254 712 345 678',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&auto=format',
  'Native Swahili speaker specialising in Business & Professional Swahili',
  'Habari! I am Amina, born and raised in Mombasa, Kenya — a coastal city where Swahili is the heartbeat of daily life. I hold a Bachelor of Education degree from the University of Nairobi and have been teaching Swahili professionally for over 8 years. My students range from diplomats preparing for East African postings, to NGO workers, entrepreneurs, and curious language enthusiasts.

I believe language is not just words; it is culture, history, and connection. In my lessons, I weave in Swahili proverbs (methali), East African history, and real-world conversation so that my students leave not only speaking Swahili, but thinking in it.

I have helped over 120 students reach conversational fluency, and several have gone on to work in Kenya, Tanzania, and Uganda. Whether you are a complete beginner or looking to polish your business vocabulary, I adapt every lesson to your goals.',
  'I use a communicative approach — we speak Swahili from the very first lesson. I combine structured grammar explanations with immersive conversation practice, role-plays, and audio materials. Every lesson includes homework tailored to your daily life so that Swahili becomes a habit, not just a classroom exercise.',
  8,
  'Bachelor of Education (Kiswahili & English), University of Nairobi',
  ARRAY['TEFL Certified', 'Cambridge Assessment English Trainer'],
  '[{"language": "Swahili", "level": "Native"}, {"language": "English", "level": "Fluent"}, {"language": "Giriama", "level": "Conversational"}]',
  ARRAY['Business', 'Conversational', 'Exam Prep'],
  38,
  'Africa/Nairobi',
  'Monday–Friday 7am–6pm EAT. Weekend slots available on request.',
  TRUE, TRUE, 4.9, 127
),

(
  'juma-hassan',
  'Juma Hassan',
  'juma@example.com',
  '+255 754 987 321',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format',
  'Zanzibar-born tutor making Swahili fun for kids and beginners',
  'Jambo! My name is Juma and I grew up on the beautiful island of Zanzibar, where Standard Swahili — the kind taught in schools and used in formal settings — was the language of my childhood. I have a diploma in Primary Education and have taught children aged 5–15 in both school and private settings for six years.

Teaching young learners is my passion. Children are natural language sponges, and with the right stories, songs, games, and visuals, they can pick up Swahili remarkably fast. I also have a gentle, patient style that works well for complete adult beginners who feel nervous about starting a new language.

Beyond the classroom, I run a small YouTube channel where I share Swahili stories and songs for kids, which has helped me develop engaging, multimedia-rich lesson materials.',
  'For children, I use TPR (Total Physical Response), songs, flashcards, and storytelling. For adult beginners, I start with practical survival phrases and everyday dialogues before progressing to grammar. I always celebrate small wins — confidence is the foundation of fluency.',
  6,
  'Diploma in Primary Education, Zanzibar University',
  ARRAY['Child-Centred Language Teaching Certificate'],
  '[{"language": "Swahili", "level": "Native"}, {"language": "English", "level": "Fluent"}, {"language": "Arabic", "level": "Basic"}]',
  ARRAY['Kids & Young Learners', 'Conversational', 'Travel'],
  22,
  'Africa/Dar_es_Salaam',
  'Flexible schedule — weekday evenings and full weekends available.',
  TRUE, TRUE, 4.8, 89
),

(
  'sarah-kimani',
  'Sarah Kimani',
  'sarah@example.com',
  NULL,
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&auto=format',
  'Academic Swahili specialist — KCSE, university entrance & heritage learners',
  'Ninaomba unikaribishe! I am Sarah, a former secondary school Swahili teacher with a Master of Arts in Linguistics from Kenyatta University. After teaching in Nairobi schools for a decade, I transitioned to private tutoring to focus on students who need structured, exam-focused instruction.

My speciality is academic Swahili: preparing students for the Kenya Certificate of Secondary Education (KCSE), university entrance requirements, and students of African heritage who grew up abroad and want to reconnect with their roots through structured learning.

I have an 85% distinction rate among my KCSE students and have helped heritage learners from the UK, USA, and Canada reach conversational and written fluency within six months.',
  'I follow a structured, progressive curriculum that covers all four language skills: reading, writing, listening, and speaking. For exam students, I provide past paper practice, model answers, and regular mock tests. For heritage learners, I design personalised plans that start from their existing knowledge base.',
  12,
  'MA Linguistics, Kenyatta University; BA Education (Kiswahili), Kenyatta University',
  ARRAY['Kenya National Examinations Council (KNEC) Examiner', 'TEFL Level 5'],
  '[{"language": "Swahili", "level": "Native"}, {"language": "English", "level": "Native"}, {"language": "French", "level": "Basic"}]',
  ARRAY['Academic', 'Exam Prep', 'Conversational'],
  45,
  'Africa/Nairobi',
  'Monday–Saturday, 8am–8pm EAT. Sundays for emergencies only.',
  TRUE, TRUE, 5.0, 203
),

(
  'david-omondi',
  'David Omondi',
  'david@example.com',
  '+254 733 456 789',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&auto=format',
  'Conversational Swahili for travellers — fast, practical, and enjoyable',
  'Mambo! I am David from Kisumu, Kenya. I have been teaching Swahili to travellers, volunteers, and gap-year students for four years, helping them communicate confidently before and during their East African adventures. Before teaching, I worked as a tour guide in the Maasai Mara, so I know exactly what phrases and cultural knowledge make the biggest difference on the ground.

My lessons are relaxed, conversational, and packed with the phrases you actually need — from bargaining at a market to greeting a village elder respectfully. I also cover Kenyan slang (Sheng) for those wanting to blend in with young urban Kenyans.

Students who take even 5–10 lessons with me report dramatically better experiences during their trips.',
  'Every lesson is a simulated real-world scenario: at the market, on a safari, meeting a host family, ordering food, or navigating transport. I focus on pronunciation, common phrases, and cultural etiquette. Lessons are lively, encouraging, and zero pressure.',
  4,
  'Certificate in Tourism Management, Kenya Utalii College',
  ARRAY['Wilderness First Responder (WFR)', 'Safari Guide Certification'],
  '[{"language": "Swahili", "level": "Native"}, {"language": "English", "level": "Fluent"}, {"language": "Luo", "level": "Native"}, {"language": "Maasai", "level": "Basic"}]',
  ARRAY['Travel', 'Conversational', 'Cultural Immersion'],
  18,
  'Africa/Nairobi',
  'Very flexible — can accommodate most time zones for early morning or evening sessions.',
  TRUE, TRUE, 4.7, 54
),

(
  'fatuma-ali',
  'Fatuma Ali',
  'fatuma@example.com',
  '+255 768 111 222',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&auto=format',
  'Business Swahili expert for professionals entering East African markets',
  'Karibu sana! My name is Fatuma, and I specialise in Business Swahili for professionals expanding into East Africa. I hold an MBA from the University of Dar es Salaam and spent eight years working in international trade and logistics before becoming a language instructor.

My business background gives me a unique edge: I understand the corporate vocabulary, negotiation phrases, meeting etiquette, and cross-cultural communication nuances that textbooks often miss. I have trained professionals from global firms, including staff from development organisations, import/export companies, and international NGOs.

I am based in Dar es Salaam and available for intensive business Swahili crash courses as well as long-term professional language development programmes.',
  'Business-context immersion: we practice writing emails, conducting meetings, negotiating contracts, and making presentations in Swahili. I provide real business documents and case studies for reading comprehension, and we work on formal written Swahili alongside spoken fluency.',
  9,
  'MBA, University of Dar es Salaam; BA International Business',
  ARRAY['Certified Business Language Trainer (CBL)', 'IELTS Examiner (English)'],
  '[{"language": "Swahili", "level": "Native"}, {"language": "English", "level": "Fluent"}, {"language": "Arabic", "level": "Conversational"}]',
  ARRAY['Business', 'Conversational', 'Academic'],
  42,
  'Africa/Dar_es_Salaam',
  'Weekdays 9am–5pm EAT. Intensive weekend bootcamps available on request.',
  TRUE, TRUE, 4.8, 78
);

-- ─── Blog Posts ───────────────────────────────────────────────────────────────
INSERT INTO blog_posts (
  slug, title, excerpt, content, featured_image_url,
  author, category, tags, read_time, is_published, published_at
) VALUES

(
  '10-swahili-phrases-every-beginner-should-know',
  '10 Swahili Phrases Every Beginner Should Know',
  'Starting your Swahili journey? These 10 essential phrases will help you greet people, show respect, and navigate daily life across East Africa from day one.',
  '## Why These Phrases Matter

Learning a language begins long before you can form a sentence. The first words you master set the tone for your entire learning journey — and in Swahili, a few key phrases will open doors, spark smiles, and earn you immediate goodwill from native speakers.

Swahili is spoken by over 200 million people across East and Central Africa. Whether you are heading to Kenya, Tanzania, Uganda, Rwanda, or beyond, these phrases will serve you every single day.

---

## 1. **Jambo / Hujambo** — Hello

The classic Swahili greeting. *Jambo* is the informal, tourist-friendly version. If you want to greet someone more naturally, use *Hujambo?* ("How are you?" — literally "No troubles?"), to which the reply is *Sijambo* ("I am fine" — literally "No troubles at all").

**Pro tip:** In coastal Kenya and Tanzania, you will hear *Mambo?* among young people, to which you reply *Poa!* (Cool/Good).

---

## 2. **Asante (sana)** — Thank you (very much)

*Asante* is one of the most useful and appreciated words you can use. Add *sana* ("very much") for extra warmth. The response is *Karibu* — which also means "welcome."

---

## 3. **Karibu** — Welcome / You are welcome

This word does triple duty: it welcomes guests, responds to thanks, and invites people in. You will hear it constantly — at shops, homes, and restaurants.

---

## 4. **Tafadhali** — Please

Politeness goes a long way in Swahili culture. Use *tafadhali* whenever making a request.

*Ninaomba maji, tafadhali.* — "I would like water, please."

---

## 5. **Samahani** — Excuse me / I am sorry

Use *samahani* to get someone''s attention, apologise, or squeeze past someone in a crowd. It is warm and disarming.

---

## 6. **Ndiyo / Hapana** — Yes / No

Simple and essential. *Ndiyo* (yes) and *Hapana* (no) will get you through countless daily interactions.

---

## 7. **Ninaelewa / Sielewi** — I understand / I do not understand

Incredibly useful during lessons or conversations. Do not be shy about saying *Sielewi* — native speakers will appreciate your honesty and slow down or rephrase.

---

## 8. **Bei gani?** — How much?

Shopping in East Africa is often a social experience. *Bei gani?* ("What is the price?") will start the conversation at any market, stall, or shop.

---

## 9. **Unaitwa nani?** — What is your name?

*Unaitwa nani?* ("What are you called?") is slightly more common in everyday speech than *Jina lako ni nani?*. The response: *Ninaitwa [name].*

---

## 10. **Kwaheri** — Goodbye

End every interaction with a warm *Kwaheri* ("Goodbye"). To say goodbye to a group, use *Kwaherini*.

---

## Practice Makes Permanent

The best way to make these phrases stick? Use them with a real person. At Mwalimu Wangu, our native Swahili teachers will help you move from memorising phrases to speaking them naturally — with the right tone, rhythm, and cultural context.

*Kila la heri!* (Best of luck!) — and welcome to the wonderful world of Swahili.',
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&h=630&fit=crop&auto=format',
  'Amina Odhiambo',
  'Beginner Tips',
  ARRAY['beginner', 'phrases', 'vocabulary', 'basics'],
  7,
  TRUE,
  NOW() - INTERVAL '10 days'
),

(
  'why-learning-swahili-opens-doors-in-east-africa',
  'Why Learning Swahili Opens Doors in East Africa',
  'Swahili is more than a language — it is a key to understanding one of the world''s fastest-growing regions. Here is why investing in Swahili fluency is one of the best decisions you can make.',
  '## The Language of a Continent in Motion

East Africa is one of the most dynamic regions on earth. Economies are growing, cities are expanding, and a young, ambitious population is rewriting the rules of business, technology, and culture. At the centre of all of this is one language: Swahili.

With over 200 million speakers across Kenya, Tanzania, Uganda, Rwanda, Burundi, the Democratic Republic of Congo, and beyond, Swahili is the most widely spoken Bantu language in the world. It is the official language of the African Union and one of the working languages of the East African Community.

---

## Business Opportunities

If you are in business, Swahili fluency is a competitive edge. The East African Community represents a combined GDP of over $300 billion and a consumer market that is growing at remarkable speed.

Companies that invest in Swahili communication build trust with local partners, navigate bureaucracy more smoothly, and connect with customers on a deeper level. Many international executives who have learned even conversational Swahili report that it transforms business relationships — from transactional to genuinely collaborative.

---

## For Travellers and Volunteers

East Africa attracts millions of visitors every year — for wildlife safaris, mountain climbing, beach holidays, and volunteer work. Speaking Swahili changes the nature of those experiences completely.

Instead of seeing Africa through a tourist bubble, you gain direct access to communities, markets, and conversations that remain invisible to non-Swahili speakers. Local people respond to the effort with warmth and openness that is hard to describe until you experience it.

---

## For the Diaspora

For East African diaspora communities in the UK, USA, Canada, Australia, and beyond, Swahili is a bridge back to heritage, family, and identity. Many second-generation East Africans describe learning Swahili as one of the most meaningful decisions of their adult lives — a way of reclaiming something that migration threatened to take away.

---

## Academic and Research Value

East African literature, oral tradition, philosophy, and history are richly expressed in Swahili. Scholars, journalists, and researchers who speak Swahili gain access to a body of knowledge that is simply unavailable in translation.

---

## Start Today

There has never been a better time to learn Swahili. Online learning tools, qualified teachers, and accessible resources make it possible to reach conversational fluency within months of dedicated study. Our teachers at Mwalimu Wangu are ready to guide you every step of the way.

*Karibu — and let the journey begin.*',
  'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200&h=630&fit=crop&auto=format',
  'Sarah Kimani',
  'Culture & Motivation',
  ARRAY['east africa', 'business', 'culture', 'motivation', 'diaspora'],
  9,
  TRUE,
  NOW() - INTERVAL '25 days'
),

(
  'how-to-practice-swahili-daily-tips-from-native-speakers',
  'How to Practice Swahili Daily: Tips from Native Speakers',
  'Consistency is the secret to language learning. Our native Swahili teachers share their top strategies for building a daily Swahili habit that fits into your real life.',
  '## The Secret Is Daily Contact

Language research consistently shows that daily exposure — even in small doses — outperforms cramming sessions. The brain builds language skills through repeated, low-stakes contact over time. The question is not how much time you have; it is how to use whatever time you have wisely.

We asked our Mwalimu Wangu teachers to share their favourite daily practice strategies. Here is what they said.

---

## 1. Change Your Phone Language (Amina Odhiambo)

"The very first thing I tell my students: change your phone to Swahili. You use your phone dozens of times a day — every notification, every app label, every menu becomes a mini-lesson. Within two weeks, you will know Swahili for ''settings,'' ''notifications,'' ''battery,'' and hundreds of everyday words without a single flashcard."

---

## 2. Talk to Yourself (Juma Hassan)

"This sounds odd, but it works beautifully. Narrate what you are doing as you do it — in Swahili. *Ninakunywa kahawa* (I am drinking coffee). *Ninafungua mlango* (I am opening the door). Your brain starts connecting Swahili words to physical actions, which is exactly how children learn."

---

## 3. Listen to Swahili Radio and Podcasts (Fatuma Ali)

"Kenya Broadcasting Corporation (KBC) and Tanzania Broadcasting Corporation (TBC) both stream online. Even if you only understand 20%, your ear is getting tuned to the rhythm, tone, and speed of natural Swahili. After a few weeks of background listening, you will notice your comprehension jumps dramatically."

---

## 4. Write a Swahili Diary (Sarah Kimani)

"Even three sentences a day makes a difference. Write about your day: *Leo nilikula uji wa wimbi asubuhi* (Today I ate millet porridge in the morning). Do not worry about mistakes — writing forces you to think about vocabulary and grammar in a way that passive learning never does. Share your diary with your tutor for corrections."

---

## 5. Follow Swahili Social Media Accounts (David Omondi)

"There are fantastic Swahili-language Instagram accounts, TikTokers, and Twitter/X pages. Follow Kenyan and Tanzanian news accounts, comedians, and influencers. Social media Swahili reflects how people actually speak today — including urban slang and current events. It is the most current textbook you will ever find."

---

## 6. Use Spaced Repetition Flashcards

Apps like Anki and Brainscape use spaced repetition — showing you words just before you are about to forget them. Download or create a Swahili deck and spend 10 minutes reviewing cards each morning with your coffee.

---

## 7. Find a Swahili Language Partner

Platforms like Tandem and HelloTalk connect you with native Swahili speakers who want to practise your native language in exchange. Real conversation — even via text — accelerates learning far faster than studying alone.

---

## 8. Watch Swahili Films and Series

Kenyan and Tanzanian film industries have grown enormously. Look for Kenyan drama series and Bongo movies (Tanzanian films) on YouTube. Start with subtitles in English, then switch to Swahili subtitles as your skills grow.

---

## Build the Habit, Not the Streak

Do not aim for a perfect 365-day streak — aim to make Swahili a natural part of your life. Some days you will have 30 minutes; others, just 5. Both count. Consistency over time is the only formula that works.

Our Mwalimu Wangu teachers are here to guide your structured learning and keep you accountable. Book a lesson today and let us build your Swahili practice plan together.

*Jifunze kila siku — learn every day!*',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=630&fit=crop&auto=format',
  'Mwalimu Wangu Team',
  'Learning Tips',
  ARRAY['practice', 'daily habits', 'tips', 'study methods', 'fluency'],
  10,
  TRUE,
  NOW() - INTERVAL '5 days'
);
