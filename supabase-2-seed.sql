-- ============================================================================
-- EVERYTHING ZANZIBAR — initial data seed
-- Run AFTER schema.sql, in the Supabase SQL Editor (it runs as superuser and
-- bypasses RLS, so this works before you create any staff user).
-- Safe to re-run: activities/yachts upsert by key; hotels/events/posts only
-- insert when their table is still empty.
-- ============================================================================

-- ---------------- 35 ACTIVITIES (upsert by name) ----------------
insert into public.activities (name, category, location, duration, visual_prompt, image_url, price_single, price_double, price_triple, price_group) values
('Baraka Aquarium','Culture, Heritage & Wildlife','Nungwi','2 Hours','Vibrant crystal-clear natural lagoon cave in Nungwi filled with beautiful green sea turtles swimming around visitors.','https://images.pexels.com/photos/5349869/pexels-photo-5349869.jpeg?auto=compress&cs=tinysrgb&w=700',20,20,20,15),
('Cheetah''s Rock Great Wildlife Tour','Culture, Heritage & Wildlife','Chuini','4 Hours','An ethical luxury wildlife sanctuary in Chuini, featuring close-up interactions with cheetahs and white lions under golden sunlight.','https://images.pexels.com/photos/789580/pexels-photo-789580.jpeg?auto=compress&cs=tinysrgb&w=700',160,160,160,160),
('Cheetah''s Rock VIP Otter Experience','Culture, Heritage & Wildlife','Chuini','2 Hours','Premium private pool setting at Chuini wildlife sanctuary with playful otters swimming in clear turquoise water.','https://images.pexels.com/photos/789580/pexels-photo-789580.jpeg?auto=compress&cs=tinysrgb&w=700',150,150,150,150),
('Cheetah''s Rock VIP Otter Experience + Great Wildlife Tour','Culture, Heritage & Wildlife','Chuini','6 Hours','All-inclusive premium luxury safari day-experience at Chuini showing rescue animals, exotic birds, and tropical greenery.','https://images.pexels.com/photos/789580/pexels-photo-789580.jpeg?auto=compress&cs=tinysrgb&w=700',280,280,280,280),
('Jozani Forest Tour','Culture, Heritage & Wildlife','Jozani','2 Hours','Lush, sun-dappled tropical mahogany jungle canopy at Jozani with rare Red Colobus Monkeys jumping across green branches.','https://commons.wikimedia.org/wiki/Special:FilePath/Zanzibar_Red_Colobus_at_Jozani_Chwaka_Bay_National_Park%2C_Kusini_DC%2C_South_Zanzibar%2C_Tanzania.jpg?width=700',30,25,25,20),
('Spice Tour','Culture, Heritage & Wildlife','Kijichi (Kizimbani)','2 Hours','Sunlit aromatic spice farm plantation in Kijichi displaying fresh green vanilla pods, cinnamon bark, and vibrant red cloves.','https://commons.wikimedia.org/wiki/Special:FilePath/Forodhani_park_food_stand.jpg?width=700',30,25,20,15),
('Spice Tour + Cooking Class','Culture, Heritage & Wildlife','Kijichi (Kizimbani)','4 Hours','An outdoor rustic tropical kitchen venue surrounded by palm trees with fresh Zanzibar ingredients and colourful local spices.','https://commons.wikimedia.org/wiki/Special:FilePath/Forodhani_park_food_stand.jpg?width=700',45,40,35,30),
('Stone Town Tour','Culture, Heritage & Wildlife','Stone Town','2 Hours','Historic ancient architecture of Stone Town featuring beautiful intricately carved wooden doors and coral stone narrow alleys.','https://commons.wikimedia.org/wiki/Special:FilePath/Old_Fort_of_Zanzibar.jpg?width=700',30,25,20,20),
('Swahili Culinary Workshop','Culture, Heritage & Wildlife','Kijichi (Kizimbani)','3 Hours','Authentic Swahili masterclass setup with traditional clay pots, fresh coconuts, and exotic seafood preparations.','https://commons.wikimedia.org/wiki/Special:FilePath/Forodhani_park_food_stand.jpg?width=700',40,35,30,25),
('The Prison Island Changuu','Culture, Heritage & Wildlife','Stone Town / Off-Coast','3 Hours','Changuu Prison Island turquoise coastal waters featuring giant Aldabra tortoises roaming freely around historical stone ruins.','https://images.pexels.com/photos/5349869/pexels-photo-5349869.jpeg?auto=compress&cs=tinysrgb&w=700',80,70,60,50),
('Blue Lagoon Star Fish Snorkelling','Ocean Sandbanks & Marine Safaris','Pongwe','3 Hours','Shallow, perfectly translucent crystal clear blue water lagoon in Pongwe over a sandy floor filled with bright red starfish.','https://commons.wikimedia.org/wiki/Special:FilePath/Beach_at_Matemwe.jpg?width=700',70,60,50,40),
('Mnemba Island Dolphin Discovery','Ocean Sandbanks & Marine Safaris','Matemwe / Mnemba Atoll','4 Hours','Breathtaking bright turquoise ocean waters near Mnemba Atoll reef with wild bottlenose dolphins jumping alongside a boat.','https://commons.wikimedia.org/wiki/Special:FilePath/Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg?width=700',70,60,50,40),
('Nakupenda Sandbank','Ocean Sandbanks & Marine Safaris','Stone Town / Off-Coast','4 Hours','A stunning isolated brilliant white sandbank island surrounded completely by dynamic shades of blue and turquoise Indian Ocean waters.','https://commons.wikimedia.org/wiki/Special:FilePath/Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg?width=700',80,60,50,40),
('Safari Blue (Private)','Ocean Sandbanks & Marine Safaris','Fumba / Menai Bay','6 Hours','A high-end luxury private wooden dhow sailing through Menai Bay marine conservation area, complete with a gourmet lobster lunch set up on a sandbank.','https://images.pexels.com/photos/4784477/pexels-photo-4784477.jpeg?auto=compress&cs=tinysrgb&w=700',450,250,200,150),
('Safari Blue (Sharing)','Ocean Sandbanks & Marine Safaris','Fumba / Menai Bay','6 Hours','Exciting ocean eco-adventure boat cruise group exploring mangrove lagoons, natural coral reefs, and swimming spots in Fumba.','https://images.pexels.com/photos/4784477/pexels-photo-4784477.jpeg?auto=compress&cs=tinysrgb&w=700',60,60,60,50),
('Sunset Cruise (Private)','Ocean Sandbanks & Marine Safaris','Stone Town','2 Hours','Exclusive private luxury dhow yacht sailing away from Stone Town into a magnificent crimson, gold, and purple African ocean sunset.','https://commons.wikimedia.org/wiki/Special:FilePath/Sunset_with_palm_trees_%2830737629082%29.jpg?width=700',250,200,150,120),
('Sunset Cruise (Sharing)','Ocean Sandbanks & Marine Safaris','Stone Town','2 Hours','Fun, atmospheric twilight boat party on the Indian Ocean with tropical drinks, live music, and beautiful golden hour skylines.','https://commons.wikimedia.org/wiki/Special:FilePath/Sunset_with_palm_trees_%2830737629082%29.jpg?width=700',40,30,30,30),
('East Coast Horse Riding','Mystical Caves & Horse Riding Adventures','Michamvi','30 Mins','Majestic white horses trotting gracefully through shallow white-sand ocean waters along the scenic coastline of Michamvi.','https://images.pexels.com/photos/19721381/pexels-photo-19721381.jpeg?auto=compress&cs=tinysrgb&w=700',70,70,70,70),
('Maalum Natural Cave','Mystical Caves & Horse Riding Adventures','Paje','2 Hours','Stunning hidden eco-sanctuary cave in Paje featuring an emerald green natural swimming pool surrounded by ancient limestone formations.','https://commons.wikimedia.org/wiki/Special:FilePath/PAJE%2C_Zanzibar.jpg?width=700',20,20,20,20),
('North Coast Beach Horse Riding','Mystical Caves & Horse Riding Adventures','Nungwi','30 Mins','Stunning beachfront horseback riding experience on the powdery shores of Nungwi beach under brilliant clear afternoon skies.','https://images.pexels.com/photos/19721381/pexels-photo-19721381.jpeg?auto=compress&cs=tinysrgb&w=700',70,70,70,70),
('Salaam Cave','Mystical Caves & Horse Riding Adventures','Kizimkazi','2 Hours','Enchanting crystal-clear underground natural water cave tucked into the tropical jungle surroundings of Kizimkazi.','https://commons.wikimedia.org/wiki/Special:FilePath/PAJE%2C_Zanzibar.jpg?width=700',20,20,20,20),
('Jetski Rental','Adrenaline & Active Water Sports','Stone Town','30 Mins','Fast-paced premium modern jet ski speeding over turquoise ocean waters leaving a dramatic white water wake.','https://images.pexels.com/photos/1430675/pexels-photo-1430675.jpeg?auto=compress&cs=tinysrgb&w=700',50,40,40,40),
('Kayak Rentals','Adrenaline & Active Water Sports','Flexible / Island Wide','20 Mins','Sleek glass-bottom clear transparent kayak floating seamlessly over vibrant shallow coral reefs.','https://images.pexels.com/photos/6877753/pexels-photo-6877753.jpeg?auto=compress&cs=tinysrgb&w=700',30,50,30,NULL),
('Kite Surfing','Adrenaline & Active Water Sports','Flexible / Paje Beach','Per Hour','A dynamic kite surfer catching serious air and gliding smoothly above the world-famous flat turquoise lagoons of Paje.','https://images.pexels.com/photos/1599915/pexels-photo-1599915.jpeg?auto=compress&cs=tinysrgb&w=700',70,70,70,70),
('Parasailing Experience','Adrenaline & Active Water Sports','Flexible / Northern Coast','10 Mins','An exciting parasail canopy high in the sky offering an expansive bird''s-eye aerial view over Zanzibar''s multi-toned blue reefs.','https://images.pexels.com/photos/1599915/pexels-photo-1599915.jpeg?auto=compress&cs=tinysrgb&w=700',120,140,NULL,NULL),
('Scuba Diver Course (3 Days)','Adrenaline & Active Water Sports','Flexible / Marine Parks','3 Days','Professional scuba diving instruction setup in warm, beautiful turquoise tropical resort pool training grounds.','https://images.pexels.com/photos/1540108/pexels-photo-1540108.jpeg?auto=compress&cs=tinysrgb&w=700',430,430,430,430),
('Scuba Diver PADI Open Water Course','Adrenaline & Active Water Sports','Flexible / Open Ocean','4 Days','Divers deep underwater exploring massive stunning coral walls and schools of colorful tropical fish with PADI instructor.','https://images.pexels.com/photos/1540108/pexels-photo-1540108.jpeg?auto=compress&cs=tinysrgb&w=700',600,600,600,600),
('Scuba Diving Beginner (2 Dives)','Adrenaline & Active Water Sports','Flexible / Shallow Reefs','3 Hours','First-time diving experience swimming alongside exotic sea turtles in crystal-clear, shallow coral reef gardens.','https://images.pexels.com/photos/1540108/pexels-photo-1540108.jpeg?auto=compress&cs=tinysrgb&w=700',120,120,120,120),
('Sky Diving','Adrenaline & Active Water Sports','Nungwi Dropzone','3 Hours','High-adrenaline tandem skydiving flight open parachute overlooking the entire breathtaking coastline and turquoise outlines of northern Zanzibar.','https://commons.wikimedia.org/wiki/Special:FilePath/Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg?width=700',450,450,450,450),
('Sport Fishing (4 Hours)','Adrenaline & Active Water Sports','Flexible / Deep Sea','4 Hours','High-end deep-sea sportfishing yacht rigging professional lines out on the deep blue waters of the Zanzibar channel.','https://images.pexels.com/photos/4784477/pexels-photo-4784477.jpeg?auto=compress&cs=tinysrgb&w=700',500,250,200,150),
('Sport Fishing (7 Hours Deep Sea)','Adrenaline & Active Water Sports','Flexible / Deep Sea','7 Hours','Ultimate big game fishing trophy action out at sea catching large marlin or yellowfin tuna on a sleek customized fishing vessel.','https://images.pexels.com/photos/4784477/pexels-photo-4784477.jpeg?auto=compress&cs=tinysrgb&w=700',600,400,250,200),
('Zanzibar Quadbike Adventure','Adrenaline & Active Water Sports','Kiwengwa / Jambiani','3 Hours','Powerful modern quad bikes driving off-road through rugged tropical dirt paths, local villages, and scenic palm groves.','https://commons.wikimedia.org/wiki/Special:FilePath/Sunset_with_palm_trees_%2830737629082%29.jpg?width=700',150,140,130,130),
('Drone Photography & Video','Media Production & Add-ons','Flexible / Customer Request','Flexible','High-tech professional quadcopter drone flying over an ultra-clear beach capturing beautiful high-angle vacation memories.','https://commons.wikimedia.org/wiki/Special:FilePath/Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg?width=700',50,100,NULL,NULL),
('Rent a Car (Stone Town)','Getting Around Stone Town','Stone Town','Per Day','A clean modern compact rental car parked on a coral-stone Stone Town street, ready to roam the spice island at your own pace.','https://commons.wikimedia.org/wiki/Special:FilePath/Old_Fort_of_Zanzibar.jpg?width=700',45,45,45,40),
('Scooter & Tuk-Tuk Hire (Stone Town)','Getting Around Stone Town','Stone Town','Per Day','A colourful tuk-tuk and scooter by Forodhani Gardens — the easy local way to weave through Stone Town''s narrow lanes.','https://commons.wikimedia.org/wiki/Special:FilePath/Forodhani_park_food_stand.jpg?width=700',25,25,25,20)
on conflict (name) do update set
  category=excluded.category, location=excluded.location, duration=excluded.duration,
  visual_prompt=excluded.visual_prompt, image_url=excluded.image_url,
  price_single=excluded.price_single, price_double=excluded.price_double,
  price_triple=excluded.price_triple, price_group=excluded.price_group,
  is_active=true, updated_at=now();

