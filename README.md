# Beaztcode — Portfolio (PWA)

Portfolio bilingue FR/EN de Luc Grégoire Nkoussa (alias **Beaztcode**), Lead Dev Fullstack.
HTML / CSS / JS natifs, sans framework ni étape de build.

## Fonctionnalités
- Thème sombre **automatique** (suit le système) + bouton auto / sombre / clair
- FR / EN (détection du navigateur, choix mémorisé)
- PWA : manifest, icônes maskable, service worker (offline, mise à jour avec invitation à recharger), bouton d'installation
- Animations (réseau interactif, requête qui traverse les couches, simulation d'import, terminal, easter eggs), `prefers-reduced-motion` respecté
- CSP stricte, polices auto-hébergées, aucun traceur

## Contenu
- Logos de technologies : [Simple Icons](https://simpleicons.org) (`assets/logos`)
- Logos des clients/employeurs : `assets/clients` (marques déposées de leurs propriétaires, usage de référence uniquement)
- Badges de certification : visuels Credly (`assets/certs`), liens de vérification publics
- Photo de profil : remplacer `assets/avatar.svg` (monogramme) par la photo dans `index.html` (`#avatarImg`)

## Lancer en local
```bash
python3 -m http.server 4173   # puis http://localhost:4173
```

## Déployer (hébergement statique gratuit)
Le dossier racine est directement publiable : GitHub Pages, Cloudflare Pages ou Netlify.
`_headers` (Cloudflare/Netlify) applique les en-têtes de sécurité et le cache.
Pour publier une nouvelle version, incrémenter `VERSION` dans `sw.js`.

## Régénérer les icônes
```bash
node tools-gen-icons.mjs
```
