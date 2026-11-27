import type { ToolDetail } from './toolDetails'

/** Подробные тексты страниц инструментов на английском. */
export const EN: Record<string, ToolDetail> = {
  'pdf-to-word': {
    intro: [
      'PDF exists so a document looks identical on any machine, which is exactly why it is awkward to edit: paragraphs, tables and fonts are not stored the way Word stores them. The converter reads the text layer, font sizes and coordinates again and rebuilds a regular .docx with paragraphs, bold and italic, columns, tables and pictures.',
      'The text stays text — you can select it, search it, reword it and add new clauses. The file opens in Microsoft Word, Google Docs, LibreOffice and Pages. Everything runs in your browser, so the document never goes to a server.',
    ],
    useCases: [
      {
        title: 'Fixing someone else’s document',
        text: 'A contract or quote arrives as a PDF but two clauses need changing. Convert to Word, edit, export back to PDF.',
      },
      {
        title: 'CVs and portfolios',
        text: 'A recruiter asks for "the CV in Word" while you only have a polished PDF. Conversion keeps the structure so nothing is retyped.',
      },
      {
        title: 'Study material',
        text: 'Lecture notes and assignments are easier to annotate in .docx, where you can write next to the original text.',
      },
    ],
    steps: [
      {
        title: 'Open the PDF',
        text: 'Drop the file into the box or click it and pick a file. One file may be up to 100 MB and 200 pages; several PDFs can be sent together as a ZIP.',
      },
      {
        title: 'Wait for the pages to be parsed',
        text: 'The browser reads the text layer, fonts and block positions. Large files show a progress bar and can be cancelled without downloading anything.',
      },
      {
        title: 'Check the tricky parts',
        text: 'Tables, two-column layouts and captions are the most fragile elements. Skim them in Word and adjust if needed.',
      },
      {
        title: 'Download the .docx',
        text: 'The file saves as soon as processing ends. No account, email or payment, and your original PDF stays untouched.',
      },
    ],
    example: {
      title: 'Example: a 24-page handbook',
      text: 'Input: a PDF with text, three tables and six diagrams. Output: a .docx where the text is editable, tables remain tables and diagrams are embedded as pictures. A scan without a text layer behaves differently — those pages are placed as images, because reading characters out of pixels is a separate OCR task.',
    },
    tips: [
      {
        title: 'A scan is not text',
        text: 'PDFs produced by a scanner or a phone photo contain no text layer. Pages are inserted as images, and editing requires OCR first.',
      },
      {
        title: 'Footnotes and running heads',
        text: 'They may move to the end of a page or the start of a paragraph. That is a format quirk, not a conversion bug — check the first and last page.',
      },
    ],
    limits:
      'The tool does not recognise text in scans and does not copy interactive forms, signatures or vector drawings one to one. Keep complex graphics in the PDF and move only the text into Word.',
    faq: [
      {
        q: 'Do I need to install anything?',
        a: 'No. Conversion happens in your browser: no extensions, no apps, no sign-up.',
      },
      {
        q: 'Where does my file go?',
        a: 'Nowhere. The PDF is read locally and is never uploaded, so we cannot store it or pass it on.',
      },
      {
        q: 'Why does text become editable in Word?',
        a: 'In a PDF every glyph is pinned to a coordinate. The converter groups glyphs into lines and paragraphs, which produces ordinary editable text.',
      },
    ],
  },

  'compress-pdf': {
    intro: [
      'PDF size grows with scans and photos: a single phone-shot page can weigh 3–5 MB. Compression rebuilds each page as a JPEG at the quality and scale you pick, so the file shrinks several times while the text stays readable on screen and in print.',
      'The tool runs offline inside the tab. If the rebuilt file turns out larger than the original (common with light, mostly-text PDFs), the service honestly returns the original unchanged and tells you so.',
    ],
    useCases: [
      {
        title: 'Email and messengers',
        text: 'Mail services cap attachments at 10–25 MB. A 30 MB scan will not attach; after compression it fits easily.',
      },
      {
        title: 'Portal uploads',
        text: 'Government services, banks and universities often ask for PDFs under 5 MB. Three presets help you stay under the limit.',
      },
      {
        title: 'Websites and decks',
        text: 'Heavy PDFs load slowly for visitors. A compressed copy opens faster and saves mobile data.',
      },
    ],
    steps: [
      {
        title: 'Pick a preset',
        text: '"Strong — for screen" shrinks the most, "Medium" balances size and quality, "Gentle — for print" keeps high resolution.',
      },
      {
        title: 'Add the PDF',
        text: 'Drop a file up to 100 MB and 200 pages into the window.',
      },
      {
        title: 'Compare the sizes',
        text: 'After processing you see the original and the result. If there is no gain, the original is downloaded.',
      },
      {
        title: 'Download and check',
        text: 'Open the result and scroll through: text should read cleanly; for printing choose the gentle preset.',
      },
    ],
    example: {
      title: 'Example: an 18-page scanned contract',
      text: 'The original is 27 MB, photographed on a phone. The medium preset yields about 4–6 MB: clause numbers and signatures stay readable. Use gentle for printing and strong for a quick messenger attachment.',
    },
    tips: [
      {
        title: 'Compress a copy',
        text: 'Rebuilding is irreversible: you cannot get the original quality back. Keep the source until you are happy with the result.',
      },
      {
        title: 'Vector-only PDFs',
        text: 'If the document is pure text and lines (an invoice from accounting software, say), compression may not help because pages become images. Leaving it as is may be better.',
      },
    ],
    limits:
      'Compression does not keep the text layer: rebuilt pages are images, so text search stops working. Internal links and interactive elements are lost too — keep an uncompressed original for your archive.',
    faq: [
      {
        q: 'How much smaller will it get?',
        a: 'It depends on content. Scans and photos shrink 3–10 times; light text PDFs barely change, and then the original is returned.',
      },
      {
        q: 'Will the text get blurry?',
        a: 'The gentle preset is built for print and stays crisp. "Strong" softens fine detail in exchange for the smallest file.',
      },
      {
        q: 'Will other programs still open it?',
        a: 'Yes, it is a normal PDF with page images. Only automatic text recognition stops working, since the text layer is gone.',
      },
    ],
  },

  'pdf-editor': {
    intro: [
      'The editor opens a PDF as a stack of pages and lets you fix it without conversion: correct a typo, cover an unwanted signature, insert a photo or a blank sheet, erase comments and stamps left by others. All of it happens in the browser, so the document stays on your device.',
      'Pages are listed on the left, the canvas is in the middle and the properties of the selected object are on the right. The result is assembled into a real PDF, not a flat image.',
    ],
    useCases: [
      {
        title: 'A typo in a finished file',
        text: 'One letter is wrong and the source is gone. Select the text inside the PDF and type the correct version.',
      },
      {
        title: 'Hide what should not be there',
        text: 'Remove someone else’s signature, a "draft" stamp or a colleague’s comment without touching the rest of the page.',
      },
      {
        title: 'Add a page',
        text: 'Insert a blank sheet for notes, a photo of a receipt or a scanned annex to a contract.',
      },
    ],
    steps: [
      {
        title: 'Open the editor',
        text: 'Upload a PDF up to 100 MB at /editor. The first page appears within seconds because the file is read locally.',
      },
      {
        title: 'Select an object',
        text: 'Click text, a picture or a mark. Font, size, colour and position appear on the right; zoom with the wheel or the buttons.',
      },
      {
        title: 'Make the changes',
        text: 'Fix text, insert a photo, add a blank page or erase annotations. Every action can be undone.',
      },
      {
        title: 'Download the PDF',
        text: 'Press "Download PDF" and the editor assembles a new file with your edits. The original stays with you.',
      },
    ],
    example: {
      title: 'Example: a contract with wrong bank details',
      text: 'The account number in the PDF is wrong. Open it in the editor, select the line, type the correct digits in the same font and size, download. All other pages, signatures and stamps remain in place.',
    },
    tips: [
      {
        title: 'Not everything is text',
        text: 'In a scanned PDF the "text" is a picture. You cannot edit it, but you can cover it with a white block and type over it.',
      },
      {
        title: 'Watch the font',
        text: 'The editor offers similar fonts. If a line looks off, adjust the size manually to match neighbouring lines.',
      },
    ],
    limits:
      'The editor does not replace desktop Acrobat: it does not create forms, does not sign documents digitally and does not OCR scans. It is built for spot edits: text, images, pages and marks.',
    faq: [
      {
        q: 'Can I edit a scan?',
        a: 'Not directly — a scan has no text layer. You can erase marks, cover areas, type on top, or run OCR first.',
      },
      {
        q: 'How many pages can it handle?',
        a: 'Up to 200 pages and 100 MB, a sensible browser limit. Larger files open more slowly.',
      },
      {
        q: 'Is quality preserved?',
        a: 'Yes. Pages are not re-compressed into images: text and graphics stay as they were in the source PDF.',
      },
    ],
  },

  'extract-images': {
    intro: [
      'A PDF carries separate images inside it: product photos, diagrams, logos, scanned stamps. Extraction pulls them out at their original resolution and packs them into a ZIP — no screenshots, no cropping, no quality loss.',
      'The tool finds embedded raster images instead of re-rendering pages. You get exactly the files that were placed in the document, with their real dimensions and format (JPEG, PNG, TIFF).',
    ],
    useCases: [
      {
        title: 'Images from a catalogue',
        text: 'You need the pictures from a price list or product catalogue for a website — grab them in bulk instead of screenshotting one by one.',
      },
      {
        title: 'Slide material',
        text: 'Diagrams and charts from a report or article: an archive of images beats cropping each area by hand.',
      },
      {
        title: 'Scans and stamps',
        text: 'Pull individual images out of a multi-page scanned PDF for archiving or checking.',
      },
    ],
    steps: [
      {
        title: 'Add PDFs',
        text: 'Drop one file or several at once (up to 10 files and 200 pages in total). Each may be up to 100 MB.',
      },
      {
        title: 'Wait for the scan',
        text: 'The browser walks the pages and collects embedded images; progress is shown in the bar.',
      },
      {
        title: 'Take the archive',
        text: 'All found images download as one ZIP. With several PDFs the archive contains a folder per file.',
      },
      {
        title: 'Check the result',
        text: 'If no archive is produced, the PDF has no raster images — only text and vector graphics. The service says so in the window.',
      },
    ],
    example: {
      title: 'Example: a 40-page catalogue',
      text: 'The PDF holds 120 product photos. Extraction returns an archive with 120 files at the same sizes as in the catalogue, with no re-compression. Rendering the pages as images would give lower quality and one file per page.',
    },
    tips: [
      {
        title: 'Vector artwork',
        text: 'Logos and charts drawn with lines are not images and cannot be extracted. Use PDF to JPG for those, which renders the whole page.',
      },
      {
        title: 'Duplicates',
        text: 'The same logo on every page may appear several times — the tool extracts what is really inside the file.',
      },
    ],
    limits:
      'The tool does not extract text, tables or vector graphics, does not recognise image contents, and cannot recover images that were flattened into a page when a PDF was compressed.',
    faq: [
      {
        q: 'Why is the archive empty?',
        a: 'The document contains no embedded raster images — only text, lines and diagrams. Use PDF to JPG to get page images instead.',
      },
      {
        q: 'Is quality lost?',
        a: 'No. Images are copied exactly as they are stored inside the PDF, without re-compression or resizing.',
      },
      {
        q: 'Can I extract from several PDFs at once?',
        a: 'Yes, up to 10 files. Each gets its own folder inside the archive so identical names do not overwrite each other.',
      },
    ],
  },

  'merge-pdf': {
    intro: [
      'Merging joins several PDFs into one document in the order they appear in the list. Pages are not re-compressed: text, images and links stay exactly as in the originals.',
      'It helps when a document arrives in pieces: the contract, its annexes and a separate scan of the signatures. Instead of three attachments you send one tidy file.',
    ],
    useCases: [
      {
        title: 'Contract with annexes',
        text: 'Main text, specification and signature scan in one PDF in the right order.',
      },
      {
        title: 'Report in parts',
        text: 'Each chapter was saved separately — assemble them into one document before sending.',
      },
    ],
    steps: [
      {
        title: 'Add the files',
        text: 'Drop several PDFs at once. The order in the list becomes the order of pages.',
      },
      {
        title: 'Check the list',
        text: 'Remove extras and arrange files the way chapters or sections should follow.',
      },
      {
        title: 'Merge',
        text: 'Press "Merge into one PDF" and wait for processing to finish.',
      },
      {
        title: 'Download',
        text: 'The result saves immediately; the originals are untouched.',
      },
    ],
    tips: [
      {
        title: 'Mixed page sizes',
        text: 'A4 and A5 can be merged; every sheet keeps its own size, which matters when printing.',
      },
      {
        title: 'Numbering',
        text: 'Page numbers inside files are not recalculated — add continuous numbering after merging.',
      },
    ],
    faq: [
      {
        q: 'Are links preserved?',
        a: 'Internal and cross-page links are kept. Bookmarks from different files are not merged into one tree.',
      },
      {
        q: 'Can I merge password-protected PDFs?',
        a: 'Open and re-save such a file without protection first, otherwise the browser cannot read its pages.',
      },
    ],
  },

  'split-pdf': {
    intro: [
      'Splitting cuts a PDF into parts by page ranges. The tasks are simple: give each department its own pages, pull an annex out of a long report, drop the extra sheets.',
      'Pages are copied, not redrawn, so nothing loses quality.',
    ],
    useCases: [
      {
        title: 'Documents by department',
        text: 'From a shared PDF of requests each team needs only its pages — cut the file by ranges.',
      },
      {
        title: 'Just one chapter',
        text: 'A single chapter of a 100-page manual: save it as a separate file.',
      },
    ],
    steps: [
      {
        title: 'Open the PDF',
        text: 'Add a document up to 200 pages; the total page count appears right away.',
      },
      {
        title: 'Set ranges',
        text: 'For example "1-3, 5" gives a three-page part and a separate page five. Each range becomes its own PDF.',
      },
      {
        title: 'Run the split',
        text: 'Press the button and wait. Several parts arrive as an archive.',
      },
      {
        title: 'Download',
        text: 'Ready PDFs save immediately and the source stays unchanged.',
      },
    ],
    tips: [
      {
        title: 'Range syntax',
        text: 'Separate numbers with commas and use a hyphen for ranges. Spaces are fine and order does not matter.',
      },
      {
        title: 'Empty ranges',
        text: 'If a range starts past the last page the service warns you — double-check the numbers.',
      },
    ],
    faq: [
      {
        q: 'Can I split into single pages?',
        a: 'Yes, with ranges like "1,2,3" for small documents. For long files "Extract pages" and PDF to JPG are handier.',
      },
      {
        q: 'Is quality lost?',
        a: 'No: pages are copied without re-compression and text stays text.',
      },
    ],
  },

  'jpg-to-pdf': {
    intro: [
      'Photos and scans saved as JPG or PNG are often required as PDF: banks, universities and government portals accept only that. The tool places each image on its own page and builds a single document.',
      'Choose A4, Letter or "image size" pages. The last option gives a PDF without margins or extra white space.',
    ],
    useCases: [
      {
        title: 'Passport or certificate scan',
        text: 'A few phone photos become one tidy PDF ready to send.',
      },
      {
        title: 'Portfolio and artwork',
        text: 'A series of images is collected into a document with consistent page size.',
      },
    ],
    steps: [
      {
        title: 'Choose page size',
        text: 'A4 for printing and documents, Letter for the US, "image size" for no margins.',
      },
      {
        title: 'Add the images',
        text: 'Select many JPG and PNG files at once; they keep the order you add them in.',
      },
      {
        title: 'Build the PDF',
        text: 'Press "Build PDF" and wait — images are not re-compressed.',
      },
      {
        title: 'Download',
        text: 'The PDF saves immediately and your photos stay where they are.',
      },
    ],
    tips: [
      {
        title: 'Order matters',
        text: 'Check the sequence before building: reordering pages in a finished PDF is harder.',
      },
      {
        title: 'Orientation',
        text: 'A sideways photo stays sideways: rotate it before upload or turn the page in the editor.',
      },
    ],
    faq: [
      {
        q: 'Is PNG supported?',
        a: 'Yes, JPG and PNG. PNG transparency is filled with white, as it would be in print.',
      },
      {
        q: 'Is photo quality reduced?',
        a: 'No, images are embedded without re-compression. The resulting file is roughly the sum of the source images.',
      },
    ],
  },

  'pdf-to-jpg': {
    intro: [
      'PDF to JPG renders every page as an image at the quality you choose. It is useful when a PDF cannot be opened on another device, or when a page has to go into a messenger or a slide.',
      'All pages are packed into a ZIP. Text in the image stays readable but is no longer text, so it cannot be edited or searched.',
    ],
    useCases: [
      {
        title: 'Document preview',
        text: 'The first page as a picture makes a good cover for a product card or an email.',
      },
      {
        title: 'Social media',
        text: 'A PDF page becomes a JPG ready for a post or a story without extra software.',
      },
    ],
    steps: [
      {
        title: 'Pick the quality',
        text: '"Compact" for quick sharing, "Normal" for screens, "Maximum" for print and large displays.',
      },
      {
        title: 'Add the PDF',
        text: 'Drop a document of up to 200 pages into the window.',
      },
      {
        title: 'Wait for rendering',
        text: 'Pages are drawn one by one and progress appears in the bar.',
      },
      {
        title: 'Download the archive',
        text: 'The ZIP contains files like "page-1.jpg", "page-2.jpg" and so on.',
      },
    ],
    tips: [
      {
        title: 'Archive size',
        text: 'At maximum quality a 100-page document can run to hundreds of megabytes. Use "Compact" for sharing.',
      },
      {
        title: 'Need the text?',
        text: 'If you need the words later they must be recognised separately: a JPG keeps no text layer.',
      },
    ],
    faq: [
      {
        q: 'Can I get PNG instead?',
        a: 'The output is JPG for now: smaller and enough for most tasks. PDF pages rarely need transparency.',
      },
      {
        q: 'Which scale should I use?',
        a: 'Normal is fine for reading on screen; maximum suits printing or enlarging the image.',
      },
    ],
  },
}
