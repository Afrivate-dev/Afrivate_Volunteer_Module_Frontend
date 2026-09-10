"""One-off: Documentation.md -> Documentation.html for PDF printing."""
import pathlib

import markdown

ROOT = pathlib.Path(__file__).resolve().parent.parent
md_path = ROOT / "Documentation.md"
out_path = ROOT / "Documentation.html"

md = md_path.read_text(encoding="utf-8")
html_body = markdown.markdown(md, extensions=["tables", "fenced_code", "nl2br"])

full = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Documentation — Afrivate Volunteer Module</title>
  <style>
    body {{ font-family: "Segoe UI", Arial, sans-serif; margin: 2cm; line-height: 1.45; color: #222; }}
    h1 {{ color: #6A00B1; border-bottom: 2px solid #6A00B1; padding-bottom: 8px; }}
    h2 {{ margin-top: 1.4em; font-size: 1.15em; }}
    table {{ border-collapse: collapse; width: 100%; font-size: 10pt; margin: 12px 0; }}
    th, td {{ border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }}
    code {{ font-size: 0.9em; background: #f5f5f5; padding: 2px 4px; }}
    hr {{ border: none; border-top: 1px solid #ddd; margin: 24px 0; }}
    @media print {{ body {{ margin: 1.5cm; }} }}
  </style>
</head>
<body>
{html_body}
</body>
</html>
"""

out_path.write_text(full, encoding="utf-8")
print("Wrote", out_path)
