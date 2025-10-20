const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// La fonction qui génère le HTML est directement dans ce fichier
function generateHtmlPresentation(reportText) {
    const sections = reportText.split('\n\n');
    let slidesHtml = '';

    sections.forEach((section, index) => {
        const lines = section.split('\n');
        const title = lines.shift() || '';
        const content = lines.map(p => `<p>${p}</p>`).join('');
        const slideClass = (index === 0) ? 'slide title-slide' : 'slide';

        slidesHtml += `
            <div class="${slideClass}">
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
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;600&family=Montserrat:wght@700&display=swap');
                
                body {
                    margin: 0;
                    font-family: 'Poppins', sans-serif;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    counter-reset: slide-counter;
                }
                .slide {
                    background-color: white;
                    width: 1920px;
                    height: 1080px;
                    margin: 2rem 0;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    padding: 80px 100px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }
                .slide::after {
                    counter-increment: slide-counter;
                    content: counter(slide-counter);
                    position: absolute;
                    bottom: 40px;
                    right: 80px;
                    font-size: 24px;
                    font-weight: 600;
                    color: #c3cfe2;
                }
                .title-slide {
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .title-slide h1 {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 100px;
                    border-bottom: none;
                    padding-bottom: 0;
                    margin-bottom: 20px;
                }
                .title-slide .content p {
                    font-size: 36px;
                    font-weight: 300;
                    color: #555;
                }
                h1 {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 72px;
                    color: #0d253f;
                    font-weight: 700;
                    margin: 0 0 50px 0;
                    padding-bottom: 25px;
                    border-bottom: 5px solid #01b4e4;
                }
                .content p {
                    font-size: 32px;
                    color: #333;
                    line-height: 1.7;
                    margin: 0 0 25px 0;
                    font-weight: 300;
                }
            </style>
        </head>
        <body>
            ${slidesHtml}
        </body>
        </html>
    `;
}

// La route de notre API ne dépend d'aucun autre fichier
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