# Tuhelj GTA 🏡🚗

3D igra otvorenog svijeta u pregledniku: selo **Tuhelj** u Hrvatskom zagorju, napravljeno prema OpenStreetMap karti. Ima vožnju, misije, policiju, vatrogasce, poker u brtiji, trgovine u koje se može ući i multiplayer s prijateljima.

## Igraj
- **Online:** Netlify (projekt `tuhelj-gtav`), a ako uključiš GitHub Pages, igra će biti i na `https://TVOJE-IME.github.io/tuhelj-gta/`.
- **Na računalu:** otvori `docs/index.html` dvoklikom (Chrome ili Edge).
- **Na mobitelu:** otvori online adresu; igra se sama prilagodi dodiru.

Osnovne tipke: **E** — radnja (uđi u auto, trgovinu, kupi, izađi), **V** — pogled iz auta, **P** — mobitel (postavke, izgled lika, karta).

## Kako dalje uređivati
- Kod igre je u `src/`: svaki modul je zasebna `.js` datoteka, a opis svih modula je u `PREDAJA.md`.
- Gradnja za Netlify i GitHub Pages: `python3 build_netlify.py` → `dist/tuhelj-3d/` i `dist/tuhelj-3d.zip` (za Netlify) te `docs/` (za GitHub Pages).
- Brza testna verzija: `python3 build.py test/index.html`. Uz HTML se pravi i mapa `models/`.
- 3D modeli (GLB) su u `assets/`, a alati za pretvaranje novih likova u `tools/model_pipeline/`.
- Statične datoteke weba (three.js, MQTT, PeerJS, ikone, upute) su u `web/`.

## Struktura
| mapa | sadržaj |
|---|---|
| `src/` | moduli igre (teren, ceste, zgrade, auti, ljudi, misije, interijeri…) |
| `assets/` | likovi (Rocketbox), animacije, auti, traktor, puške + `LICENSES/` |
| `tools/model_pipeline/` | pretvorba FBX → GLB, smanjivanje tekstura, verzija za mobitel |
| `web/` | statične datoteke koje idu uz igru |
| `docs/` | gotova igra (za GitHub Pages) |
| `data.json` | podaci karte (OpenStreetMap) |

## Zasluge i licence
- Karta: © OpenStreetMap contributors (ODbL); referentne slike: Mapillary (CC BY-SA 4.0)
- Ljudi i mocap animacije: Microsoft Rocketbox (MIT) — `assets/LICENSES/Rocketbox_MIT_LICENSE.md`
- Auti i puške: Quaternius (CC0); traktor: Kenney Car Kit (CC0)
- three.js (MIT), MQTT.js (MIT), PeerJS (MIT) — licence u `web/`
- Lik "realistični vojnik": Soldier.glb iz primjera three.js (lik i animacije: Adobe Mixamo)