-- ---------------- THE FLEET (3 yachts, upsert by id) ----------------
insert into public.yachts (id, name, capacity, price_label, image_url, description, amenities, sort) values
('y1','Luxury Catamaran','Up to 12 guests','from $850 / day','https://commons.wikimedia.org/wiki/Special:FilePath/Approaching_Zanzibar.jpg?width=900','Twin-hull stability and a wide shade deck — the all-day island cruiser.',ARRAY['Twin hulls & shade deck','Snorkel gear & paddleboards','Captain, crew & chef','Sound system & cooler bar'],1),
('y2','Luxury Motor Yacht','Up to 8 guests','from $1,200 / day','https://commons.wikimedia.org/wiki/Special:FilePath/Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg?width=900','Air-conditioned speed to Mnemba and back before lunch.',ARRAY['Air-con cabin & sun pads','Pro skipper & deckhand','Premium bar & catering','Dive to Mnemba on request'],2),
('y3','Sunset Cruiser (traditional dhow)','Up to 20 guests','from $480 / cruise','https://commons.wikimedia.org/wiki/Special:FilePath/Sunset_with_palm_trees_%2830737629082%29.jpg?width=900','A hand-built Zanzibari dhow timed to golden hour.',ARRAY['Hand-built Zanzibari dhow','Golden-hour timing','Champagne & canapés','Live acoustic Taarab option'],3)
on conflict (id) do update set
  name=excluded.name, capacity=excluded.capacity, price_label=excluded.price_label,
  image_url=excluded.image_url, description=excluded.description, amenities=excluded.amenities, sort=excluded.sort;

