# Tuhelj Open World — izvorni kod (predaja za novi razgovor)

Web igra u three.js r159 (bez bundlera). Svi moduli iz `src/` spajaju se u JEDAN HTML.

## Gradnja
- Claude/pregledniča verzija: `python3 build.py izlaz.html`
- Netlify verzija + zip: `python3 build_netlify.py` → `dist/tuhelj-3d.zip` (povući u Netlify)
- Provjera sintakse: izvući glavni `<script>` i `node --check`.
- Test snimke (headless Chromium/Playwright): `shot.py` (primjer).

## Moduli (src/)
01_util (matematika, GB geometrija, ChunkSet) · 02_textures (proceduralne teksture) · 03_terrain · 04_roads (ceste, `nearestRoad`)
05_buildings (BLD, BHASH kolizije) · 06_landmarks + 06a_facade + 06b_church + 06c_fire_cafe + 06d_pub (brtija + poker stol) + 06e_apartment (Kod Ruže)
07_veg · 08_props · 09_sky (dan/noć `setTimeOfDay`) · 09b_post (SSAO, ACES, FXAA) · 10_player (kontrole, mobitel dodir) · 11_ui (karte, izbornik)
12_main (glavna petlja) · 13_cars (vožnja, kokpit, formula, T-Roc, kamion) · 14_net (multiplayer: claude room / MQTT / PeerJS, avatari `makeAvatar`)
15_combat (zdravlje, piće, šank) · 16_poker (multiplayer Texas Hold'em) · 17_people (NPC-i, putnici u autu, igralište)
18_weapons (puška, SMG, snajper, bazuka) · 19_life (Kenka/Jovo, Valentina, mještani, požari, vodeni top)
20_gta (novac, misije, policija, hitna, promet, helikopter) · 21_gta2 (zdravlje NPC-a, trgovina iznutra, bicikli, mini-karta)
22_open (HUD, stamina, inventar, mobitel P, spremanje, kiša, zvuk, policijska AI, F3) · 23_humans (realistični ljudi) · 24_models (paketi modela, auti, traktor, puške)

## 3D modeli (23_humans.js + 24_models.js)
- Modeli su u `assets/` (GLB, meshopt komprimirani). `build.py` ih pakira u `models/*.js` (TUHELJ_PACK(...)) pokraj izlaznog HTML-a — radi na Netlifyju i dvoklikom (file://). Bez mape `models/` igra radi s jednostavnim likovima i autima.
- `assets/people/` 19 Microsoft Rocketbox likova (MIT), `assets/anims/anim_m.glb`, `anim_f.glb` Rocketbox mocap (idle, look, walk, stroll, run, drunkwalk, drunk, sitchair, sittable, drink, wave, talk, phone, dance).
- `assets/vehicles/` Quaternius Realistic Car Pack (CC0): NormalCar1 (sedan), NormalCar2 (hatch), SUV (suv, troc), SportsCar (sport, banda), SportsCar2 (sport2), Taxi, Cop (policija, prebojana plavo-bijelo) + Kenney `tractor.glb` (CC0).
- `assets/weapons/` Quaternius Animated FPS Guns (CC0): Rifle (Puška), P90 (SMG), SniperRifle (Snajper); Shotgun i Pistol spremni za nova oružja. Bazuka je i dalje proceduralna.
- `23_humans.js`: `humansTick` daje najbližima (26 na računalu / 12 na mobitelu, do 105/70 m) pravi model; ostali ostaju proceduralni. Uloge: `RB_ROLE` (ime → lik), izgled igrača `SKINS` (mobitel → Postavke → Izgled lika), `OW.realPeople` prekidač u postavkama. Sjedenje: `A.seatT` + `A.pose` ('sit' → sittable, inače sitchair).
- `24_models.js`: `loadModelPack`, `makeQCar` (isti oblik objekta kao `makeCarGroup`, + `roofY`, `seatY`), `appendQCarStatic` (parkirani auti spojeni u velike meshe), `makeTractor`/`placeTractors` (4 traktora, uvijek isti broj zbog multiplayer indeksa DRIVE), `upgradeGuns` (`GUNFIT` pomaci).
- Novi likovi: `tools/model_pipeline/` (dl_rb.py → prep_tex.py → conv.py u headless Chromiumu → repack_glb.py → `npx gltf-transform optimize --compress meshopt --texture-compress false`). Auti: NE koristiti `optimize` (palette briše imena materijala) nego `weld` + `meshopt`.

## Ulazak u zgrade (25_interiors.js)
- Prostorije su odvojene sobe daleko izvan karte (x ≈ -1450…-1270, z = -1450, y = 260), kao interijeri u GTA-u: tipka E / gumb na mobitelu teleportira unutra i natrag.
- Vrata su na stvarnim zgradama s OSM karte: `LANDMARKS.shopDoors` (Trgovina PZ Tuhelj, Strahinjčica — 06_landmarks centreBuilding), `LANDMARKS.fireDoor` (06c, vatrogasni dom), `LANDMARKS.townhallDoor` (06_landmarks townhall). Ispred vrata je zeleni krug.
- `INTS` = popis prostorija {door, room, spawn, spots[{x,z,r,t,fn}], build}; `intUse()` (E), `intPrompt()` (tekst na ekranu i gumbu), `INT_PEOPLE` (osoblje dobiva realistične likove). Stara trgovina PZ (SHOPIN iz 21_gta2) je prva u popisu.
- Strahinjčica: police, hladnjaci, pekarnica, voće i povrće, blagajna (isti izbornik kupnje). DVD: ormarići s opremom, kacige, cijevi, pehari, stol; "Obuci vatrogasnu opremu" mijenja izgled lika. Općina: šalter (ako te traži policija — plati kaznu 50 €), čekaonica, oglasna ploča, zastave HR i EU.
- Spremanje igre unutra sprema položaj ispred vrata.

## Likovi — dorade
- Kenka: `Kenka_Mandura` (Gardener_Male_01 s plavom radnom odjećom, `tools/model_pipeline/recolor_mandura.py`).
- Biciklisti (igrač, drugi igrači, Šemso) su realistični: `bikePose()` u 23_humans.js poza nogu/ruku po fazi pedala (`A.bikePh`).
- Igrač bez odabranog izgleda automatski dobije realističnog lika (po imenu); `OW.skinSet` pamti ručni odabir.
- Animacije: histereza + minimalno 0,4 s po animaciji (nema trzanja), nema T-poze pri pojavljivanju, likovi izvan kadra se ne animiraju; `humansTick` se zove zadnji u petlji (poker više ne prikazuje dvostruka tijela).
- Mobitel: `assets/people_m` (pojednostavljeni likovi ~4,9k trokuta, teksture 256 px, bez normal mapa, 3,5 MB), najviše 10 realističnih do 60 m, sjene samo do 12 m, rjeđe animacije.

## GTA nadogradnja (listopad 2026)
- **26_tps.js — treće lice**: kamera iza desnog ramena (V mijenja treće/prvo lice), sudari kamere sa zidovima (niske ograde se ignoriraju), igračev lik (`ME_AV`) je vidljiv i drži oružje u rukama. `holdGun(A,wi,dir,gun)` postavlja pušku na rame / pištolj u ispružene ruke preko IK-a ruku (`armIK`, kosti Bip01_*), isti kod koriste policajci i Vukovi. Snajper s nišanom prelazi u prvo lice.
- **18_weapons.js — oružje**: dodani Pištolj (4) i Sačmarica (5, 9 sačmi); indeksi 0-3 nepromijenjeni zbog multiplayera. Kotačić miša / 1-6 / GTA traka oružja (`showWeaponWheel`). `ARMORY` = posjedovana oružja (pištolj, puška, SMG od početka; sačmarica, snajper, bazuka kroz priču, `armUnlock`). Prave rakete (`rocketMesh`: tijelo, krilca, plamen, gust trag dima), eksplozije s vatrenom kuglom, svjetlom, udarnim valom, krhotinama i opeklinom na tlu. Meci i rakete oštećuju aute (`damageVehicle`) — auto gori pa eksplodira i ostaje crna olupina (`WRECKS`). Jedno dijeljeno svjetlo `FX.light` (dodavanje svjetala bi rekompajliralo sve shadere).
- **27_law.js — policija i hitna koje se vide**: svaki policijski auto vozi dvojicu policajaca (Police_Male_01). U potjeri auto stane, policajci izađu i trče za tobom: 1 zvjezdica → uhićenje, od 2 → pucaju (pogodak ovisi o udaljenosti i brzini). Pobjegneš li autom, vrate se u auto. Hitna dovozi dva bolničara koji kleknu kraj žrtve, rade masažu srca s kutijom prve pomoći i ožive je. Graf cesta + A* (`roadRoute`, `routeTo`): policija, banda i hitna voze po cestama. Crni Vukovi pješice (`spawnThug`) za misije.
- **28_home.js — stan Kod Ruže**: ormar (odjeća na tvom liku, kamera s prednje strane), krevet (spavanje do jutra/popodne/večeri, sprema igru), tuš (trijeznost), Zagorje TV (vijesti prate priču), „Uredi stan” — namještaj koji ostaje (localStorage `tuhelj_decor`). `gMenu()` je opći izbornik.
- **29_story.js — priča „Povratak u Tuhelj”**: 7 poglavlja (★ na karti i iznad lika), `STORY.ch` u localStorage `tuhelj_story`. Sporedne misije (!) ostaju. Filmske trake tijekom razgovora, putnik Kenka vidljiv u autu, natuknica sljedećeg poglavlja u HUD-u.
- **30_look.js + build.py — početni ekran**: GTA naslov, filmski kadrovi sela, savjeti, napredak po poglavljima, „Nova igra”. **Tvoje slike**: stavi .jpg/.png/.webp u mapu `photos/` — vrte se na početnom ekranu, a prva visi uokvirena u stanu.
- **Ceste** (`gradeRoads` u 04_roads.js): uzdužni profil se izgladi i ograniči nagib, teren se usiječe/nasipa, ceste su ravne poprijeko; `ROADMASK` sprječava da placevi kuća iskrive cestu.
- **09b_post.js**: bloom (sunce, eksplozije, svjetla noću) i GTA V gradiranje boja (mirnija zelena, topla svjetla, hladne sjene).
- Popravak: igra otvorena u skrivenoj kartici imala je crni ekran (aspect NaN) — sad se samo popravi.
- `build.py` čita/piše UTF-8 (radi na Windowsima bez `PYTHONUTF8`), `--dev` dodaje 99_dev.js (`?dev` u adresi: `devStart()`, `CAM()`, `SNAP()`).

## Tuhelj po fotografijama (31_photo.js, 32_voices.js)
- Igračev dom = OSM „Obiteljska kuća Slaviček” (-457,-148), nasuprot crkve. `photoTerrain` spušta dolinu (kuća je bila 28 m previsoko na brdu), `photoLand` pretvara oranice u livadu između kuće i crkve, šljunčani put (`r.gravel`, `TEX.gravel`). Kuća po fotografijama: žuta žbuka, crvene trake, zabat s trokutastim prozorom, nadstrešnica, polukružni balkon s drvenom ogradom, natkrivena terasa; susjedna niska zgrada s crijepom, stup s košem i vinovom lozom, kante, astre, vrbe. Unutrašnjost `kuca` (ormar, krevet, tuš, TV, namještaj); početak i buđenje ispred kuće.
- Popravak: sobe interijera bile su izvan granica karte (igrača je vraćalo) i neke ispod terena — sad `groundAt` unutra koristi pod sobe, a kamera ostaje u sobi (`INT_BOX`).
- `gradeRoads` više ne nasipa dolinu prema brdu. Niža (pokošena) trava, plavije nebo s cirusima i tragovima aviona.
- Titlovi teku sami (E preskače), priča kreće kad priđeš ★, ljudi pozdravljaju i reagiraju (oblačići, govor ako preglednik ima hrvatski glas), policajci viču, vozači i suvozači u autima (prozirna stakla), smrt „UMRO SI” → buđenje doma, mirnija policija.

## Dorade (listopad 2026, 3. krug)
- Hodanje/trčanje: root motion uklonjen iz Rocketbox ciklusa (`REAL.spd` = brzina koraka), IK stopala, čučanj/šuljanje (C), poza pri skoku, bliža kamera.
- Glasovi: nema robotskog TTS-a ni oblačića; sve `bubble()` rečenice su titlovi dolje, a snimke iz `voices/` (vidi voices/PROCITAJ.txt) se puštaju same.
- Minimapa dolje lijevo na računalu, GTA kotačić oružja (kotačić miša / Tab), kamera s haube u autu, prilagodba oka u zgradama.
- Dvorište obiteljske kuće: samo popločano (izmišljena pomoćna zgrada i garaža maknute, bez parkiranih auta), bijela vrata, vidljiva ograda balkona.
- Svjetlo: jače raspršeno (hemi) svjetlo pa sjene nisu crne; bez sivo-crnih krovova i plavih zidova; trgovina = ULTRA.

## Otvoreno
- vatrogasni kamion i hitna su još proceduralni (nema dobrog besplatnog realističnog modela); bazuka proceduralna
- puške u rukama igrača s realističnim izgledom (vezati na kost Bip01_R_Hand)
- boje fasada iz Mapillary fotografija; bolja stabla
- skretanje prometa/policije na raskrižjima (graf cesta)
- unutrašnjost DVD-a i škole

## Runda: centar po Street Viewu (listopad 2026)
- kuća uz crkvu maknuta → asfaltno parkiralište s linijama (PHOTO.churchPark, 33_centre.js)
- oko crkve crveni popločani trg (paveArea + paverTex 'red'), kameni rubnjak
- autobusna stanica na strani brtije, ispred šljunčanog parkirališta istočno od arkade
- dvorište brtije: bijeli zid s crvenim crijepom i kapijom uz cestu, betonsko dvorište, crna mrežasta ograda,
  apartman Kod Ruže premješten u dvorište (bijel, drveni balkon na zabatu), drva, sivo-bijeli T-Roc, putokaz Desinić/Zagreb
- Ultra: vijenci, gornji prozori, viša kuća straga, žuti Ožujsko suncobrani
- živice više nisu crne (tekstura je sad samo svjetlina), NOHEDGE zone drže stanicu/parkirališta/dvorište čistima
- SVI parkirani auti se mogu voziti (wakeParked: statični model se zamijeni pravim autom kad priđeš),
  auti iz prometa i zaustavljena policija/hitna se mogu oteti (carjack)
- kotač oružja: nove detaljne ikone (WDRAW) — Glock, MP5, pumparica, M4, snajper s optikom, RPG-7
- učitavanje radi i u pozadinskoj kartici (yieldFrame s timeoutom)

## Runda: potok, škola, HUD, radio, rasvjeta (listopad 2026)
- Pristavčica (34_creek.js): točno po igračevoj liniji — preko livade, ispod mosta s plavom ogradom kod stanice/workout parka,
  između kuće i duge štale, pa dalje u Horvatsku. Vlastito fino korito (ravno → kosina → voda → kosina → ravno),
  getHeight() prati korito, grubi teren se ispod reže maskom (CREEK.tex), trava se ne crta u koritu, voda teče (animirana normal mapa).
  Mostovi: betonska ploča, krila, plava ograda na svakom prijelazu ceste.
- obiteljska kuća: primaknuta putu (photoMoveHouse), jedan krov u istoj razini, deblji zaobljeni balkon; ispred sivi Golf V i crni Passat
- brtija (cafeFit): zabat na pločniku ceste od sjevera, pročelje uz glavnu cestu; zid/kapija u ravnini zabata; aneks sa staklenom terasom i nadstrešnicom
- trg sa stupom asfaltiran + kamena gredica s cvijećem; parkiralište kod crkve samo na parceli kuće, ne preko popločenja
- škola (38_school.js): stara zgrada uz cestu, bijela krila s crvenim krovovima, sportska dvorana, igralište s mrežama i tribinom;
  parkiralište i vrtić na NIŽOJ razini (schoolTerrain), helikopter na parkiralištu
- GTA HUD (35_hud.js): radar dolje lijevo + zelena/plava traka, novac gore desno, velike zvjezdice samo kad te traže; maknuti Požar, lokacija, tipke, autorska prava u igri
- rasvjeta (36_lights.js): lampe svijetle noću, točkasta svjetla oko kamere, farovi na autu
- radio (37_radio.js): sintetizirane stanice (Radio Kaj, Hit FM Tuhelj, Noćna vožnja, Lounge Krapina), R ili kotačić u autu
- kamera auta bliže (4.7 m), parkirani auti nikad na kolniku

## Runda: dotjerivanje centra (listopad 2026, 2)
- kocke na stupu s košem → jedan stup bršljana (lathe)
- obiteljska kuća paralelna s putem, pročelje ~7 m od puta; drvena garaža desno (PHOTO.garage)
- brtija: zabat paralelan s cestom od sjevera (veća težina WN u cafeFit), zid dvorišta ide uz pločnik (onWall), apartman uz zid
- trg: paveArea sada triangulira obris (ravni rubovi), asfalt do cesta; crvena kuća s bijelim balkonom iza stupa (st 'salmonPlaza')
- potok zaobilazi oranice (kazna u DP), bez kukuruza u koritu, drvored uz potok kroz polja (creekRiparian)
- škola: dvorana okrenuta (zabat s bijelim pločama prema prilaznoj cesti), tribina uz staru zgradu, narančasti stubišni blok

## Runda: mobitel + škola oko igrališta (listopad 2026, 3)
- mobitel (39_mobile.js): automatska kvaliteta (1, slabiji uređaji 0), manje AO uzoraka, 3 točkasta svjetla, HUD za palčeve
  (radar gore desno + trake, novac i zvjezdice gore lijevo), gumb 📻 za radio u autu, zvuk se otključava na dodir (iOS),
  roundRect polyfill za stariji Safari. Provjereno u emulaciji Android Chrome (pejzaž): učitava, HUD, ulazak u auto, radio.
- VAŽNO: shader stringovi u Python editima — koristiti chr(92)+'n', nikad pravi prijelom reda (srušilo bi cijelu skriptu)
- škola: stara zgrada uz zapadnu stranu igrališta, krila na sjeveru, dvorana na istoku — sve oko igrališta
- brtija: pročelje i arkada uz glavnu cestu (cafeFit težine), zid dvorišta sam prati sporednu cestu
- krošnje: blago "svjetlo kroz lišće" (TREEFILL), noću slabi; garaža = otvorena drvena nadstrešnica
- zid dvorišta brtije: stražnji zid brtije produžen ravno do pločnika (PUBYARD.corner), pa zid uz cestu — čisti pravi kut
- drveće: daleke krošnje imaju deblo (nema lebdećih lopti); stabla čija krošnja ulazi u zgradu/garažu se uklanjaju (bigHit)

## Runda: brtija po "38 Tuhelj", ulaz na E, kokpit (listopad 2026, 4)
- vrata zgrada opet na E (doorWalkTick isključen, intPrompt pokazuje "uđi — ime")
- V u autu = pogled iznutra (buildCockpit: volan, ruke, ploča, stupovi, retrovizor) umjesto haube
- most/potok ~12 m dalje od stanice, između "bijele kuće s balkonom" (OSM barn -231,-120) i duge kuće (-239,-100)
- brtija: zabat paralelan sa sporednom cestom na pločniku (cafeFit: WN×3, WS×1.5), zid u ravnini zabata;
  ispred kuće arkada (pubFrontArcade) koja seže do pločnika glavne ceste i prati zavoj
- krošnje svjetlije (TREEFILL 0.36)

## Runda: brtija iz Mapillary 296128785453428 / 924510798093512 (listopad 2026, 5)
- brtija fiksno: rect [-241.35,-54.7,π/2] — duga strana uz cestu sa sjevera, S zabat na raskrižje, aneks s lukovima produžen na istok (local z do -15.6)
- dvorište sjeverno od kuće (photoPubYard, okvir kafića), zid na pločniku, kapija, plava vrtna vrata, apartman [-233.2,-73.2] balkonom na zapad
- kodRuzeRow: duga niska zgrada "Kod Ruže" iza stanice
- parking kod crkve: travnjak između popločenja crkve i Ultre, ulaz s crkvene ceste (traka + kocke + ograda + lampe)

## Runda: mobitel memorija, početni ekran, traktor (listopad 2026, 6)
- iOS Safari "problem se ponovio" = OOM. Mjereno u emulaciji: JS heap 670 MB → 226 MB:
  GB.geometry() oslobađa JS nizove; na touch uređajima ChunkSet meshevi oslobađaju CPU kopiju nakon uploada (onUpload);
  parkirani auti na touchu samo do 340 m od centra (spojeni mesh auta bio je 1,5 M vrhova), na desktopu prorijeđeni dalje od 650 m;
  ground albedo 2048 na touchu, creek maska 1 m/px, iOS kvaliteta 0 (bez posta, PR 1.0)
- početni ekran (42_title.js): stripovski paneli iz photos/, veliki logo, učitavanje, "pritisni tipku", izbornik (priča, kontrole, nova igra, kvaliteta, ime)
- traktor: seatY 0.72, sjedalo i volan u liniji vozača

## Runda: vozila, sudari, noć, dućan, pucanje (listopad 2026, 7)
- 43_vehicles.js: policija = realistična limuzina + livreja POLICIJA + rotirka; hitna = visoki kombi (HITNA POMOĆ 194, kockice);
  vatrogasci = kamion s kabinom za posadu, roletama, ljestvama; helikopter EC135 stil. makeCarGroup('police') / ('van','#f7f7f7') vraćaju nove.
- sudari: vehicleCollide gura i od prometa/policije/hitne (aiCars), carBump: zvuk, promet stane, policija = zvjezdica
- noć: exposure ×(1+0.6·noć), hemi ≥0.3+0.3·noć vani, unutra 1.05 + toplo svjetlo koje prati igrača (NL.room); lampe po svim seoskim cestama (villageLamps)
- dućan (44_shop.js): police s pakiranjima iz atlasa (mlijeko, kruh, kava...), 15 artikala, svaka polica je mjesto za kupnju (E)
- pucanje: krv prema smjeru metka, lokva krvi, pad unazad od pogotka (knock), puška u ramenu u visini oka
- DVD: stepenica ispred ulaza → asfaltna rampa; živice svjetlije; daleke krošnje grudaste (5 blobova)

## Runda: policija, hitna, bijeg ljudi, vatra (listopad 2026, 8)
- policija: 1 auto (1-2★), 2 (3-4★), 3 (5★); dolaze tek nakon 14 s (6 s kod 3★+) s 260 m, jedan po jedan svakih 10 s;
  dok te ne vide samo pretražuju zadnje mjesto (INVESTIGATE → SEARCH); pucaju tek kod 2★ i ako si naoružan (ili 3★+), rjeđe i slabije
- hitna: najviše jedna, dolazi nakon 18-30 s s 240 m
- AI auti se razmiču jedni od drugih i od parkiranih (aiSeparate), promet koči iza drugih
- ljudi: pogođeni i oni u 35 m oko pucnjave bježe trčeći (fleeFrom/fleeStep, spdOv=5.6), nakon bijega se vrate kad su daleko
- vatra (45_fire.js): 70 plamenih čestica, stup crnog dima, iskre, treperavo svjetlo (desktop), čađavi krov

## Runda: pištolj, pločnik, panika, zvuk (listopad 2026, 9)
- pištolj: lijeva ruka obuhvaća dršku (kvaternion desne ruke zrcaljen oko cijevi), ruke ispružene u visini prsa
- pločnici: SWHASH + sidewalkAt() — groundAt uzima visinu pločnika (više se ne propada u nj)
- panika samo na stvarni pucanj (ne na nišanjenje); dealer = Female_Adult_17; sirena tiša, trokutasti zavijajući ton
- laneFlares: šljunčani putovi se na spoju s cestom zaobljeno šire; borovi svjetliji (needleMat ×1.7)
- početni ekran: glazba (Noćna vožnja) od prve tipke/dodira + zvukovi izbornika (uiSnd)

## Runda: početak, brtija, izbornik (listopad 2026, 10)
- stara kartica "Povratak u Zagorje" više ne bljesne: CSS u build.py skriva .card odmah, crni ekran s logom dok 42_title ne preuzme (#start.ttready)
- brtija: zid s drvenom oplatom (lamperijom), krem žbukom i uokvirenim slikama Tuhlja (muralTex); 14 stolova do kraja duge prostorije
- izbornik pauze (46_menu.js): GTA stil — TUHELJ, sat, novac, kartice IGRA/KARTA/POSTAVKE/KONTROLE; postavke: doba dana (0–24), grafika, glasnoća, letenje
- brtija: VRAĆEN izvorni zid s velikim bijelim krugovima (bio je po igračevim slikama — ne mijenjati!); stolovi do kraja ostaju; stup na spoju kuće i duge prostorije zatvara procijep
- ljudi koji hodaju guraju se iz zidova (BHASH.collide samo dok se kreću); policajci ne bježe; policija pucanje rjeđe (cd 2.6–4.2 s), pHit 0.15, najviše 2 auta
- PERFORMANSE: grudaste daleke krošnje (5 blobova detail 1 = 410 tri × ~100k stabala) dizale su kadar na 14,8 M trokuta → 3 bloba detail 0 + deblo s 4 strane; udio dalekih stabala 0.55/0.75/0.85 (mobitel 0.35/0.5/0.6). Mjereno: 47 ms → ~18 ms po kadru u testnom pregledniku.
- brtija: maknuto platno projektora (PUB QUIZ) i stolić s laptopom
- putokazi se nikad ne postavljaju u zgradu: sgInside() ih premjesti na rub ceste (plavi putokaz je bio u brtiji)

## Mobitel (iPhone početni zaslon)
- HUD poštuje safe-area (notch, zaobljeni rubovi): radar, novac, joystick, gumbi, kartica misije kompaktno lijevo.
- Animacija likova blizu kamere svaki frame na dodiru (nema trzanja pri hodu).
- Hardverski antialiasing (MSAA) umjesto post-obrade na mobitelu: glatki rubovi i brže.


## Naslovni zaslon čeka sve modele
- SPREMNO tek kad su učitani ljudi, animacije, auti i oružje (najviše 45 s), plus zagrijavanje shadera; traka ide do 85 % za svijet, ostatak za modele.
- Prvi gumb NOVA PRIČA ▶ žut i pulsira, s uputom 'Dodirni za početak'.


## Učitavanje na klik, glatko okretanje, policija, radio
- Naslovni zaslon odmah pokazuje izbornik; svijet se gradi tek na NOVA PRIČA (mainGo u 12_main.js; ?dev učitava odmah). Kad je sve spremno: 'DODIRNI ZA POČETAK'.
- 47_perf.js: sitni dijelovi (polumjer < 0.6 m) ne bacaju sjenu, sitni (< 0.3 m) daleko od kamere se ne crtaju (layer 1); sjene se crtaju svaki kadar (prije svaki drugi: kadrovi 16/25 ms naizmjence).
- Policijski natpisi i rotacija postavljeni raycastom na pravu karoseriju.
- Radio: zadana stanica Lounge Krapina; nova Zagorje Country.


## Ekrani smrti i uhićenja, policija izlazi iz auta
- 48_wasted.js: UBIJEN / UHIĆEN + pravi uzrok (policija, Crni Vukovi, eksplozija, pad, igrač), 'MISIJA NIJE USPJELA' kao red ispod (bez bannera preko). Uhićenje: 4 s ekran pa postaja.
- 27_law.js: auto staje i policajci izlaze i kad stignu na mjesto prijave (ISTRAGA/TRAŽE TE), pješke pretražuju okolicu; ako te vide → potjera. Nenaoružanom prilaze i uhite ga.
- Kill feed samo za ubojstva od drugih igrača.


## Glazba naslova i glatko brzo okretanje
- Naslovni zaslon svira Lounge Krapina; na NOVA PRIČA se utiša (TTM.stop).
- Kamera iz trećeg lica: dok se pogled brzo okreće ostaje na najkraćoj udaljenosti i polako se vraća (nema pumpanja uz zidove).
- Miš: sirovi unos (unadjustedMovement) i ignoriranje Chromeovih lažnih skokova (>400 px).
- Rezolucija se mijenja tek nakon duljeg pada/rasta brzine i najviše jednom u 12 s.


## Nišan na iPhoneu, misije s oznakama, likovi šetaju
- 12_main.js VW()/VH(): veličina platna iz #view (iPhone početni zaslon javlja staru veličinu) + 47_perf.js pfFit svakih 400 ms: slika uvijek preko cijelog zaslona, sredina točno ispod nišana.
- 50_missions.js: missionWhere() daje cilj i koracima bez mjesta (požar, kamion, auto, Vukovi, općina…); požar bez misije također označen. Duže misije: Gori u selu!, Dostava za Putnika (+ sir s Pristave), Taksi za Martina (čekanje mise, pa doma), Banda Crni Vukovi.
- 49_routines.js: A* po mreži 0.5 m oko BHASH zidova; Kenka i Jovo povremeno izlaze (trgovina, trg, crkva, općina, terasa), Lidija poslužuje po brtiji, Prgac i Tuljulju šetaju zajedno.


## Mobitel: karta, ⚙, krug oružja, nišanjenje palcem
- 51_touch2.js: karta na dodiru s MAP.scale 0.4 (Safari ima budžet memorije za canvas; karta je bila prazna), provjera i ponovna izrada ako je prazna; crveni ✕ na velikoj karti; HUD skriven ispod karte.
- Gornja traka maknuta: ⚙ (Karta, Let, Kamera, Cijeli zaslon, Izbornik), dodir radara otvara kartu, 📱 lijevo, okrugli gumb oružja lijevo od skoka otvara krug za izbor (dodir ili klizanje).
- Gumb za pucanje: drži i kliži palcem — pogled/nišan prati palac.
- 02_textures.js: ?cvlog bilježi veličine canvasa (dev).


## Karta rano na mobitelu, jedna puška, meci na gumbu
- 51_touch2.js: na dodiru karta se crta odmah nakon cesta (buildRoads omot) dok Safari još ima budžeta za canvas; nazivi se crtaju uživo na veliku kartu (bez druge pune slike).
- SMG maknut s igrača (owned/selectWeapon) — ostaje Puška; NPC-ovi i dalje imaju SMG.
- Na mobitelu nema natpisa #ammo; meci su na okruglom gumbu oružja.


## Gumb oružja bez treperenja
- 51_touch2.js: premješteni gumb dobiva id #twpn (stari kod upisuje naziv u #tgun pa je natpis skakao); jedan crtač: ikona + broj metaka, mijenja se samo broj.


## Šake i rezervirana karta
- 52_fists.js: bez oružja lijevi klik / ✊ gumb = udarac (lijeva-desna), udarac u prazno ili u osobu ispred (1.7 m, 22 štete, odbacivanje, 'Au!'), zvuk, poza ruku preko animacije; ponekad zvijezda traženosti.
- 51_touch2.js: platno karte za mobitel rezervira se odmah pri otvaranju stranice (MAP.reserve), prije nego ostalo potroši Safarijev budžet.


## Faza 1: zvuk, šake, novac
- 53_sound.js: motor s 5 brzina (okretaji, 3 sloja + usis, filtar se otvara pri gasu; traktor sporije), škripa guma (bočno, kočenje, ručna); zvona u 7/12/19 h (glasnija kraj crkve), psi, kokoši, traktor u daljini, cvrčci noću.
- 52_fists.js: gard (šake kod lica), zamah unatrag, udarac s okretom tijela; kutovi izmjereni na Rocketbox kosturu; FPZ čuva pozu iz animacije da se zakreti ne zbrajaju.
- 54_cash.js: tko padne ispusti novac (mještani 5–50, policija 25–85, Vukovi 40–150), pokupi se prolaskom, nestane za 60 s.


## Faza 2: meci i lovački pult
- 55_guns.js: zaliha metaka po oružju (localStorage tuhelj_ammo; početno pištolj 60, puška 120…), punjenje uzima iz zalihe (15_combat.js ammoTake), prazno → poruka. U trgovini na dnu 'LOVAČKI PULT': oružje koje nemaš i kutije metaka. Gumb oružja: spremnik / zaliha.


## Faza 3: lik napreduje, park za vježbanje
- 56_stats.js: KONDICIJA (brži sprint, 10_player statRun), SNAGA (jači udarac), GAĐANJE (manje rasipanje), VOŽNJA (jače ubrzanje); rastu sprintom, udarcima, pogocima, brzom vožnjom; spremaju se (tuhelj_stats); prikaz u izborniku (IGRA).
- Park kraj stanice (31_photo.js izvozi GYM): E kod sprave = serija od 10 (zgibovi/propadanja → snaga, step/trbušnjaci → kondicija), +3, odmor 20 s, posebna kamera sa strane.


## Faza 4: auti, nekretnine, garaža
- 57_property.js: mobitel → Autokuća (7 auta, 9 boja, dostava pred kuću, spremljeno u tuhelj_own; 2 mjesta, s garažom 5) i Nekretnine (garaža 1500, vikendica Pristava 82 +70/dan, udio u trgovini +110/dan, brtija +240/dan; isplata u 8 h). Garaža kod kuće (E u autu ispred kuće): boja 250, felge 400, motor 3 stupnja, popravak 60.


## Faza 5a: priča 8–10 i filmski uvodi
- 58_story2.js: 8 Gost iz Stuttgarta (praćenje crnog auta 15–120 m do Terma), 9 Dug iz Njemačke (kapelica, Draganovi ljudi, uništi auto, mobitel Kikiju), 10 Pravi šef (Horvat bježi u službenom autu, njegovi ljudi, izgubi policiju, slavlje). STORY_LAST=10 (29_story, 30_look, 42_title, 46_menu).
- Filmski uvod: prije svakog poglavlja kamera polako kruži oko dvoje koji razgovaraju (CINE), uz trake.

