import PyPDF2

# Extract text from PDF
with open('user_input_files/School Financial App Blueprint.pdf', 'rb') as f:
    pdf_reader = PyPDF2.PdfReader(f)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n\n"
    
with open('tmp/blueprint.txt', 'w') as f:
    f.write(text)

print(f"Extracted {len(pdf_reader.pages)} pages from PDF")
print("\nFirst 1500 characters:")
print(text[:1500])
