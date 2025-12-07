import re

def rule_based_summarize(text: str) -> str:
 
    if not text:
        return "The entry is empty and cannot be summarized."

    # 1. Use re.split to break text into sentences based on standard punctuation
    sentences = re.split(r'[.!?]+\s*', text)
    
    sentences = [s.strip() for s in sentences if s.strip()]

    # 2. Take the first three sentences
    summary_sentences = sentences[:3]
    
    # 3. Rejoin the sentences to form the summary, ensuring each one ends with a period
    summary = ""
    for sentence in summary_sentences:
        if sentence and sentence[-1] not in ('.', '!', '?'):
            summary += sentence + ". "
        else:
            summary += sentence + " "
            
    return summary.strip()