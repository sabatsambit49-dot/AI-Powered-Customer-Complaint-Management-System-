import io
import email
from email import policy
import pypdf
import docx

def parse_document(file_bytes: bytes, file_name: str) -> str:
    """
    Extracts raw text from uploaded document files (PDF, DOCX, EML, TXT).
    """
    ext = file_name.split('.')[-1].lower() if '.' in file_name else ''

    if ext == 'pdf':
        return parse_pdf(file_bytes)
    elif ext in ['docx', 'doc']:
        return parse_docx(file_bytes)
    elif ext in ['eml', 'msg']:
        return parse_eml(file_bytes)
    else:
        # Default to plain text decoding
        try:
            return file_bytes.decode('utf-8')
        except UnicodeDecodeError:
            return file_bytes.decode('latin-1', errors='ignore')


def parse_pdf(file_bytes: bytes) -> str:
    try:
        pdf_file = io.BytesIO(file_bytes)
        reader = pypdf.PdfReader(pdf_file)
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        return "\n\n".join(text_parts)
    except Exception as e:
        return f"[PDF Extraction Error: {str(e)}]"


def parse_docx(file_bytes: bytes) -> str:
    try:
        doc_file = io.BytesIO(file_bytes)
        document = docx.Document(doc_file)
        text_parts = [p.text for p in document.paragraphs if p.text.strip()]
        return "\n".join(text_parts)
    except Exception as e:
        return f"[DOCX Extraction Error: {str(e)}]"


def parse_eml(file_bytes: bytes) -> str:
    try:
        msg = email.message_from_bytes(file_bytes, policy=policy.default)
        subject = msg.get('subject', 'No Subject')
        from_hdr = msg.get('from', 'Unknown Sender')
        to_hdr = msg.get('to', 'Unknown Recipient')
        date_hdr = msg.get('date', '')

        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                if content_type == "text/plain":
                    body += part.get_content()
                elif content_type == "text/html" and not body:
                    body += part.get_content()
        else:
            body = msg.get_content()

        return f"From: {from_hdr}\nTo: {to_hdr}\nDate: {date_hdr}\nSubject: {subject}\n\n{body}"
    except Exception as e:
        return file_bytes.decode('utf-8', errors='ignore')
