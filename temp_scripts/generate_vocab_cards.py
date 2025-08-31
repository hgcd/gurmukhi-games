#!/usr/bin/env python3
"""
Generate vocabulary cards for printing on 8.5x11 paper.
Creates a single HTML page with multiple sections and download functionality.
"""

import json
import os
from pathlib import Path

def load_vocab_data():
    """Load vocabulary data from the JSON file."""
    data_path = Path("data/learn_data/vocabulary_terms_v0.json")
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find {data_path}")
        return None
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {data_path}")
        return None

def filter_valid_vocab(vocab_data):
    """Filter vocabulary items that have all required fields."""
    valid_items = []
    
    for i, item in enumerate(vocab_data):
        if i % 100 == 0:
            print(f"Processing item {i} of {len(vocab_data)}")
        
        # Check if all required fields exist and are not empty
        if (item.get('image') and 
            item.get('english') and 
            item.get('punjabi_gurmukhi') and
            item['image'].strip() and
            item['english'].strip() and
            item['punjabi_gurmukhi'].strip()):
            valid_items.append(item)
    
    print(f"Found {len(valid_items)} valid vocabulary items out of {len(vocab_data)} total")
    return valid_items

def create_card_html(item):
    """Create HTML for a single vocabulary card."""
    firstLetter = item['punjabi_gurmukhi'][0] + ('਼' if item['punjabi_gurmukhi'][1] == '਼' else '');
    return f"""
    <div class="border border-dark border-3 rounded-3 p-2" style="width: 240px; height: 320px;">
        <div>
            <h1>{firstLetter}</h1>
        </div>
        <div class="card-image bg-white my-2 d-flex justify-content-center">
            <img src="{item['image']}" alt="{item['english']}" style="width: 80%;border-radius: 10px;object-fit: contain;"/>
        </div>
        <div>
            <h4 class="text-center">{item['punjabi_gurmukhi']}</h4>
            <h5 class="text-center text-muted">{item['english']}</h5>
        </div>
    </div>
    """

def create_page_section_html(cards_html, page_num):
    """Create HTML for a single page section with 8 cards."""
    return f"""
    <div class="page-section" id="page-{page_num}">
        <div class="page-header">Page {page_num}</div>
        <div class="page">
            {cards_html}
        </div>
    </div>
    """

