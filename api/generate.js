const PptxGenJS = require("pptxgenjs");

module.exports = async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Méthode non autorisée.' });
        }

        const body = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => { data += chunk; });
            req.on('end', () => {
                if (!data) return resolve({});
                try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('JSON mal formaté')); }
            });
            req.on('error', err => reject(err));
        });

        const reportText = body.text;
        if (!reportText) {
            return res.status(400).json({ message: "La clé 'text' est manquante dans le corps de la requête JSON." });
        }
        
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
        
        // --- LA CORRECTION EST ICI ---
        // On utilise res.end() au lieu de res.send() pour envoyer le buffer.
        res.end(pptxBuffer);

    } catch (error) {
        console.error("Erreur serveur:", error);
        res.status(500).json({ message: "Une erreur interne est survenue.", details: error.message });
    }
};