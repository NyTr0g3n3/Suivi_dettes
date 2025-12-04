# Suivi de Dettes - React App

Application web moderne pour gérer vos prêts, dettes et épargne personnelle avec synchronisation cloud via Firebase.

## 🎯 Fonctionnalités

- 🔐 **Authentification Google** - Connexion sécurisée avec votre compte Google
- 👥 **Gestion de contacts** - Ajoutez et gérez vos contacts
- 💸 **Prêts & Dettes** - Suivez qui vous doit de l'argent et à qui vous devez
- 💰 **Transactions** - Enregistrez vos prêts et emprunts
- 🏦 **Épargne** - Gérez vos catégories d'épargne et suivez votre balance
- 🌓 **Mode sombre** - Interface adaptable avec thème clair/sombre
- 📱 **Responsive** - Fonctionne sur mobile, tablette et desktop
- ☁️ **Synchronisation cloud** - Vos données sont synchronisées en temps réel via Firebase

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm

### Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour la production
npm run build

# Preview du build de production
npm run preview
```

## 📂 Structure du projet

```
src/
├── components/          # Composants React
│   ├── auth/           # Composants d'authentification
│   ├── dashboard/      # Composants du tableau de bord
│   ├── contacts/       # Gestion des contacts
│   ├── savings/        # Gestion de l'épargne
│   ├── modals/         # Composants modaux
│   └── common/         # Composants réutilisables
├── services/           # Services Firebase
│   ├── authService.js
│   ├── contactsService.js
│   ├── transactionsService.js
│   └── savingsService.js
├── hooks/              # Hooks React personnalisés
│   ├── useAuth.js
│   └── useDarkMode.js
├── utils/              # Utilitaires
│   ├── formatters.js
│   └── toast.js
├── config/             # Configuration
│   └── firebase.js
├── App.jsx             # Composant principal
├── main.jsx            # Point d'entrée
└── index.css           # Styles globaux
```

## 🔧 Technologies utilisées

- **React 19** - Framework UI
- **Vite 7** - Build tool et dev server ultra-rapide
- **Firebase** - Backend-as-a-Service (Auth + Firestore)
- **Tailwind CSS 4** - Framework CSS utility-first
- **jsPDF** - Génération de PDF (pour exports)

## 🔄 Migration depuis la version monolithique

Cette application a été migrée d'un fichier HTML monolithique (2014 lignes) vers une architecture React modulaire.

### Avantages de la nouvelle architecture

- ✅ **Code organisé** - Séparation claire des responsabilités
- ✅ **Maintenabilité** - Chaque module est indépendant et testable
- ✅ **Réutilisabilité** - Composants réutilisables
- ✅ **Performance** - Build optimisé et code splitting
- ✅ **Developer Experience** - Hot Module Replacement, meilleurs outils

### Conservation des données

**Toutes vos données existantes sont préservées !** La migration n'a modifié que le code frontend. Firebase Firestore contient toutes vos données (contacts, transactions, épargne) qui restent inchangées.

## 🔐 Configuration Firebase

La configuration Firebase est dans `src/config/firebase.js`.

**Important** : Pour la sécurité, assurez-vous de :
1. Configurer les [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
2. Limiter les domaines autorisés dans la console Firebase
3. Ne jamais exposer de clés secrètes backend dans le code client

## 📝 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Build pour la production
- `npm run preview` - Preview du build de production
- `npm run lint` - Vérifie le code avec ESLint

## 🌐 Déploiement

L'application peut être déployée sur n'importe quelle plateforme de hosting static :

- **Firebase Hosting** (recommandé)
- Vercel
- Netlify
- GitHub Pages

```bash
# Build
npm run build

# Le dossier dist/ contient l'application prête à déployer
```

## 📄 Licence

Projet personnel - Tous droits réservés

## 🔧 Support

Pour toute question ou problème, consultez :
- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation React](https://react.dev)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation Vite](https://vite.dev)

---

**Note** : L'ancien fichier monolithique est sauvegardé dans `old/index.html.original`
