import sys

def check_syntax(filename):
    print("Checking", filename)
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    n = len(content)
    print("File length:", n)
    stack = []
    
    i = 0
    line_no = 1
    col_no = 1
    
    def get_line_col(pos):
        l = content[:pos].count('\n') + 1
        last_nl = content[:pos].rfind('\n')
        c = pos - last_nl if last_nl != -1 else pos + 1
        return l, c

    brace_count = 0
    paren_count = 0
    bracket_count = 0

    while i < n:
        char = content[i]
        
        if char == '\n':
            line_no += 1
            col_no = 1
            i += 1
            continue
        
        # Skip single line comments
        if i + 1 < n and content[i:i+2] == '//':
            i += 2
            while i < n and content[i] != '\n':
                i += 1
            continue
            
        # Skip multi-line comments
        if i + 1 < n and content[i:i+2] == '/*':
            i += 2
            while i < n:
                if i + 1 < n and content[i:i+2] == '*/':
                    i += 2
                    break
                i += 1
            continue
            
        # Skip strings
        if char in ["'", '"', '`']:
            quote_type = char
            i += 1
            escaped = False
            while i < n:
                curr = content[i]
                if curr == '\n' and quote_type != '`':
                    break
                if escaped:
                    escaped = False
                elif curr == '\\':
                    escaped = True
                elif curr == quote_type:
                    i += 1
                    break
                i += 1
            continue
            
        # Track brackets
        if char == '(':
            paren_count += 1
            stack.append((char, i))
        elif char == '{':
            brace_count += 1
            stack.append((char, i))
        elif char == '[':
            bracket_count += 1
            stack.append((char, i))
        elif char in [')', '}', ']']:
            if not stack:
                l, c = get_line_col(i)
                print(f"Extra closing character '{char}' at line {l}, col {c}")
            else:
                expected_opener = {'}': '{', ')': '(', ']': '['}[char]
                opener, op_pos = stack.pop()
                if opener != expected_opener:
                    l, c = get_line_col(i)
                    op_l, op_c = get_line_col(op_pos)
                    print(f"Mismatched closing character '{char}' at line {l}, col {c}. Expected matching for '{opener}' from line {op_l}, col {op_c}")
                    stack.append((opener, op_pos)) # restore
        
        i += 1
        col_no += 1

    print(f"Total processed: parens={paren_count}, braces={brace_count}, brackets={bracket_count}")
    if stack:
        print(f"Unclosed brackets/braces remaining at end of file: {len(stack)}")
        for op, pos in stack[-10:]:
            l, c = get_line_col(pos)
            print(f"  '{op}' opened at line {l}, col {c}")
    else:
        print("No unmatched brackets found!")

if __name__ == '__main__':
    check_syntax('app.js')
