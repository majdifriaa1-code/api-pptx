const officegen = require('officegen');
const fs = require('fs');

function generatePptx(reportText, res) {
    // Créer une nouvelle présentation avec officegen
    const pptx = officegen('pptx');

    // Gérer les erreurs de la bibliothèque
    pptx.on('error', function(err) {
        console.error("Erreur Officegen:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Erreur lors de la génération du fichier PPTX.' });
        }
    });

    // Découper le rapport en sections
    const sections = reportText.split('\n\n');

    // Créer une diapositive pour chaque section
    sections.forEach(section => {
        const slide = pptx.newSlide();
        
        const lines = section.split('\n');
        const title = lines.shift() || '';
        const content = lines.join('\n');

        // Ajouter le titre
        slide.addText(title, { 
            x: '5%', y: '5%', 
            w: '90%', h: '10%', 
            font_size: 36, font_face: 'Helvetica Neue', bold: true, color: '363636' 
        });

        // Ajouter le contenu
        slide.addText(content, { 
            x: '5%', y: '20%', 
            w: '90%', h: '75%', 
            font_size: 18, font_face: 'Helvetica Neue', color: '4f4f4f'
        });
    });

    // Définir les en-têtes de la réponse pour le téléchargement
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', 'attachment; filename=presentation.pptx');

    // Générer le fichier et l'envoyer directement dans la réponse
    // C'est une méthode de streaming, très efficace
    pptx.generate(res);
}

module.exports = { generatePptx };