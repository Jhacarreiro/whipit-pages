import tokenize
from io import BytesIO

def classify_code_lines(code_str: str):
    lines = code_str.splitlines()
    line_types = ["other"] * len(lines)

    tokens = tokenize.tokenize(BytesIO(code_str.encode("utf-8")).readline)
    for token in tokens:
        if token.type == tokenize.NAME:
            line_idx = token.start[0] - 1
            word = token.string

            if word in ("def", "class"):
                line_types[line_idx] = "block"
            elif word in ("if", "else", "elif", "for", "while", "try", "except"):
                line_types[line_idx] = "condition"
            elif word in ("return", "yield", "raise", "break", "continue"):
                line_types[line_idx] = "exit"
        elif token.type == tokenize.COMMENT:
            line_idx = token.start[0] - 1
            line_types[line_idx] = "comment"
        elif token.type == tokenize.STRING:
            line_idx = token.start[0] - 1
            if line_types[line_idx] == "other":
                line_types[line_idx] = "docstring"

    return list(zip(lines, line_types))