-- ---------------- PARTNER HOTELS (6, only if table empty) ----------------
insert into public.hotels (name, area, image_url, highlights, sort)
select v.name, v.area, v.image_url, v.highlights, v.sort from (values
  ('Nungwi Beach Resort','Nungwi · North coast','https://commons.wikimedia.org/wiki/Special:FilePath/Paradise_at_Nungwi%2C_Kaskazini_A%2C_Unguja_North%2C_Zanzibar.jpg?width=700',ARRAY['Beachfront','Infinity pool','All-inclusive'],1),
  ('Matemwe Boutique Lodge','Matemwe · North-east','https://commons.wikimedia.org/wiki/Special:FilePath/Beach_at_Matemwe.jpg?width=700',ARRAY['Reef access','Spa','Adults-friendly'],2),
  ('Stone Town Palace Hotel','Stone Town · UNESCO quarter','https://commons.wikimedia.org/wiki/Special:FilePath/Old_Fort_of_Zanzibar.jpg?width=700',ARRAY['Boutique','Rooftop bar','Heritage'],3),
  ('Paje Lagoon Villas','Paje · East coast','https://commons.wikimedia.org/wiki/Special:FilePath/PAJE%2C_Zanzibar.jpg?width=700',ARRAY['Lagoon','Kitesurf','Private villa'],4),
  ('Kendwa Dreams Retreat','Kendwa · North-west','https://commons.wikimedia.org/wiki/Special:FilePath/Sunset_with_palm_trees_%2830737629082%29.jpg?width=700',ARRAY['Sunset beach','Beach club','Swim-up bar'],5),
  ('Mnemba Atoll Lodge','Mnemba · Private atoll','https://commons.wikimedia.org/wiki/Special:FilePath/Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg?width=700',ARRAY['Private island','World-class diving','Barefoot luxury'],6)
) as v(name,area,image_url,highlights,sort)
where not exists (select 1 from public.hotels);

