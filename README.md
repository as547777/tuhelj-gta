# Tuhelj GTA 🏡🚗

### 🎮 [▶ PLAY NOW](https://as547777.github.io/tuhelj-gta/)

An open-world 3D game in the browser, set in the village of **Tuhelj** in Hrvatsko zagorje, Croatia, built from real OpenStreetMap data. It has driving, missions, police, firefighters, poker at the local pub, shops you can walk into, and multiplayer with friends.

> 🚧 Work in progress, new features are being added regularly.

## Play
- **Online:** [https://as547777.github.io/tuhelj-gta/](https://as547777.github.io/tuhelj-gta/)
- **On a computer:** double-click `docs/index.html` (Chrome or Edge).
- **On a phone:** open the online address; the game adapts to touch controls automatically.

Basic controls: **E** to interact (enter a car or shop, buy, exit), **V** to switch the in-car camera, **P** to open the phone (settings, character look, map).

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
