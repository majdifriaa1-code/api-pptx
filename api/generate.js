import PptxGenJS from "pptxgenjs";

// Ceci est la fonction "Serverless" que Vercel va exécuter
export default async function handler(req, res) {
  try {
    // On s'assure que la requête est de type POST
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Seules les requêtes POST sont autorisées' });
    }

    // --- DÉBUT DE LA CORRECTION ---
    // Vercel ne "parse" pas le body JSON automatiquement.
    // Nous devons lire le flux de données entrant et le transformer en objet JSON.
    const body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', err => {
            reject(err);
        });
    });
    // --- FIN DE LA CORRECTION ---

    // On utilise maintenant `body.text` au lieu de `req.body.text`
    const reportText = body.text || "Aucun texte fourni.";

    // Créer une nouvelle présentation
    let pres = new PptxGenJS();
    pres.layout = "LAYOUT_16x9";

    // --- Design Moderne ---
    const COLOR_PRIMARY = '123456'; // Bleu nuit
    const FONT_HEADLINE = "Helvetica Neue";
    
    pres.defineSlideMaster({
      title: "MASTER_SLIDE",
      background: { color: "FFFFFF" },
      objects: [
        {
          placeholder: {
            options: { name: "title", type: "title", x: 1, y: 0.5, w: '85%', h: 1, fontFace: FONT_HEADLINE, fontSize: 36, color: COLOR_PRIMARY, bold: true },
            text: "Titre par défaut",
          },
        },
        {
          placeholder: {
            options: { name: "body", type: "body", x: 1, y: 2.2, w: '85%', h: 5.5, fontFace: FONT_HEADLINE, fontSize: 18 },
            text: "Contenu par défaut",
          },
        },
      ],
    });

    // Découper le rapport en diapositives
    const sections = reportText.split('\n\n');
    const slidesData = sections.map(section => {
      const lines = section.split('\n');
      const title = lines.shift() || '';
      const content = lines.join('\n');
      return { title, content };
    });

    // Créer les diapositives
    for (const slideData of slidesData) {
      const slide = pres.addSlide({ masterName: "MASTER_SLIDE" });
      slide.addText(slideData.title, { placeholder: "title" });
      slide.addText(slideData.content, { placeholder: "body" });
    }

    // Générer le fichier PowerPoint en mémoire (buffer)
    const pptxBuffer = await pres.write({ outputType: "buffer" });
    
    // Envoyer le fichier en réponse
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', 'attachment; filename=presentation.pptx');
    res.send(pptxBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Une erreur est survenue lors de la génération du fichier.", details: error.message });
  }
}