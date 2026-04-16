-- ============================================================
-- FloHops MVP — Demo Seed Data
-- Run this in Supabase SQL Editor AFTER running 001_initial_schema.sql
-- Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING
-- ============================================================

-- ─── BREWERIES ────────────────────────────────────────────────

insert into breweries (
  name, slug, description,
  address, city, state, zip, lat, lng,
  phone, website, hours,
  kid_friendly, dog_friendly, has_food, has_food_trucks,
  outdoor_seating, covered_outdoor, has_wine, full_bar, sober_options,
  is_active
) values

-- 1. Cigar City Brewing
(
  'Cigar City Brewing',
  'cigar-city-brewing',
  'One of Florida''s most celebrated craft breweries, Cigar City has put Tampa on the national beer map. Famous for Jai Alai IPA and Maduro Brown Ale, their taproom is a must-visit destination with a rotating list of small-batch releases.',
  '3924 W Spruce St', 'Tampa', 'FL', '33607',
  27.9612, -82.5018,
  '(813) 348-6363', 'https://cigarcitybrewing.com',
  '{"mon":{"open":"11:00","close":"23:00","closed":false},"tue":{"open":"11:00","close":"23:00","closed":false},"wed":{"open":"11:00","close":"23:00","closed":false},"thu":{"open":"11:00","close":"23:00","closed":false},"fri":{"open":"11:00","close":"00:00","closed":false},"sat":{"open":"11:00","close":"00:00","closed":false},"sun":{"open":"11:00","close":"23:00","closed":false}}',
  true, false, true, false, true, true, false, true, false,
  true
),

-- 2. Crooked Can Brewing
(
  'Crooked Can Brewing Company',
  'crooked-can-brewing',
  'Nestled inside the Plant Street Market in historic Winter Garden, Crooked Can brews approachable, flavorful beers in a vibrant open-market setting. Known for their High Stepper IPA and a lively atmosphere perfect for families.',
  '426 W Plant St', 'Winter Garden', 'FL', '34787',
  28.5651, -81.5864,
  '(407) 656-2739', 'https://crookedcan.com',
  '{"mon":{"open":"00:00","close":"00:00","closed":true},"tue":{"open":"12:00","close":"21:00","closed":false},"wed":{"open":"12:00","close":"21:00","closed":false},"thu":{"open":"12:00","close":"21:00","closed":false},"fri":{"open":"12:00","close":"22:00","closed":false},"sat":{"open":"11:00","close":"22:00","closed":false},"sun":{"open":"11:00","close":"21:00","closed":false}}',
  true, true, true, false, true, false, false, false, false,
  true
),

-- 3. Hourglass Brewery
(
  'Hourglass Brewery',
  'hourglass-brewery',
  'A Longwood staple since 2012, Hourglass is known for big, bold IPAs and an ever-changing tap list. Their relaxed taproom has a loyal local following, regular food trucks, and one of the best beer gardens in Central Florida.',
  '480 S Ronald Reagan Blvd', 'Longwood', 'FL', '32750',
  28.7024, -81.3501,
  '(407) 262-0056', 'https://hourglassbrewery.com',
  '{"mon":{"open":"00:00","close":"00:00","closed":true},"tue":{"open":"15:00","close":"22:00","closed":false},"wed":{"open":"15:00","close":"22:00","closed":false},"thu":{"open":"15:00","close":"22:00","closed":false},"fri":{"open":"15:00","close":"23:00","closed":false},"sat":{"open":"12:00","close":"23:00","closed":false},"sun":{"open":"12:00","close":"21:00","closed":false}}',
  false, true, false, true, true, false, false, false, false,
  true
),

-- 4. Ivanhoe Park Brewing
(
  'Ivanhoe Park Brewing Company',
  'ivanhoe-park-brewing',
  'Located in Orlando''s charming Ivanhoe Village district, this neighborhood brewery focuses on clean, sessionable beers and a welcoming taproom. A perfect stop before or after exploring the antique shops and galleries nearby.',
  '1300 Alden Rd', 'Orlando', 'FL', '32803',
  28.5638, -81.3785,
  '(407) 270-3228', 'https://ivanhoeparkbrewing.com',
  '{"mon":{"open":"00:00","close":"00:00","closed":true},"tue":{"open":"00:00","close":"00:00","closed":true},"wed":{"open":"16:00","close":"22:00","closed":false},"thu":{"open":"16:00","close":"22:00","closed":false},"fri":{"open":"14:00","close":"23:00","closed":false},"sat":{"open":"12:00","close":"23:00","closed":false},"sun":{"open":"12:00","close":"21:00","closed":false}}',
  false, true, false, true, true, false, false, false, true,
  true
),

