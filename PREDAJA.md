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
