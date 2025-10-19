const express = require('express');
const { generatePptx } = require('./api/generate.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// La route ne change pas, mais elle appelle maintenant la nouvelle fonction
app.post('/api/generate', (req, res) => {
    try {
        const reportText = req.body.text;
        if (!reportText) {
            return res.status(400).json({ message: "La clé 'text' est manquante." });
        }
        
        // On passe l'objet 'res' à la fonction pour qu'elle puisse envoyer le fichier
        generatePptx(reportText, res);

    } catch (error) {
        console.error("Erreur du serveur:", error);
        res.status(500).json({ message: "Une erreur interne est survenue.", details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});