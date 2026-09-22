import logging
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

logger = logging.getLogger("app.ocr")

# Windows path to Tesseract (adjust if you installed elsewhere)
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_with_ocr(pdf_bytes: bytes) -> str:
    """Render each PDF page to an image and OCR it with Tamil language."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_chunks = []
        
        for page_num, page in enumerate(doc):
            # Render page at 300 DPI for good OCR accuracy
            pix = page.get_pixmap(dpi=300)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            
            # OCR with Tamil + English (for mixed content like "BATCH", numbers)
            text = pytesseract.image_to_string(img, lang="tam+eng")
            if text.strip():
                text_chunks.append(text)
            
            logger.info(f"OCR page {page_num + 1}: extracted {len(text)} chars")
        
        doc.close()
        return "\n".join(text_chunks).strip()
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        return ""