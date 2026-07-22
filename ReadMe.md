# Dossier des photos indices

Place tes photos indices dans ce dossier en respectant cette convention de nommage :

```
images/balise1.jpg
images/balise2.jpg
images/balise3.jpg
...
images/balise10.jpg
```

## Comment ça marche

1. Chaque balise a un numéro (1 à 10).
2. La photo indice de la balise N doit s'appeler `baliseN.jpg` (ex: `balise3.jpg` pour la Balise 3).
3. L'application détecte automatiquement si la photo existe (via une requête HTTP HEAD).
4. Si la photo existe, un bouton "Voir l'indice" apparaît sur la carte de la balise correspondante.
5. Si aucune photo n'est trouvée, le bouton n'apparaît pas — la balise fonctionne normalement sans indice.

## Format

- **Format recommandé :** JPG (pour un chargement rapide sur mobile)
- **Résolution :** 800px de large maximum (les photos sont affichées en pleine largeur sur mobile)
- **Poids :** < 200 Ko par photo idéalement

## Onglet "Indices"

L'onglet "Indices" (icône 📷 dans la barre de navigation) permet de vérifier quelles photos sont détectées. Il affiche :
- Une miniature de la photo si elle est présente
- "Aucune photo" si elle n'est pas trouvée

## Hébergement GitHub Pages

Après avoir placé tes photos dans ce dossier, commit et push sur GitHub. Active GitHub Pages dans les paramètres du dépôt (Settings > Pages > Source : branche main). L'application sera accessible à l'adresse `https://ton-nom.github.io/nom-du-repo/`.
