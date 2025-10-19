const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// La fonction qui génère le HTML
function generateHtmlPresentation(reportText) {
    const sections = reportText.split('\n\n');
    let slidesHtml = '';

    sections.forEach(section => {
        const lines = section.split('\n');
        const title = lines.shift() || '';
        const content = lines.map(p => `<p>${p}</p>`).join('');

        slidesHtml += `
            <div class="slide">
                <h1>${title}</h1>
                <div class="content">
                    ${content}
                </div>
            </div>
        `;
    });

    // Le modèle HTML complet avec le style CSS intégré
    return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Présentation</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
                
                body {
                    margin: 0;
                    font-family: 'Poppins', sans-serif;
                    background-color: #f0f2f5;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 2rem;
                }
                .slide {
                    background-color: white;
                    width: 1600px;
                    height: 900px;
                    margin-bottom: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    padding: 60px 80px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    transform-origin: top center;
                }
                h1 {
                    font-size: 60px;
                    color: #123456; /* Bleu nuit */
                    font-weight: 600;
                    margin: 0 0 40px 0;
                    padding-bottom: 20px;
                    border-bottom: 4px solid #009FB8; /* Turquoise */
                }
                .content p {
                    font-size: 28px;
                    color: #333;
                    line-height: 1.6;
                    margin: 0 0 20px 0;
                }
            </style>
        </head>
        <body>
            ${slidesHtml}
        </body>
        </html>
    `;
}

// La route de notre API
app.post('/api/generate', (req, res) => {
    try {
        const reportText = req.body.text;
        if (!reportText) {
            return res.status(400).json({ message: "La clé 'text' est manquante." });
        }

        const html = generateHtmlPresentation(reportText);

        res.setHeader('Content-Type', 'text/html');
        res.send(html);

    } catch (error) {
        console.error("Erreur serveur:", error);
        res.status(500).json({ message: "Une erreur interne est survenue." });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});