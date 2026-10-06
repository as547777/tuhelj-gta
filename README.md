# Tuhelj GTA 🏡🚗

### 🎮 [▶ PLAY NOW](https://as547777.github.io/tuhelj-gta/)
### 📱 [⬇ ANDROID APK](https://github.com/as547777/tuhelj-gta/releases/download/android/Tuhelj.apk)

An open-world 3D game in the browser, set in the village of **Tuhelj** in Hrvatsko zagorje, Croatia, built from real OpenStreetMap data. It has driving, missions, police, firefighters, poker at the local pub, shops you can walk into, and multiplayer with friends.

> 🚧 Work in progress, new features are being added regularly.

## Play
- **Online:** [https://as547777.github.io/tuhelj-gta/](https://as547777.github.io/tuhelj-gta/)
- **On a computer:** double-click `docs/index.html` (Chrome or Edge).
- **On a phone:** open the online address; the game adapts to touch controls automatically.
- **Android app:** download [Tuhelj.apk](https://github.com/as547777/tuhelj-gta/releases/download/android/Tuhelj.apk), open it on the phone and allow installing from this source. The game is inside the app, so it also runs offline. Built automatically by GitHub Actions (`android/`, `.github/workflows/android.yml`) after every change to `docs/`.
- **iPhone:** open the online address in Safari → Share → *Add to Home Screen*.

Basic controls: **WASD** + mouse (third-person camera, **V** switches to first person), **E** to interact (talk, start a mission, enter a car or building, wardrobe), **mouse wheel** or **1–6** to switch weapons, left click to shoot, right click to aim, **M** map, **P** phone.

The story *Povratak u Tuhelj* has 7 chapters: follow the orange ★ on the map. Your flat Kod Ruže has a wardrobe, a bed that saves the game, and furniture you can buy. Put your own photos of Tuhelj in `photos/` and they play on the start screen and hang on the wall at home.

## Development
- The game code is in `src/`: each module is a separate `.js` file, and all modules are described in `PREDAJA.md`.
- Build for Netlify and GitHub Pages: `python3 build_netlify.py` → `dist/tuhelj-3d/` and `dist/tuhelj-3d.zip` (for Netlify) and `docs/` (for GitHub Pages).
- Quick test build: `python3 build.py test/index.html`. A `models/` folder is created next to the HTML.
- 3D models (GLB) are in `assets/`, and tools for converting new characters are in `tools/model_pipeline/`.
- Static web files (three.js, MQTT, PeerJS, icons, instructions) are in `web/`.

## Project structure
| folder | contents |
|---|---|
| `src/` | game modules (terrain, roads, buildings, cars, people, missions, interiors…) |
| `assets/` | characters (Rocketbox), animations, cars, tractor, weapons + `LICENSES/` |
| `tools/model_pipeline/` | FBX → GLB conversion, texture downscaling, mobile version |
| `web/` | static files shipped with the game |
| `docs/` | the built game (for GitHub Pages) |
| `data.json` | map data (OpenStreetMap) |

## Credits and licenses
- Map: © OpenStreetMap contributors (ODbL); reference images: Mapillary (CC BY-SA 4.0)
- People and mocap animations: Microsoft Rocketbox (MIT), see `assets/LICENSES/Rocketbox_MIT_LICENSE.md`
- Cars and weapons: Quaternius (CC0); tractor: Kenney Car Kit (CC0)
- three.js (MIT), MQTT.js (MIT), PeerJS (MIT), licenses in `web/`
- "Realistic soldier" character: Soldier.glb from the three.js examples (character and animations: Adobe Mixamo)