-- 5. Sideward Brewing
(
  'Sideward Brewing Company',
  'sideward-brewing',
  'Tucked inside the East End Market in Orlando''s Audubon Park, Sideward brews small-batch, experimental ales with an emphasis on local ingredients. The cozy taproom doubles as a community gathering spot with rotating local art.',
  '3201 Corrine Dr', 'Orlando', 'FL', '32803',
  28.5791, -81.3438,
  '(407) 792-7909', 'https://sidewardbrewing.com',
  '{"mon":{"open":"00:00","close":"00:00","closed":true},"tue":{"open":"00:00","close":"00:00","closed":true},"wed":{"open":"16:00","close":"21:00","closed":false},"thu":{"open":"16:00","close":"21:00","closed":false},"fri":{"open":"14:00","close":"22:00","closed":false},"sat":{"open":"12:00","close":"22:00","closed":false},"sun":{"open":"12:00","close":"20:00","closed":false}}',
  false, false, false, false, false, false, false, false, true,
  true
),

-- 6. Persimmon Hollow Brewing
(
  'Persimmon Hollow Brewing Co.',
  'persimmon-hollow-brewing',
  'A beloved DeLand institution, Persimmon Hollow crafts beers inspired by Florida''s natural landscape. Their main taproom features a sprawling back patio, live music on weekends, and some of the most creative seasonal offerings in the state.',
  '111 W Georgia Ave', 'DeLand', 'FL', '32720',
  29.0291, -81.3054,
  '(386) 956-6777', 'https://persimmonhollowbrewing.com',
  '{"mon":{"open":"14:00","close":"21:00","closed":false},"tue":{"open":"14:00","close":"21:00","closed":false},"wed":{"open":"14:00","close":"21:00","closed":false},"thu":{"open":"14:00","close":"22:00","closed":false},"fri":{"open":"12:00","close":"23:00","closed":false},"sat":{"open":"12:00","close":"23:00","closed":false},"sun":{"open":"12:00","close":"21:00","closed":false}}',
  true, true, true, false, true, true, true, false, false,
  true
),

-- 7. 3 Daughters Brewing
(
  '3 Daughters Brewing',
  '3-daughters-brewing',
  'Named after the founder''s three daughters, this St. Pete staple is as much about community as it is craft beer. Their massive outdoor space hosts food trucks, live music, and family-friendly events year-round.',
  '222 22nd St S', 'St. Petersburg', 'FL', '33712',
  27.7619, -82.6374,
  '(727) 495-6002', 'https://3dbrewing.com',
  '{"mon":{"open":"12:00","close":"22:00","closed":false},"tue":{"open":"12:00","close":"22:00","closed":false},"wed":{"open":"12:00","close":"22:00","closed":false},"thu":{"open":"12:00","close":"22:00","closed":false},"fri":{"open":"12:00","close":"23:00","closed":false},"sat":{"open":"11:00","close":"23:00","closed":false},"sun":{"open":"11:00","close":"22:00","closed":false}}',
  true, true, false, true, true, true, false, false, false,
  true
),

-- 8. Motorworks Brewing
(
  'Motorworks Brewing',
  'motorworks-brewing',
  'Set in a converted auto garage in downtown Bradenton, Motorworks is a destination brewery with a stunning rooftop bar, a full kitchen, and over 20 taps. Their Bracket Race IPA and Worker''s Stout are local legends.',
  '1014 9th St W', 'Bradenton', 'FL', '34205',
  27.4975, -82.5777,
  '(941) 567-6218', 'https://motorworksbrewing.com',
  '{"mon":{"open":"11:00","close":"22:00","closed":false},"tue":{"open":"11:00","close":"22:00","closed":false},"wed":{"open":"11:00","close":"22:00","closed":false},"thu":{"open":"11:00","close":"22:00","closed":false},"fri":{"open":"11:00","close":"23:00","closed":false},"sat":{"open":"11:00","close":"23:00","closed":false},"sun":{"open":"11:00","close":"21:00","closed":false}}',
  true, false, true, false, true, true, true, true, true,
  true
),

