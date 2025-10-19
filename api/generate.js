// On utilise la syntaxe "require" pour être le plus compatible possible.
const PptxGenJS = require("pptxgenjs");

// On exporte la fonction avec la syntaxe "module.exports".
module.exports = async (req, res) => {
    try {
        // 1. Vérifier que la méthode est bien POST
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Méthode non autorisée.' });
        }

        // 2. Lire le corps de la requête manuellement (méthode la plus fiable)
        const body = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => { data += chunk; });
            req.on('end', () => {
                // Si le corps est vide, on résout avec un objet vide
                // pour éviter l'erreur 'Unexpected end of JSON input'.
                if (!data) {
                    return resolve({});
                }
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(new Error('JSON mal formaté'));
                }
            });
            req.on('error', err => reject(err));
        });

        // 3. Récupérer le texte (gère le cas où `body` est vide ou sans la clé `text`)
        const reportText = body.text;
        if (!reportText) {
            return res.status(400).json({ message: "La clé 'text' est manquante dans le corps de la requête JSON." });
        }
        
        // 4. Logique de génération du PowerPoint (inchangée)
        let pres = new PptxGenJS();
        pres.layout = "LAYOUT_16x9";
        const COLOR_PRIMARY = '123456';
        const FONT_HEADLINE = "Helvetica Neue";
        
        pres.defineSlideMaster({
            title: "MASTER_SLIDE",
            background: { color: "FFFFFF" },
            objects: [
                { placeholder: { options: { name: "title", type: "title", x: 1, y: 0.5, w: '85%', h: 1, fontFace: FONT_HEADLINE, fontSize: 36, color: COLOR_PRIMARY, bold: true } } },
                { placeholder: { options: { name: "body", type: "body", x: 1, y: 2.2, w: '85%', h: 5.5, fontFace: FONT_HEADLINE, fontSize: 18 } } },
            ],
        });

        const sections = reportText.split('\n\n');
        const slidesData = sections.map(section => {
            const lines = section.split('\n');
            const title = lines.shift() || '';
            const content = lines.join('\n');
            return { title, content };
        });

        for (const slideData of slidesData) {
            const slide = pres.addSlide({ masterName: "MASTER_SLIDE" });
            slide.addText(slideData.title, { placeholder: "title" });
            slide.addText(slideData.content, { placeholder: "body" });
        }

        const pptxBuffer = await pres.write({ outputType: "buffer" });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', 'attachment; filename=presentation.pptx');
        res.send(pptxBuffer);

    } catch (error) {
        // 5. Gestion des erreurs améliorée
        console.error("Erreur serveur:", error);
        res.status(500).json({ message: "Une erreur interne est survenue.", details: error.message });
    }
};