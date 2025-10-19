const PptxGenJS = require("pptxgenjs");

async function generatePptx(reportText) {
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
    slidesData = sections.map(section => {
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

    return await pres.write({ outputType: "buffer" });
}

module.exports = { generatePptx };