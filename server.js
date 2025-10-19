const express = require('express');
const { generatePptx } = require('./api/generate.js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour lire le JSON
app.use(express.json());

// Définir la route de notre API
app.post('/api/generate', async (req, res) => {
    try {
        const reportText = req.body.text;
        if (!reportText) {
            return res.status(400).json({ message: "La clé 'text' est manquante." });
        }

        const pptxBuffer = await generatePptx(reportText);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', 'attachment; filename=presentation.pptx');
        res.send(pptxBuffer);

    } catch (error) {
        console.error("Erreur du serveur:", error);
        res.status(500).json({ message: "Une erreur interne est survenue.", details: error.message });
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});