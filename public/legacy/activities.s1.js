
const classifiedZanzibarActivities = {
  "Culture, Heritage & Wildlife": [
    { name: "Baraka Aquarium", location: "Nungwi", duration: "2 Hours", coordinates: { lat: -5.7250, lng: 39.2982 }, visualPrompt: "Vibrant crystal-clear natural lagoon cave in Nungwi filled with beautiful green sea turtles swimming around visitors.", prices: { single: 20, double: 20, triple: 20, group: 15 } },
    { name: "Cheetah's Rock Great Wildlife Tour", location: "Chuini", duration: "4 Hours", coordinates: { lat: -6.0712, lng: 39.2134 }, visualPrompt: "An ethical luxury wildlife sanctuary in Chuini, featuring close-up interactions with cheetahs and white lions under golden sunlight.", prices: { single: 160, double: 160, triple: 160, group: 160 } },
    { name: "Cheetah's Rock VIP Otter Experience", location: "Chuini", duration: "2 Hours", coordinates: { lat: -6.0712, lng: 39.2134 }, visualPrompt: "Premium private pool setting at Chuini wildlife sanctuary with playful otters swimming in clear turquoise water.", prices: { single: 150, double: 150, triple: 150, group: 150 } },
    { name: "Cheetah's Rock VIP Otter Experience + Great Wildlife Tour", location: "Chuini", duration: "6 Hours", coordinates: { lat: -6.0712, lng: 39.2134 }, visualPrompt: "All-inclusive premium luxury safari day-experience at Chuini showing rescue animals, exotic birds, and tropical greenery.", prices: { single: 280, double: 280, triple: 280, group: 280 } },
    { name: "Jozani Forest Tour", location: "Jozani", duration: "2 Hours", coordinates: { lat: -6.2625, lng: 39.4206 }, visualPrompt: "Lush, sun-dappled tropical mahogany jungle canopy at Jozani with rare Red Colobus Monkeys jumping across green branches.", prices: { single: 30, double: 25, triple: 25, group: 20 } },
    { name: "Spice Tour", location: "Kijichi (Kizimbani)", duration: "2 Hours", coordinates: { lat: -6.1104, lng: 39.2324 }, visualPrompt: "Sunlit aromatic spice farm plantation in Kijichi displaying fresh green vanilla pods, cinnamon bark, and vibrant red cloves.", prices: { single: 30, double: 25, triple: 20, group: 15 } },
    { name: "Spice Tour + Cooking Class", location: "Kijichi (Kizimbani)", duration: "4 Hours", coordinates: { lat: -6.1104, lng: 39.2324 }, visualPrompt: "An outdoor rustic tropical kitchen venue surrounded by palm trees with fresh Zanzibar ingredients and colourful local spices.", prices: { single: 45, double: 40, triple: 35, group: 30 } },
    { name: "Stone Town Tour", location: "Stone Town", duration: "2 Hours", coordinates: { lat: -6.1659, lng: 39.1895 }, visualPrompt: "Historic ancient architecture of Stone Town featuring beautiful intricately carved wooden doors and coral stone narrow alleys.", prices: { single: 30, double: 25, triple: 20, group: 20 } },
    { name: "Swahili Culinary Workshop", location: "Kijichi (Kizimbani)", duration: "3 Hours", coordinates: { lat: -6.1104, lng: 39.2324 }, visualPrompt: "Authentic Swahili masterclass setup with traditional clay pots, fresh coconuts, and exotic seafood preparations.", prices: { single: 40, double: 35, triple: 30, group: 25 } },
    { name: "The Prison Island Changuu", location: "Stone Town / Off-Coast", duration: "3 Hours", coordinates: { lat: -6.1264, lng: 39.1661 }, visualPrompt: "Changuu Prison Island turquoise coastal waters featuring giant Aldabra tortoises roaming freely around historical stone ruins.", prices: { single: 80, double: 70, triple: 60, group: 50 } }
  ],
  "Ocean Sandbanks & Marine Safaris": [
    { name: "Blue Lagoon Star Fish Snorkelling", location: "Pongwe", duration: "3 Hours", coordinates: { lat: -6.0461, lng: 39.4293 }, visualPrompt: "Shallow, perfectly translucent crystal clear blue water lagoon in Pongwe over a sandy floor filled with bright red starfish.", prices: { single: 70, double: 60, triple: 50, group: 40 } },
    { name: "Mnemba Island Dolphin Discovery", location: "Matemwe / Mnemba Atoll", duration: "4 Hours", coordinates: { lat: -5.7869, lng: 39.3813 }, visualPrompt: "Breathtaking bright turquoise ocean waters near Mnemba Atoll reef with wild bottlenose dolphins jumping alongside a boat.", prices: { single: 70, double: 60, triple: 50, group: 40 } },
    { name: "Nakupenda Sandbank", location: "Stone Town / Off-Coast", duration: "4 Hours", coordinates: { lat: -6.1601, lng: 39.1502 }, visualPrompt: "A stunning isolated brilliant white sandbank island surrounded completely by dynamic shades of blue and turquoise Indian Ocean waters.", prices: { single: 80, double: 60, triple: 50, group: 40 } },
    { name: "Safari Blue (Private)", location: "Fumba / Menai Bay", duration: "6 Hours", coordinates: { lat: -6.3197, lng: 39.2828 }, visualPrompt: "A high-end luxury private wooden dhow sailing through Menai Bay marine conservation area, complete with a gourmet lobster lunch set up on a sandbank.", prices: { single: 450, double: 250, triple: 200, group: 150 } },
    { name: "Safari Blue (Sharing)", location: "Fumba / Menai Bay", duration: "6 Hours", coordinates: { lat: -6.3197, lng: 39.2828 }, visualPrompt: "Exciting ocean eco-adventure boat cruise group exploring mangrove lagoons, natural coral reefs, and swimming spots in Fumba.", prices: { single: 60, double: 60, triple: 60, group: 50 } },
    { name: "Sunset Cruise (Private)", location: "Stone Town", duration: "2 Hours", coordinates: { lat: -6.1659, lng: 39.1895 }, visualPrompt: "Exclusive private luxury dhow yacht sailing away from Stone Town into a magnificent crimson, gold, and purple African ocean sunset.", prices: { single: 250, double: 200, triple: 150, group: 120 } },
    { name: "Sunset Cruise (Sharing)", location: "Stone Town", duration: "2 Hours", coordinates: { lat: -6.1659, lng: 39.1895 }, visualPrompt: "Fun, atmospheric twilight boat party on the Indian Ocean with tropical drinks, live music, and beautiful golden hour skylines.", prices: { single: 40, double: 30, triple: 30, group: 30 } }
  ],
  "Mystical Caves & Horse Riding Adventures": [
    { name: "East Coast Horse Riding", location: "Michamvi", duration: "30 Mins", coordinates: { lat: -6.1436, lng: 39.4891 }, visualPrompt: "Majestic white horses trotting gracefully through shallow white-sand ocean waters along the scenic coastline of Michamvi.", prices: { single: 70, double: 70, triple: 70, group: 70 } },
    { name: "Maalum Natural Cave", location: "Paje", duration: "2 Hours", coordinates: { lat: -6.2662, lng: 39.5516 }, visualPrompt: "Stunning hidden eco-sanctuary cave in Paje featuring an emerald green natural swimming pool surrounded by ancient limestone formations.", prices: { single: 20, double: 20, triple: 20, group: 20 } },
    { name: "North Coast Beach Horse Riding", location: "Nungwi", duration: "30 Mins", coordinates: { lat: -5.7250, lng: 39.2982 }, visualPrompt: "Stunning beachfront horseback riding experience on the powdery shores of Nungwi beach under brilliant clear afternoon skies.", prices: { single: 70, double: 70, triple: 70, group: 70 } },
    { name: "Salaam Cave", location: "Kizimkazi", duration: "2 Hours", coordinates: { lat: -6.4589, lng: 39.4633 }, visualPrompt: "Enchanting crystal-clear underground natural water cave tucked into the tropical jungle surroundings of Kizimkazi.", prices: { single: 20, double: 20, triple: 20, group: 20 } }
  ],
  "Adrenaline & Active Water Sports": [
    { name: "Jetski Rental", location: "Stone Town", duration: "30 Mins", coordinates: { lat: -6.1659, lng: 39.1895 }, visualPrompt: "Fast-paced premium modern jet ski speeding over turquoise ocean waters leaving a dramatic white water wake.", prices: { single: 50, double: 40, triple: 40, group: 40 } },
    { name: "Kayak Rentals", location: "Flexible / Island Wide", duration: "20 Mins", coordinates: { lat: -6.1630, lng: 39.2000 }, visualPrompt: "Sleek glass-bottom clear transparent kayak floating seamlessly over vibrant shallow coral reefs.", prices: { single: 30, double: 50, triple: 30, group: null } },
    { name: "Kite Surfing", location: "Flexible / Paje Beach", duration: "Per Hour", coordinates: { lat: -6.2662, lng: 39.5516 }, visualPrompt: "A dynamic kite surfer catching serious air and gliding smoothly above the world-famous flat turquoise lagoons of Paje.", prices: { single: 70, double: 70, triple: 70, group: 70 } },
    { name: "Parasailing Experience", location: "Flexible / Northern Coast", duration: "10 Mins", coordinates: { lat: -5.7250, lng: 39.2982 }, visualPrompt: "An exciting parasail canopy high in the sky offering an expansive bird's-eye aerial view over Zanzibar's multi-toned blue reefs.", prices: { single: 120, double: 140, triple: null, group: null } },
    { name: "Scuba Diver Course (3 Days)", location: "Flexible / Marine Parks", duration: "3 Days", coordinates: { lat: -5.7869, lng: 39.3813 }, visualPrompt: "Professional scuba diving instruction setup in warm, beautiful turquoise tropical resort pool training grounds.", prices: { single: 430, double: 430, triple: 430, group: 430 } },
    { name: "Scuba Diver PADI Open Water Course", location: "Flexible / Open Ocean", duration: "4 Days", coordinates: { lat: -5.7869, lng: 39.3813 }, visualPrompt: "Divers deep underwater exploring massive stunning coral walls and schools of colorful tropical fish with PADI instructor.", prices: { single: 600, double: 600, triple: 600, group: 600 } },
    { name: "Scuba Diving Beginner (2 Dives)", location: "Flexible / Shallow Reefs", duration: "3 Hours", coordinates: { lat: -5.7869, lng: 39.3813 }, visualPrompt: "First-time diving experience swimming alongside exotic sea turtles in crystal-clear, shallow coral reef gardens.", prices: { single: 120, double: 120, triple: 120, group: 120 } },
    { name: "Sky Diving", location: "Nungwi Dropzone", duration: "3 Hours", coordinates: { lat: -5.7210, lng: 39.2920 }, visualPrompt: "High-adrenaline tandem skydiving flight open parachute overlooking the entire breathtaking coastline and turquoise outlines of northern Zanzibar.", prices: { single: 450, double: 450, triple: 450, group: 450 } },
    { name: "Sport Fishing (4 Hours)", location: "Flexible / Deep Sea", duration: "4 Hours", coordinates: { lat: -5.7000, lng: 39.4000 }, visualPrompt: "High-end deep-sea sportfishing yacht rigging professional lines out on the deep blue waters of the Zanzibar channel.", prices: { single: 500, double: 250, triple: 200, group: 150 } },
    { name: "Sport Fishing (7 Hours Deep Sea)", location: "Flexible / Deep Sea", duration: "7 Hours", coordinates: { lat: -5.7000, lng: 39.4000 }, visualPrompt: "Ultimate big game fishing trophy action out at sea catching large marlin or yellowfin tuna on a sleek customized fishing vessel.", prices: { single: 600, double: 400, triple: 250, group: 200 } },
    { name: "Zanzibar Quadbike Adventure", location: "Kiwengwa / Jambiani", duration: "3 Hours", coordinates: { lat: -5.9872, lng: 39.3621 }, visualPrompt: "Powerful modern quad bikes driving off-road through rugged tropical dirt paths, local villages, and scenic palm groves.", prices: { single: 150, double: 140, triple: 130, group: 130 } }
  ],
  "Media Production & Add-ons": [
    { name: "Drone Photography & Video", location: "Flexible / Customer Request", duration: "Flexible", coordinates: { lat: -6.1630, lng: 39.2000 }, visualPrompt: "High-tech professional quadcopter drone flying over an ultra-clear beach capturing beautiful high-angle vacation memories.", prices: { single: 50, double: 100, triple: null, group: null } }
  ],
  "Getting Around Stone Town": [
    { name: "Rent a Car (Stone Town)", location: "Stone Town", duration: "Per Day", coordinates: { lat: -6.1659, lng: 39.1895 }, visualPrompt: "A clean modern compact rental car parked on a coral-stone Stone Town street, ready to roam the spice island at your own pace.", prices: { single: 45, double: 45, triple: 45, group: 40 } },
    { name: "Scooter & Tuk-Tuk Hire (Stone Town)", location: "Stone Town", duration: "Per Day", coordinates: { lat: -6.1659, lng: 39.1895 }, visualPrompt: "A colourful tuk-tuk and scooter by Forodhani Gardens — the easy local way to weave through Stone Town's narrow lanes.", prices: { single: 25, double: 25, triple: 25, group: 20 } }
  ]
};