-- ---------------- EVENT REGISTRY (5, only if table empty) ----------------
insert into public.events (name, location, starts_at, price_tiers, flyer_url, description)
select v.name, v.location, v.starts_at::timestamptz, v.price_tiers, v.flyer_url, v.description from (values
  ('Spice Coast Festival','Kendwa','2026-08-14 16:00','Early Bird $45 · GA $70 · VIP Cabana $640','festival.jpg.jpg','Two beach stages, a Taarab orchestra and Afrobeats & house headliners on Kendwa beach.'),
  ('Sauti za Busara','Stone Town','2027-02-12 18:00','Day pass $40 · Festival pass $140','','East Africa''s landmark live-music festival at the Old Fort, Stone Town.'),
  ('Kendwa Rocks Full Moon','Kendwa','2026-07-29 21:00','Entry $15','','The island''s legendary monthly full-moon beach party.'),
  ('Forodhani Night Market Sessions','Stone Town','2026-08-03 19:00','Free entry','','Live Taarab & street-food nights at Forodhani Gardens on the waterfront.'),
  ('Paje Kite & Beats','Paje','2026-09-06 15:00','GA $25 · Sundowner $60','','Kite-beach day party with house DJs as the trade winds drop at sunset.')
) as v(name,location,starts_at,price_tiers,flyer_url,description)
where not exists (select 1 from public.events);

