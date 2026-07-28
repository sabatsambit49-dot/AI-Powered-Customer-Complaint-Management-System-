from app.services.document_parser import parse_document

def test_parse_plain_text():
    text_bytes = b"Product: Paracetamol 500mg\nBatch: TAB-101\nDefect: Cracked tablets"
    result = parse_document(text_bytes, "complaint.txt")
    assert "Paracetamol 500mg" in result
    assert "TAB-101" in result

def test_parse_eml_file():
    eml_bytes = (
        b"From: Dr. Smith <smith@hospital.org>\n"
        b"To: QA <qa@pharma.com>\n"
        b"Subject: Quality Complaint - Batch #CFT-9082\n"
        b"Date: Mon, 27 Jul 2026 10:00:00 +0000\n\n"
        b"Foreign particulate observed in vial."
    )
    result = parse_document(eml_bytes, "complaint.eml")
    assert "Foreign particulate observed in vial" in result
    assert "smith@hospital.org" in result
