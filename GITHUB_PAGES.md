# 🚀 Déploiement sur GitHub Pages

## ✅ Configuration effectuée

Votre application React est maintenant configurée pour se déployer automatiquement sur GitHub Pages.

## 📋 Ce qui a été configuré

1. **Workflow GitHub Actions** (`.github/workflows/deploy.yml`)
   - Build automatique à chaque push sur `main`
   - Déploiement sur GitHub Pages
   - Node.js 20 avec cache npm

2. **Vite Config** (`vite.config.js`)
   - Base path: `/Suivi_dettes/`
   - Nécessaire pour GitHub Pages

## 🔧 Activer GitHub Pages (à faire UNE FOIS)

### Via l'interface web GitHub :

1. Allez sur votre repo : `https://github.com/NyTr0g3n3/Suivi_dettes`
2. Cliquez sur **Settings** (⚙️)
3. Dans le menu de gauche, cliquez sur **Pages**
4. Sous **Source**, sélectionnez :
   - Source : `GitHub Actions`
5. Sauvegardez

## 🚀 Déploiement

### Automatique (recommandé)
```bash
# Chaque push sur main déclenche le déploiement
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### Manuel
Dans l'onglet **Actions** de votre repo GitHub, cliquez sur "Run workflow"

## 🌐 URL de l'application

Après le déploiement, votre app sera disponible sur :

```
https://nytr0g3n3.github.io/Suivi_dettes/
```

## ⏱️ Temps de déploiement

- Build : ~2-3 minutes
- Déploiement : ~1 minute
- **Total : ~3-5 minutes**

## 🔍 Vérifier le déploiement

1. Allez dans l'onglet **Actions** de votre repo
2. Vous verrez le workflow "Deploy to GitHub Pages"
3. Cliquez dessus pour voir les logs
4. ✅ Si tout est vert, l'app est déployée !

## 🐛 Troubleshooting

### Erreur 404 après déploiement
- Vérifiez que GitHub Pages est activé (Settings > Pages)
- Vérifiez que `base: '/Suivi_dettes/'` est bien dans `vite.config.js`
- Attendez 5-10 minutes (propagation DNS)

### Le workflow ne se lance pas
- Vérifiez les permissions dans Settings > Actions > General
- Cochez "Read and write permissions"

### Erreur de build
- Vérifiez les logs dans Actions
- Assurez-vous que `npm run build` fonctionne localement

## 📊 Monitoring

- **Actions** : https://github.com/NyTr0g3n3/Suivi_dettes/actions
- **Pages Settings** : https://github.com/NyTr0g3n3/Suivi_dettes/settings/pages

## 🔄 Workflow

```
Code modifié → git push → GitHub Actions → Build → Deploy → App en ligne
```

## 💡 Notes importantes

1. **Branche** : Le déploiement se fait depuis `main`
2. **Build** : Le dossier `dist/` n'est PAS committé (dans .gitignore)
3. **Automatique** : Chaque push déclenche un redéploiement
4. **Gratuit** : GitHub Pages est gratuit pour les repos publics

## 🆚 GitHub Pages vs Firebase

**GitHub Pages** (actuel) :
- ✅ Gratuit et simple
- ✅ Intégration GitHub
- ❌ Pas de backend
- ❌ Configuration custom limitée

**Firebase Hosting** (optionnel) :
- ✅ Intégration Firebase (Auth, Firestore)
- ✅ CDN global rapide
- ✅ Previews de déploiement
- ✅ Analytics intégrés

**Verdict** : GitHub Pages est parfait pour commencer ! Vous pouvez migrer vers Firebase plus tard si besoin.

---

**Prochaine étape** : Pushez le code et vérifiez le déploiement dans l'onglet Actions ! 🎉