(function(){
  "use strict";
  var WA = '255764317595';
  document.getElementById('year').textContent = new Date().getFullYear();

  // ----- activity images -----
  var PX='https://images.pexels.com/photos/', FP='https://commons.wikimedia.org/wiki/Special:FilePath/';
  function px(id){ return PX+id+'/pexels-photo-'+id+'.jpeg?auto=compress&cs=tinysrgb&w=700'; }
  function wm(f){ return FP+f+'?width=700'; }
  var IMG = {
    "Baraka Aquarium": px('5349869'),
    "Cheetah's Rock Great Wildlife Tour": px('789580'),
    "Cheetah's Rock VIP Otter Experience": px('789580'),
    "Cheetah's Rock VIP Otter Experience + Great Wildlife Tour": px('789580'),
    "Jozani Forest Tour": wm('Zanzibar_Red_Colobus_at_Jozani_Chwaka_Bay_National_Park%2C_Kusini_DC%2C_South_Zanzibar%2C_Tanzania.jpg'),
    "Spice Tour": wm('Forodhani_park_food_stand.jpg'),
    "Spice Tour + Cooking Class": wm('Forodhani_park_food_stand.jpg'),
    "Stone Town Tour": wm('Old_Fort_of_Zanzibar.jpg'),
    "Swahili Culinary Workshop": wm('Forodhani_park_food_stand.jpg'),
    "The Prison Island Changuu": px('5349869'),
    "Blue Lagoon Star Fish Snorkelling": wm('Beach_at_Matemwe.jpg'),
    "Mnemba Island Dolphin Discovery": wm('Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg'),
    "Nakupenda Sandbank": wm('Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg'),
    "Safari Blue (Private)": px('4784477'),
    "Safari Blue (Sharing)": px('4784477'),
    "Sunset Cruise (Private)": wm('Sunset_with_palm_trees_%2830737629082%29.jpg'),
    "Sunset Cruise (Sharing)": wm('Sunset_with_palm_trees_%2830737629082%29.jpg'),
    "East Coast Horse Riding": px('19721381'),
    "Maalum Natural Cave": wm('PAJE%2C_Zanzibar.jpg'),
    "North Coast Beach Horse Riding": px('19721381'),
    "Salaam Cave": wm('PAJE%2C_Zanzibar.jpg'),
    "Jetski Rental": px('1430675'),
    "Kayak Rentals": px('6877753'),
    "Kite Surfing": px('1599915'),
    "Parasailing Experience": px('1599915'),
    "Scuba Diver Course (3 Days)": px('1540108'),
    "Scuba Diver PADI Open Water Course": px('1540108'),
    "Scuba Diving Beginner (2 Dives)": px('1540108'),
    "Sky Diving": wm('Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg'),
    "Sport Fishing (4 Hours)": px('4784477'),
    "Sport Fishing (7 Hours Deep Sea)": px('4784477'),
    "Zanzibar Quadbike Adventure": wm('Sunset_with_palm_trees_%2830737629082%29.jpg'),
    "Drone Photography & Video": wm('Zanzibar-Mnemba-Island-aerial-view_%282%29-Website-1920x1080-fill-gravity%3Dauto-Q_Auto%3DBest.jpg'),
    "Rent a Car (Stone Town)": wm('Old_Fort_of_Zanzibar.jpg'),
    "Scooter & Tuk-Tuk Hire (Stone Town)": wm('Forodhani_park_food_stand.jpg')
  };

  // ----- live weather (Open-Meteo, no API key) -----
  function wxDir(d){ return ['N','NE','E','SE','S','SW','W','NW'][Math.round(d/45)%8]; }
  function wxCode(c){
    if(c===0) return 'Clear sky';
    if(c<=2) return 'Mostly sunny';
    if(c===3) return 'Overcast';
    if(c<=48) return 'Foggy';
    if(c<=67) return 'Light rain';
    if(c<=77) return 'Wintry';
    if(c<=82) return 'Showers';
    return 'Thunderstorm';
  }
  fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.165&longitude=39.20&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh&timezone=auto')
    .then(function(r){ return r.json(); })
    .then(function(d){
      var c = d && d.current; if(!c) throw 0;
      var w = wxCode(c.weather_code);
      document.getElementById('wx').innerHTML =
        '<span class="text-white font-medium text-base">' + Math.round(c.temperature_2m) + '°C</span>' +
        '<span>' + w + '</span>' +
        '<span>Wind ' + Math.round(c.wind_speed_10m) + ' km/h ' + wxDir(c.wind_direction_10m) + '</span>' +
        '<span>Humidity ' + Math.round(c.relative_humidity_2m) + '%</span>' +
        '<span>Feels like ' + Math.round(c.apparent_temperature) + '°C</span>';
    })
    .catch(function(){ document.getElementById('wx').innerHTML = '<span class="text-white/55">Live weather unavailable right now — check back when you\'re online.</span>'; });

  var META = {
    "Culture, Heritage & Wildlife":            { short:"Culture & Wildlife", grad:"linear-gradient(135deg,#0A2540,#1E70B0)" },
    "Ocean Sandbanks & Marine Safaris":        { short:"Marine Safaris",     grad:"linear-gradient(135deg,#143A61,#2A86C9)" },
    "Mystical Caves & Horse Riding Adventures":{ short:"Caves & Horses",     grad:"linear-gradient(135deg,#0A2540,#2790C4)" },
    "Adrenaline & Active Water Sports":        { short:"Adrenaline",         grad:"linear-gradient(135deg,#143A61,#1E70B0)" },
    "Media Production & Add-ons":              { short:"Media & Add-ons",    grad:"linear-gradient(135deg,#0A2540,#F2854A)" },
    "Getting Around Stone Town":               { short:"Roam Stone Town",    grad:"linear-gradient(135deg,#143A61,#1E70B0)" }
  };

  // flatten
  var ALL = [];
  Object.keys(classifiedZanzibarActivities).forEach(function(cat){
    classifiedZanzibarActivities[cat].forEach(function(a){ ALL.push(Object.assign({ category:cat }, a)); });
  });

  // ----- CMS overrides: admin dashboard writes to localStorage (same origin) so edits show instantly -----
  try {
    var EZ_OV = JSON.parse(localStorage.getItem('ez_activities') || '{}');
    ALL.forEach(function(a){
      var o = EZ_OV[a.name]; if(!o) return;
      if(o.location) a.location = o.location;
      if(o.duration) a.duration = o.duration;
      if(o.visualPrompt) a.visualPrompt = o.visualPrompt;
      if(o.image) IMG[a.name] = o.image;
      if(o.prices) a.prices = o.prices;
    });
  } catch(e){}

  function fromPrice(p){
    var v = [p.single,p.double,p.triple,p.group].filter(function(x){ return typeof x === 'number'; });
    return v.length ? Math.min.apply(null, v) : null;
  }

  // filter pills
  var cats = Object.keys(classifiedZanzibarActivities);
  var pillWrap = document.getElementById('filterPills');
  var activeCat = 'all';
  function makePill(label, val){
    var b = document.createElement('button');
    b.className = 'pill text-sm px-4 py-1.5 rounded-full' + (val==='all' ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', function(){ activeCat = val; document.querySelectorAll('.pill').forEach(function(p){ p.classList.remove('active'); }); b.classList.add('active'); render(); });
    pillWrap.appendChild(b);
  }
  makePill('All (' + ALL.length + ')', 'all');
  cats.forEach(function(c){ makePill(META[c].short, c); });

  var grid = document.getElementById('grid');
  var searchBox = document.getElementById('searchBox');
  var emptyMsg = document.getElementById('empty');
  var countLabel = document.getElementById('countLabel');

  function render(){
    var q = (searchBox.value || '').trim().toLowerCase();
    var items = ALL.filter(function(a){
      var okCat = activeCat === 'all' || a.category === activeCat;
      var okQ = !q || (a.name + ' ' + a.location + ' ' + a.category).toLowerCase().indexOf(q) > -1;
      return okCat && okQ;
    });
    countLabel.textContent = items.length + ' experience' + (items.length===1?'':'s');
    emptyMsg.classList.toggle('hidden', items.length > 0);
    grid.innerHTML = items.map(function(a){
      var m = META[a.category];
      var fp = fromPrice(a.prices);
      var price = fp === null ? 'On request' : 'from $' + fp;
      var maps = 'https://www.google.com/maps?q=' + a.coordinates.lat + ',' + a.coordinates.lng;
      var idx = ALL.indexOf(a);
      return '<article class="bg-white rounded-2xl overflow-hidden shadow-lg shadow-ocean/10 border border-ocean/5 flex flex-col">'
        + '<div class="h-40 relative" style="background-image:linear-gradient(180deg,rgba(10,37,64,.12),rgba(10,37,64,.6)),url(\'' + (IMG[a.name] || '') + '\');background-size:cover;background-position:center;background-color:#0A2540;">'
        + '</div>'
        + '<div class="p-5 flex flex-col flex-1">'
        + '<span class="text-[11px] tracking-wide uppercase font-medium text-teal mb-1">'+m.short+'</span>'
        + '<h3 class="font-serif text-lg leading-tight">'+a.name+'</h3>'
        + '<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ocean/60 mt-2">'
        + '<span>'+a.location+'</span><span aria-hidden="true">·</span><span>'+a.duration+'</span></div>'
        + '<p class="text-sm text-ocean/70 font-light mt-3 clamp3 flex-1">'+a.visualPrompt+'</p>'
        + '<div class="flex items-center justify-between mt-4 pt-3 border-t border-ocean/10">'
        + '<span class="font-serif text-lg text-ocean">'+price+'<span class="text-xs text-ocean/50 font-sans"> / person</span></span>'
        + '<a href="'+maps+'" target="_blank" rel="noopener" class="text-xs text-teal hover:underline">Map ↗</a></div>'
        + '<button onclick="openBooking('+idx+')" class="mt-4 w-full py-2.5 rounded-full bg-teal hover:bg-tealb text-white text-sm font-medium transition">Book Experience →</button>'
        + '</div></article>';
    }).join('');
  }

  // ---- Dynamic PAX calculator + persistence-intercept checkout ----
  var bkIdx = -1, bkPax = 1;
  function rateForPax(p, pax){
    var tier = pax<=1?'single':pax===2?'double':pax===3?'triple':'group';
    var chain = { single:['single'], double:['double','single'], triple:['triple','double','single'], group:['group','triple','double','single'] };
    var seq = chain[tier]; for(var i=0;i<seq.length;i++){ if(typeof p[seq[i]]==='number') return p[seq[i]]; } return null;
  }
  function tierLabel(pax){ return pax<=1?'single rate':pax===2?'double rate':pax===3?'triple rate':'group rate'; }
  function updatePax(){
    var a = ALL[bkIdx]; if(!a) return;
    document.getElementById('bk-pax').textContent = bkPax;
    var rate = rateForPax(a.prices, bkPax);
    if(rate===null){ document.getElementById('bk-rate').textContent='price on request'; document.getElementById('bk-total').textContent='On request'; }
    else { document.getElementById('bk-rate').textContent='$'+rate+' / person · '+tierLabel(bkPax); document.getElementById('bk-total').textContent='$'+(rate*bkPax); }
  }
  window.paxStep = function(d){ bkPax = Math.max(1, Math.min(40, bkPax + d)); updatePax(); };
  window.openBooking = function(i){
    bkIdx=i; bkPax=1; var a=ALL[i]; if(!a) return;
    document.getElementById('bk-cat').textContent = META[a.category] ? META[a.category].short : '';
    document.getElementById('bk-name').textContent = a.name;
    document.getElementById('bk-meta').textContent = a.location + ' · ' + a.duration;
    var tv=document.getElementById('bk-traveler'); tv.value=''; tv.style.borderColor='';
    var dt=document.getElementById('bk-date'); dt.value=''; dt.style.borderColor=''; dt.min=new Date().toISOString().slice(0,10);
    var ph=document.getElementById('bk-phone'); ph.value=''; ph.style.borderColor='';
    updatePax();
    var m=document.getElementById('bkModal'); m.classList.remove('hidden'); m.classList.add('flex');
  };
  window.closeBooking = function(){ var m=document.getElementById('bkModal'); m.classList.add('hidden'); m.classList.remove('flex'); };
  window.confirmBooking = function(){
    var a = ALL[bkIdx]; if(!a) return;
    var name=(document.getElementById('bk-traveler').value||'').trim();
    var date=(document.getElementById('bk-date').value||'').trim();
    var phone=(document.getElementById('bk-phone').value||'').trim();
    function bad(id){ var el=document.getElementById(id); el.style.borderColor='#f25a5a'; el.focus(); }
    if(!name){ bad('bk-traveler'); return; }
    if(!date){ bad('bk-date'); return; }
    if(phone.replace(/[^0-9]/g,'').length < 8){ bad('bk-phone'); alert('Please enter a valid phone number with country code (e.g. +255…).'); return; }
    var rate=rateForPax(a.prices, bkPax), total=(rate===null)?null:rate*bkPax;
    var rec={ name:name, contact:phone, date:date, activity:a.name, pax:bkPax, assets:'Activity: '+a.name+' × '+bkPax+' pax', total:total, type:'Activity' };
    // STEP 1 — commit the comprehensive reservation to the admin-only reservations table/ledger FIRST
    var saved=false;
    try{ if(window.EZ && window.EZ_READY){ ((EZ.reservations ? EZ.reservations.create(rec) : EZ.bookings.create(rec))).catch(function(e){console.error(e);}); } var _bk=JSON.parse(localStorage.getItem('ez_bookings')||'[]'); _bk.push(Object.assign({ id:'EZ-'+Math.random().toString(36).slice(2,8).toUpperCase(), status:'Pending WhatsApp Escrow Verification', createdAt:Date.now() }, rec)); localStorage.setItem('ez_bookings',JSON.stringify(_bk)); saved=true; }catch(e){ console.error(e); }
    if(!saved){ alert('We could not save your reservation — please try again.'); return; }
    // STEP 2 — ONLY after a confirmed save, route to the concierge with a registration confirmation
    var L = [
      '*EVERYTHING ZANZIBAR — RESERVATION CONFIRMATION*',
      '━━━━━━━━━━━━━━━',
      '*Experience:* '+a.name,
      '*Location:* '+a.location+'  ·  '+a.duration,
      '*Guest:* '+name,
      '*Phone:* '+phone,
      '*Date:* '+date,
      '*Participants:* '+bkPax+' pax',
      (total===null ? '*Total:* On request' : '*Total due:* $'+total+'   ('+(rate?'$'+rate+'/person · '+tierLabel(bkPax):'')+')'),
      '━━━━━━━━━━━━━━━',
      'Please confirm this reservation and share payment details to lock it in.'
    ];
    closeBooking();
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(L.join('\n')), '_blank', 'noopener');
    var t=document.getElementById('toast'); if(t){ t.classList.remove('hidden'); setTimeout(function(){ t.classList.add('hidden'); }, 3000); }
  };

  searchBox.addEventListener('input', render);
  // LIVE two-way binding: re-sync prices/text/images instantly when a Manager/Admin edits a tour in the dashboard (another tab).
  window.addEventListener('storage', function(ev){ if(ev.key==='ez_activities'){ try{ var ov=JSON.parse(localStorage.getItem('ez_activities')||'{}'); ALL.forEach(function(a){ var o=ov[a.name]; if(o){ if(o.location)a.location=o.location; if(o.duration)a.duration=o.duration; if(o.visualPrompt)a.visualPrompt=o.visualPrompt; if(o.image)IMG[a.name]=o.image; if(o.prices)a.prices=o.prices; } }); render(); }catch(e2){} } });

  // nav bg on scroll
  var nav = document.getElementById('nav');
  function navState(){ nav.classList.toggle('bg-ocean/90', window.scrollY>30); nav.classList.toggle('backdrop-blur-lg', window.scrollY>30); nav.classList.toggle('shadow-lg', window.scrollY>30); }
  window.addEventListener('scroll', navState, {passive:true}); navState();

  /* live catalogue: when the Supabase client is configured, pull prices/text/images
     from the database (for ALL visitors); otherwise render the built-in catalogue. */
  if(window.EZ && window.EZ_READY){
    EZ.activities.list().then(function(rows){
      (rows||[]).forEach(function(o){
        var a = ALL.filter(function(x){ return x.name===o.name; })[0]; if(!a) return;
        if(o.location) a.location=o.location; if(o.duration) a.duration=o.duration;
        if(o.visual_prompt) a.visualPrompt=o.visual_prompt; if(o.image_url) IMG[a.name]=o.image_url;
        a.prices={ single:o.price_single, double:o.price_double, triple:o.price_triple, group:o.price_group };
      });
      render();
    }).catch(function(e){ console.error(e); render(); });
  } else { render(); }
})();
