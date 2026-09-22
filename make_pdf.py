"""
Generate a Unicode-safe PDF from a UTF-8 Tamil text file.
Uses Nirmala UI (ships with Windows 10/11). Extracted text is clean Tamil.
"""
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT

FONT_PATH = r"C:\Windows\Fonts\Nirmala.ttf"
pdfmetrics.registerFont(TTFont("NirmalaUI", FONT_PATH))

def make_pdf(input_txt: str, output_pdf: str):
    with open(input_txt, "r", encoding="utf-8") as f:
        text = f.read()

    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=20 * mm, bottomMargin=20 * mm,
        title="Association Meeting Minutes & Resolutions",
    )

    # Body style — Tamil-safe line spacing
    body = ParagraphStyle(
        name="TamilBody",
        fontName="NirmalaUI",
        fontSize=11,
        leading=18,
        alignment=TA_LEFT,
    )

    flow = []
    # Break input into paragraphs on blank lines so line breaks survive
    for para in text.split("\n\n"):
        para = para.strip()
        if not para:
            continue
        # Escape XML chars; convert single newlines to <br/> so line breaks render
        safe = (para.replace("&", "&amp;")
                     .replace("<", "&lt;")
                     .replace(">", "&gt;")
                     .replace("\n", "<br/>"))
        flow.append(Paragraph(safe, body))
        flow.append(Spacer(1, 6))

    doc.build(flow)
    print(f"✅ Wrote {output_pdf}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: py make_pdf.py input.txt output.pdf")
        sys.exit(1)
    make_pdf(sys.argv[1], sys.argv[2])