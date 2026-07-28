from groq import Groq
from app.core.config import settings
from app.models.complaint import Complaint

def generate_chat_response(message: str, complaint_data: dict, chat_history: list = None) -> str:
    """
    Generates a conversational response regarding a specific loaded complaint.
    """
    if not settings.GROQ_API_KEY:
        return f"Assisting with complaint '{complaint_data.get('product_name', 'item')}': {message}"

    client = Groq(api_key=settings.GROQ_API_KEY)

    system_prompt = f"""You are the AI Quality Intake Assistant for a Pharmaceutical Quality Assurance System (API & FDF Quality Management).
You are currently assisting a QA reviewer with a specific customer complaint record:

LOADED COMPLAINT SUMMARY:
- Complaint Number: {complaint_data.get('complaint_number', 'Draft')}
- Product Name: {complaint_data.get('product_name', 'N/A')}
- Strength / Grade: {complaint_data.get('product_strength_grade', 'N/A')}
- Batch / Lot Number: {complaint_data.get('batch_lot_number', 'N/A')}
- Initial Severity: {complaint_data.get('initial_severity', 'N/A')} (Priority: {complaint_data.get('priority', 'N/A')})
- Complaint Type: {complaint_data.get('complaint_type', 'N/A')}
- Customer: {complaint_data.get('customer_name', 'N/A')}
- Description: {complaint_data.get('detailed_description', 'N/A')}
- Severity Justification: {complaint_data.get('severity_justification', 'N/A')}
- Root Cause Category: {complaint_data.get('root_cause_category', 'N/A')}
- CAPA Recommendation: {complaint_data.get('capa_recommendation', 'N/A')}
- Regulatory Flag: {complaint_data.get('regulatory_reporting_flag', 'N/A')}

Answer the user's questions clearly, concisely, and professionally from a Pharma QA / cGMP perspective.
"""

    messages = [{"role": "system", "content": system_prompt}]
    
    if chat_history:
        for msg in chat_history[-6:]:
            messages.append({"role": msg.sender, "content": msg.content})

    messages.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            messages=messages,
            model=settings.REASONING_MODEL,
            temperature=0.3,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"I analyzed your query regarding {complaint_data.get('product_name', 'this complaint')}. Detail: {str(e)}"