-- 9. Tactical Brewing
(
  'Tactical Brewing Company',
  'tactical-brewing',
  'Orlando''s military-themed craft brewery with a mission to brew exceptional beer and give back to veteran causes. Known for their Operation: Hop Drop IPA series and a taproom decorated with a rich tribute to the armed forces.',
  '4882 New Broad St', 'Orlando', 'FL', '32814',
  28.5407, -81.3378,
  '(407) 614-7059', 'https://tacticalbrewing.com',
  '{"mon":{"open":"00:00","close":"00:00","closed":true},"tue":{"open":"00:00","close":"00:00","closed":true},"wed":{"open":"15:00","close":"22:00","closed":false},"thu":{"open":"15:00","close":"22:00","closed":false},"fri":{"open":"14:00","close":"23:00","closed":false},"sat":{"open":"12:00","close":"23:00","closed":false},"sun":{"open":"12:00","close":"20:00","closed":false}}',
  false, false, false, true, true, false, false, false, false,
  true
),

-- 10. Orange Blossom Brewing
(
  'Orange Blossom Brewing Company',
  'orange-blossom-brewing',
  'Celebrating Florida''s citrus heritage, Orange Blossom brews bright, fruit-forward ales and lagers that taste like sunshine in a glass. Their open-air taproom in downtown Orlando is vibrant and dog-friendly.',
  '100 W Livingston St', 'Orlando', 'FL', '32801',
  28.5422, -81.3808,
  '(407) 985-2244', 'https://obbrewing.com',
  '{"mon":{"open":"00:00","close":"00:00","closed":true},"tue":{"open":"12:00","close":"22:00","closed":false},"wed":{"open":"12:00","close":"22:00","closed":false},"thu":{"open":"12:00","close":"22:00","closed":false},"fri":{"open":"12:00","close":"23:00","closed":false},"sat":{"open":"11:00","close":"23:00","closed":false},"sun":{"open":"11:00","close":"21:00","closed":false}}',
  true, true, false, true, true, false, false, false, true,
  true
),

-- 11. Redlight Redlight Beer Parlour
(
  'Redlight Redlight Beer Parlour',
  'redlight-redlight',
  'A true craft beer bar and brewery in Orlando''s Audubon Park Garden District. Redlight Redlight has been a champion of the craft beer scene for over two decades, pouring an eclectic mix of their own house brews alongside rare imports and local favourites.',
  '2810 Corrine Dr', 'Orlando', 'FL', '32803',
  28.5788, -81.3512,
  '(407) 270-1883', 'https://redlightredlightbeerparlour.com',
  '{"mon":{"open":"16:00","close":"02:00","closed":false},"tue":{"open":"16:00","close":"02:00","closed":false},"wed":{"open":"16:00","close":"02:00","closed":false},"thu":{"open":"16:00","close":"02:00","closed":false},"fri":{"open":"15:00","close":"02:00","closed":false},"sat":{"open":"14:00","close":"02:00","closed":false},"sun":{"open":"14:00","close":"00:00","closed":false}}',
  false, false, false, false, true, false, false, true, false,
  true
),

-- 12. Brew Theory
(
  'Brew Theory',
  'brew-theory',
  'Altamonte Springs'' premier craft brewery, Brew Theory takes a scientific approach to flavour experimentation. Their rotating seasonal taps and science-lab aesthetic make every visit feel like a discovery. Spacious taproom with plenty of board games.',
  '301 E Altamonte Dr', 'Altamonte Springs', 'FL', '32701',
  28.6612, -81.3658,
  '(407) 636-7710', 'https://brewtheory.com',
  '{"mon":{"open":"00:00","close":"00:00","closed":true},"tue":{"open":"15:00","close":"22:00","closed":false},"wed":{"open":"15:00","close":"22:00","closed":false},"thu":{"open":"15:00","close":"22:00","closed":false},"fri":{"open":"14:00","close":"23:00","closed":false},"sat":{"open":"12:00","close":"23:00","closed":false},"sun":{"open":"12:00","close":"21:00","closed":false}}',
  true, true, false, true, true, true, false, false, true,
  true
)

on conflict (slug) do nothing;


-- ─── EVENTS ───────────────────────────────────────────────────
-- Link events to breweries by their known slugs

