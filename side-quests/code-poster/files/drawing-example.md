# The circle-drawing experiment

Code and process draft · 2025-05-28

English translation of the Portuguese source. An illustrative pipeline, including random placement. This is source text, not the final poster.

---

### 1. **Prepare the code**
Input: a `.py` file or source text in a `.txt` file.

```python
# A simple example of reading the code
with open("your_code.py", "r") as f:
    lines = f.readlines()
```

---

### 2. **Analyse the code to extract its structure**
Regular expressions or Python's `tokenize` module can detect `def`, `if`, `for`, `return`, etc.

```python
import tokenize
from io import BytesIO

code = ''.join(lines)
tokens = list(tokenize.tokenize(BytesIO(code.encode('utf-8')).readline))
```

Assign a “weight” or “type” to each line based on its token type:
- `def`, `class` = main node
- `if`, `else`, `elif`, `for`, `while` = condition
- `return`, `yield` = exit
- `#` or docstring = comment
- others = instructions

---

### 3. **Generate shapes or colours from that analysis**
Each line can map to a visual object: for example, a circle whose radius depends on the line's length and whose colour depends on the instruction type.

```python
import matplotlib.pyplot as plt
import random

fig, ax = plt.subplots(figsize=(20, 20))
ax.set_facecolor("black")
ax.axis("off")

y = 0
for i, line in enumerate(lines):
    length = len(line.strip())
    radius = length * 0.1
    colour = plt.cm.viridis(random.random())

    ax.add_patch(plt.Circle((random.uniform(0, 100), y), radius, color=colour, alpha=0.6))
    y += 1.5

plt.savefig("code_poster.png", dpi=300, bbox_inches="tight")
```

Possible extensions to this example:
- Colours by token type.
- Shapes that connect to one another, such as lines and curves.
- Symmetrical patterns.

---

### 4. **Adjust the artistic style**
Explore these options:
- Replace `plt.Circle` with `plt.Rectangle`, `plt.Polygon`, etc.
- Use libraries such as:
  - `turtle` for a more minimal, hand-drawn style.
  - `p5`, the Python port of p5.js.
  - `cairo` or `svgwrite` for exportable vectors.
- Export to `.svg` or `.pdf` for high-quality printing.