def create_main_html(valid_items):
    """Create the main HTML page with all vocabulary cards."""
    # Generate cards with dynamic flexbox layout
    print(f"Generating pages with dynamic flexbox layout...")
    
    # Create all page sections
    pages_html = ""
    page_num = 1
    total_pages = 0
    
    # Process all items and create pages dynamically
    current_page_cards = ""
    cards_on_current_page = 0
    
    for i, item in enumerate(valid_items):
        if i % 10 == 0:
            print(f"Processing card {i} of {len(valid_items)}")
        
        # Add card to current page
        current_page_cards += create_card_html(item)
        cards_on_current_page += 1
        
        # Check if we should start a new page (maximum 9 cards per page)
        if cards_on_current_page >= 9:
            # Create page section HTML
            pages_html += create_page_section_html(current_page_cards, page_num)
            total_pages += 1
            page_num += 1
            
            # Reset for next page
            current_page_cards = ""
            cards_on_current_page = 0
    
    # Add remaining cards to final page
    if current_page_cards:
        pages_html += create_page_section_html(current_page_cards, page_num)
        total_pages += 1
    
    print(f"Generated {total_pages} pages with dynamic layout")
    
    # Create page options for dropdown
    page_options = ""
    for i in range(total_pages):
        page_options += f'<option value="{i+1}">Page {i+1}</option>'
    
    # Create the complete HTML page by concatenating parts
    html_parts = [
        """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vocabulary Cards - All Pages</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Anek+Gurmukhi:wght@100..800&family=Braah+One&family=Langar&family=Noto+Sans+Gurmukhi:wght@100..900&family=Tiro+Gurmukhi:ital@0;1&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            font-family: 'Fredoka One', 'Braah One';
        }
        
        .controls {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        .download-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 5px;
        }
        
        .download-btn:hover {
            background: #0056b3;
        }
        
        .download-btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }
        
        .page-section {
            margin-bottom: 40px;
            page-break-after: always;
        }
        
        .page-header {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #333;
        }
        
        .page {
            width: 8.5in;
            min-height: 11in;
            margin: 0 auto;
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
            gap: 0.15in;
            padding: 0.25in;
            background: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            box-sizing: border-box;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .controls {
                display: none;
            }
            
            .page-section {
                page-break-after: always;
                margin-bottom: 0;
            }
            
            .page {
                box-shadow: none;
                border: 1px solid #ccc;
            }
        }
    </style>
</head>
<body>
    <div class="controls">
        <h3>Download Options</h3>
        <button class="download-btn" onclick="downloadAllPages()">Download All Pages</button>
        <button class="download-btn" onclick="downloadCurrentPage()">Download Current Page</button>
        <div style="margin-top: 10px;">
            <label for="pageSelect">Select Page:</label>
            <select id="pageSelect" onchange="scrollToPage(this.value)">""",
        page_options,
        """</select>
        </div>
    </div>
    
    """,
        pages_html,
        """
    
    <script>
        function downloadAllPages() {
            const downloadBtn = event.target;
            downloadBtn.disabled = true;
            downloadBtn.textContent = 'Downloading...';
            
            const pages = document.querySelectorAll('.page-section');
            let downloadedCount = 0;
            
            pages.forEach((page, index) => {
                setTimeout(() => {
                    downloadPage(page, index + 1);
                    downloadedCount++;
                    
                    if (downloadedCount === pages.length) {
                        downloadBtn.disabled = false;
                        downloadBtn.textContent = 'Download All Pages';
                    }
                }, index * 1000); // 1 second delay between downloads
            });
        }
        
        function downloadCurrentPage() {
            const currentPage = getCurrentVisiblePage();
            if (currentPage) {
                const pageNum = currentPage.querySelector('.page-header').textContent.replace('Page ', '');
                downloadPage(currentPage, pageNum);
            }
        }
        
        function downloadPage(pageElement, pageNum) {
            const pageContent = pageElement.querySelector('.page');
            
            html2canvas(pageContent, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 816, // 8.5 inches * 96 DPI
                height: 1056 // 11 inches * 96 DPI
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `vocab_cards_page_${pageNum.toString().padStart(2, '0')}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.click();
            });
        }
        
        function getCurrentVisiblePage() {
            const pages = document.querySelectorAll('.page-section');
            const windowHeight = window.innerHeight;
            const windowTop = window.pageYOffset;
            
            for (let page of pages) {
                const rect = page.getBoundingClientRect();
                if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
                    return page;
                }
            }
            return pages[0];
        }
        
        function scrollToPage(pageNum) {
            const page = document.getElementById(`page-${pageNum}`);
            if (page) {
                page.scrollIntoView({ behavior: 'smooth' });
            }
        }
        
        // Auto-scroll to first page on load
        window.addEventListener('load', () => {
            setTimeout(() => {
                scrollToPage(1);
            }, 500);
        });
    </script>
</body>
</html>"""
    ]
    
    return ''.join(html_parts), total_pages

def generate_vocab_cards():
    """Main function to generate vocabulary cards."""
    # Create output directory
    output_dir = Path("data/learn_data/vocab_cards_output")
    output_dir.mkdir(exist_ok=True)
    
    # Load vocabulary data
    vocab_data = load_vocab_data()
    if not vocab_data:
        return
    
    # Filter valid vocabulary items
    valid_items = filter_valid_vocab(vocab_data)
    if not valid_items:
        print("No valid vocabulary items found!")
        return
    
    # Generate the main HTML page
    main_html, total_pages = create_main_html(valid_items)
    
    # Save the main HTML file
    output_file = output_dir / "vocab_cards_all_pages.html"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(main_html)
    
    print(f"\nVocabulary cards generated successfully!")
    print(f"Output file: {output_file.absolute()}")
    print(f"Total cards: {len(valid_items)}")
    print(f"Total cards: {len(valid_items)}")
    print(f"Cards per page: max 9 (flexbox layout)")
    print(f"Total pages: {total_pages}")
    print(f"\nFeatures:")
    print(f"- Multiple pages with flexbox layout")
    print(f"- Dynamic card arrangement within each page")
    print(f"- Download individual pages as JPEG")
    print(f"- Download all pages automatically")
    print(f"- Print-friendly layout")
    print(f"- Page navigation controls")

if __name__ == "__main__":
    generate_vocab_cards()
