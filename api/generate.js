import PptxGenJS from "pptxgenjs";

// Ceci est la fonction "Serverless" que Vercel va exécuter
export default async function handler(req, res) {
  // NOTRE MARQUEUR DE DÉBOGAGE
  console.log("--- V3 DE L'API EXÉCUTÉE À :", new Date().toISOString());

  try {
    if (req.method !== 'POST') {
      console.log("Erreur : Méthode non autorisée.", req.method);
      return res.status(405).json({ message: 'Seules les requêtes POST sont autorisées' });
    }

    console.log("Début de la lecture du corps de la requête...");
    const body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            console.log("Lecture du corps de la requête terminée. Contenu:", data);
            try {
                const parsedData = JSON.parse(data);
                console.log("Analyse JSON réussie.");
                resolve(parsedData);
            } catch (e) {
                console.error("Erreur d'analyse JSON:", e);
                reject(e);
            }
        });
        req.on('error', err => {
            console.error("Erreur de flux de requête:", err);
            reject(err);
        });
    });

    const reportText = body.text || "Aucun texte fourni.";
    console.log("Texte du rapport récupéré. Début de la génération du PPTX.");

    // ... (le reste du code pour générer le PPTX reste identique)
    
    let pres = new PptxGenJS();
    pres.layout = "LAYOUT_16x9";
    const COLOR_PRIMARY = '123456';
    const FONT_HEADLINE = "Helvetica Neue";
    
    pres.defineSlideMaster({ /* ... */ });
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
    console.log("Génération du PPTX terminée avec succès.");
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', 'attachment; filename=presentation.pptx');
    res.send(pptxBuffer);

  } catch (error) {
    console.error("--- ERREUR GLOBALE DANS LE HANDLER ---", error);
    res.status(500).json({ message: "Une erreur est survenue lors de la génération du fichier.", details: error.message });
  }
}