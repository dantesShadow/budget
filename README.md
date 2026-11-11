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
- AUTH_SECRET (peux être générer par npx auth secret)
- NEXTAUTH_URL (exemple http://localhost:3000)

