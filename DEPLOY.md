# 🚀 Guide de Déploiement Firebase

## 📋 Prérequis

- ✅ Firebase CLI installé (`npm install -g firebase-tools`)
- ✅ Compte Google avec accès au projet Firebase `suivi-dettes`
- ✅ Application buildée (`npm run build`)

## 🔐 Étape 1 : Authentification

```bash
# Se connecter à Firebase
firebase login
```

Cela ouvrira un navigateur pour vous authentifier avec votre compte Google.

## 🏗️ Étape 2 : Build de l'application

```bash
# Build de production optimisé
npm run build
```

Le dossier `dist/` sera créé avec votre application prête pour la production.

## 🚀 Étape 3 : Déploiement

### Option A : Déploiement complet (Hosting + Rules)
```bash
npm run deploy
```

### Option B : Déploiement séparé

**Hosting uniquement :**
```bash
npm run deploy:hosting
```

**Firestore Rules uniquement :**
```bash
npm run deploy:rules
```

**Commande manuelle :**
```bash
# Build puis deploy
npm run build
firebase deploy

# Ou deploy spécifique
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

## 🔍 Vérification après déploiement

1. **Hosting URL** : Votre app sera disponible sur :
   - `https://suivi-dettes.web.app`
   - `https://suivi-dettes.firebaseapp.com`

2. **Tester les Security Rules** :
   - Connectez-vous avec votre compte Google
   - Vérifiez que vous pouvez créer/lire vos données
   - Vérifiez qu'aucune donnée d'autres utilisateurs n'est accessible

## 🛡️ Sécurité - Firestore Rules

Les règles Firestore déployées garantissent :

- ✅ Seuls les utilisateurs authentifiés peuvent accéder aux données
- ✅ Chaque utilisateur ne peut lire/écrire que SES propres données
- ✅ Validation des champs requis lors de la création
- ✅ Interdiction totale d'accès aux autres collections

## 🔧 Configuration supplémentaire (Console Firebase)

### 1. Domaines autorisés
Allez dans **Authentication > Settings > Authorized domains** et ajoutez :
- `suivi-dettes.web.app`
- `suivi-dettes.firebaseapp.com`
- Votre domaine custom (si vous en avez un)

### 2. Quotas et limites
Vérifiez dans **Firestore Database > Usage** :
- Lectures/Écritures par jour
- Stockage utilisé
- Activez les alertes si nécessaire

### 3. Monitoring
Dans **Analytics** et **Performance Monitoring** :
- Activez Google Analytics
- Configurez Performance Monitoring
- Surveillez les erreurs

## 📊 Commandes utiles

```bash
# Voir les logs de déploiement
firebase deploy --debug

# Tester les rules localement
firebase emulators:start --only firestore

# Voir les projets configurés
firebase projects:list

# Changer de projet
firebase use <project-id>

# Rollback vers une version précédente
firebase hosting:rollback

# Voir l'historique des déploiements
firebase hosting:releases
```

## 🔄 Workflow de déploiement recommandé

1. **Développement** : `npm run dev`
2. **Test local** : `npm run build && npm run preview`
3. **Commit** : `git add . && git commit -m "..."`
4. **Deploy** : `npm run deploy`
5. **Vérification** : Testez sur l'URL de production

## 🐛 Troubleshooting

### Erreur : "Permission denied"
```bash
firebase logout
firebase login
```

### Erreur : "Project not found"
Vérifiez que le projet existe dans `.firebaserc` :
```json
{
  "projects": {
    "default": "suivi-dettes"
  }
}
```

### Build échoue
```bash
# Nettoyer et réinstaller
rm -rf node_modules dist
npm install
npm run build
```

### Rules non appliquées
```bash
# Force le déploiement des rules
firebase deploy --only firestore:rules --force
```

## 📈 Monitoring

Après déploiement, surveillez :
- **Console Firebase** : https://console.firebase.google.com
- **Logs** : Cloud Logging
- **Performance** : Performance Monitoring
- **Crashes** : Crashlytics (si configuré)

## 🎯 Prochaines étapes

- [ ] Configurer un domaine personnalisé
- [ ] Activer HTTPS automatique
- [ ] Configurer les headers de sécurité
- [ ] Mettre en place un CI/CD (GitHub Actions)
- [ ] Activer le monitoring et les alertes

---

**Note** : Les clés API Firebase dans le code sont sécurisées par les Security Rules. Assurez-vous que ces règles sont toujours actives et correctement configurées.
