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

## Otvoreno
- vatrogasni kamion i hitna su još proceduralni (nema dobrog besplatnog realističnog modela); bazuka proceduralna
- puške u rukama igrača s realističnim izgledom (vezati na kost Bip01_R_Hand)
- boje fasada iz Mapillary fotografija; bolja stabla
- skretanje prometa/policije na raskrižjima (graf cesta)
- unutrašnjost DVD-a i škole
