# Pour lancer le projet

## Avoir un usager en base de données
{
  "name": "Utilisateur Test",
  "email": "test@example.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "role": "user",
  "createdAt": { "$date": "2026-01-01T00:00:00Z" }
}

(todo) Implémenter la création d'un usager.

## Lancer le serveur de développement

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) avec un browser pour voir le résultat.

# Stack technique
- Framework : Next.js (App Router, TypeScript)
- Base de données : MongoDB
- Modélisation / ODM : Mongoose
- Authentification : Auth.js avec l'adapteur MongoDB

# Fichier d'environnement
Ajouter un fichier .env.local avec les information suivante : 
- MONGODB_URI
- AUTH_SECRET (peux être générer par npx auth secret ou openssl rand -base64)
- NEXTAUTH_URL (exemple http://localhost:3000)

## CI et déploiement sur Vercel

Le workflow GitHub Actions `.github/workflows/ci.yml` exécute le lint, les tests et
le build sur chaque push et chaque pull request. Le build utilise des variables
de test; aucun secret de production ni accès à MongoDB n'est nécessaire dans GitHub.

Pour activer les déploiements automatiques, importer ce dépôt dans Vercel et
connecter le projet à GitHub. Vercel détecte Next.js et crée des déploiements de
prévisualisation pour les pull requests, puis un déploiement de production pour la
branche configurée comme branche de production. Ajouter `MONGODB_URI` et
`AUTH_SECRET` dans les variables d'environnement du projet Vercel, pour les
environnements Preview et Production. `NEXTAUTH_URL` n'est généralement pas
nécessaire sur Vercel; la définir seulement pour imposer une URL d'authentification
fixe.

