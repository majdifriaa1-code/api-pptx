const express = require('express');
const officegen = require('officegen');

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour lire le corps des requêtes JSON
app.use(express.json());

// Définir la route '/api/generate'
app.post('/api/generate', (req, res) => {
    try {
        const reportText = req.body.text;
        if (!reportText) {
            return res.status(400).json({ message: "La clé 'text' est manquante dans le corps de la requête." });
        }

        // --- Début de la logique Officegen ---

        // Créer un objet de présentation PowerPoint
        const pptx = officegen('pptx');

        // Gérer les erreurs de la bibliothèque officegen
        pptx.on('error', (err) => {
            console.error("Erreur Officegen:", err);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Erreur lors de la génération du fichier.' });
            }
        });

        // Découper le rapport en sections (paragraphes)
        const sections = reportText.split('\n\n');

        // Créer une diapositive pour chaque section
        for (const section of sections) {
            // Créer une nouvelle diapositive
            const slide = pptx.newSlide();

            const lines = section.split('\n');
            const title = lines.shift() || ' '; // Le titre ne peut pas être vide
            const content = lines.join('\n');

            // Ajouter le titre à la diapositive
            slide.addText(title, { 
                x: '5%', y: '5%', 
                w: '90%', h: '10%', 
                font_size: 32, font_face: 'Arial', bold: true
            });

            // Ajouter le contenu à la diapositive
            slide.addText(content, { 
                x: '5%', y: '20%', 
                w: '90%', h: '75%', 
                font_size: 16, font_face: 'Arial'
            });
        }

        // Définir les en-têtes pour le téléchargement du fichier
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', 'attachment; filename=presentation.pptx');

        // Générer le fichier et l'envoyer directement au client
        pptx.generate(res);

    } catch (error) {
        console.error("Erreur inattendue dans le serveur:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Une erreur interne inattendue est survenue.", details: error.message });
        }
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});