insert into events (
  brewery_id, title, description,
  start_at, end_at,
  is_recurring, recurrence_rule,
  is_active
)
select
  b.id,
  'Trivia Night',
  'Test your knowledge every Thursday night. Teams of up to 6, prizes for the top 3. Free to play — just show up!',
  now()::date + interval '1 day' + time '19:00',
  now()::date + interval '1 day' + time '21:30',
  true, 'FREQ=WEEKLY;BYDAY=TH',
  true
from breweries b where b.slug = 'cigar-city-brewing'
and not exists (
  select 1 from events e where e.brewery_id = b.id and e.title = 'Trivia Night'
);

insert into events (
  brewery_id, title, description,
  start_at, end_at,
  is_recurring, recurrence_rule,
  is_active
)
select
  b.id,
  'Live Music — Weekend Sessions',
  'Local artists perform every Friday and Saturday evening. No cover charge. Check our social media for the weekly lineup.',
  now()::date + interval '5 day' + time '18:00',
  now()::date + interval '5 day' + time '21:00',
  true, 'FREQ=WEEKLY;BYDAY=FR,SA',
  true
from breweries b where b.slug = 'persimmon-hollow-brewing'
and not exists (
  select 1 from events e where e.brewery_id = b.id and e.title = 'Live Music — Weekend Sessions'
);

insert into events (
  brewery_id, title, description,
  start_at, end_at,
  is_recurring, recurrence_rule,
  is_active
)
select
  b.id,
  'Food Truck Friday',
  'A different rotating cast of Central Florida''s best food trucks every Friday. Arrive early — spots fill up fast!',
  now()::date + interval '4 day' + time '17:00',
  now()::date + interval '4 day' + time '21:00',
  true, 'FREQ=WEEKLY;BYDAY=FR',
  true
from breweries b where b.slug = 'hourglass-brewery'
and not exists (
  select 1 from events e where e.brewery_id = b.id and e.title = 'Food Truck Friday'
);

insert into events (
  brewery_id, title, description,
  start_at, end_at,
  is_recurring, recurrence_rule,
  is_active
)
select
  b.id,
  'Sunday Funday Market',
  'Local artisan market every Sunday on the patio. Shop handmade goods, enjoy live acoustic music, and sip something cold.',
  now()::date + interval '6 day' + time '11:00',
  now()::date + interval '6 day' + time '16:00',
  true, 'FREQ=WEEKLY;BYDAY=SU',
  true
from breweries b where b.slug = '3-daughters-brewing'
and not exists (
  select 1 from events e where e.brewery_id = b.id and e.title = 'Sunday Funday Market'
);

insert into events (
  brewery_id, title, description,
  start_at, end_at,
  is_recurring, recurrence_rule,
  is_active
)
select
  b.id,
  'Tap Takeover — New Release Night',
  'Monthly new release showcase. Come try our latest small-batch experiments before they hit the main rotation. Limited pours available.',
  date_trunc('month', now()) + interval '3 weeks' + interval '5 days' + time '18:00',
  date_trunc('month', now()) + interval '3 weeks' + interval '5 days' + time '22:00',
  true, 'FREQ=MONTHLY;BYDAY=4SA',
  true
from breweries b where b.slug = 'brew-theory'
and not exists (
  select 1 from events e where e.brewery_id = b.id and e.title = 'Tap Takeover — New Release Night'
);

insert into events (
  brewery_id, title, description,
  start_at, end_at,
  is_recurring, recurrence_rule,
  is_active
)
select
  b.id,
  'Yoga on the Patio',
  'Saturday morning flow session on our covered patio. $10 per person, includes a pint of your choice. Bring your own mat.',
  now()::date + interval '6 day' + time '09:00',
  now()::date + interval '6 day' + time '10:30',
  true, 'FREQ=WEEKLY;BYDAY=SA',
  true
from breweries b where b.slug = 'crooked-can-brewing'
and not exists (
  select 1 from events e where e.brewery_id = b.id and e.title = 'Yoga on the Patio'
);


-- ─── VERIFY ───────────────────────────────────────────────────

select
  b.name,
  b.city,
  count(e.id) as event_count
from breweries b
left join events e on e.brewery_id = b.id and e.is_active = true
group by b.id, b.name, b.city
order by b.city, b.name;