-- ---------------- JOURNAL / NEWS (6 posts, only if table empty) ----------------
insert into public.posts (title, category, published, image_url, excerpt, body)
select v.title, v.category, v.published::date, v.image_url, v.excerpt, v.body from (values
  ('Spice Coast Festival 2026 — the first names are in','Events','2026-06-20','festival.jpg.jpg','Two beach stages, a Taarab orchestra and a b2b sunset set you''ll be talking about for years. Early-bird tickets are live, and they won''t last.',''),
  ('Introducing sunset yacht sailings to Mnemba','Experiences','2026-06-14','yacht.jpg.jpg','A private vessel, a curated crowd and the clearest water on the island. Our newest sailing now runs every Saturday at golden hour.',''),
  ('7 hidden beaches the crowds always miss','Guides','2026-06-08','https://commons.wikimedia.org/wiki/Special:FilePath/Beach_at_Matemwe.jpg?width=900','Past the resorts and the day-trip buses, these are the shorelines locals keep for themselves. Tide times included.',''),
  ('Now booking: airport transfers & full-stay transport','Updates','2026-06-02','https://commons.wikimedia.org/wiki/Special:FilePath/Approaching_Zanzibar.jpg?width=900','Met at arrivals, driven everywhere, dropped at departure. Your whole ground journey, handled by one team.',''),
  ('A night at Forodhani: Stone Town''s street-food market','Food','2026-05-26','https://commons.wikimedia.org/wiki/Special:FilePath/Forodhani_park_food_stand.jpg?width=900','Urojo, Zanzibar pizza and sugar-cane juice under the stars. What to order, and what to skip.',''),
  ('Meet the red colobus: a morning in Jozani forest','Nature','2026-05-18','https://commons.wikimedia.org/wiki/Special:FilePath/Zanzibar_Red_Colobus_at_Jozani_Chwaka_Bay_National_Park%2C_Kusini_DC%2C_South_Zanzibar%2C_Tanzania.jpg?width=900','The rare monkey found nowhere else on earth — and how to see it the responsible way.','')
) as v(title,category,published,image_url,excerpt,body)
where not exists (select 1 from public.posts);

-- ---------------- confirm ----------------
select
  (select count(*) from public.activities) as activities,
  (select count(*) from public.yachts)     as yachts,
  (select count(*) from public.hotels)     as hotels,
  (select count(*) from public.events)     as events,
  (select count(*) from public.posts)      as posts;
