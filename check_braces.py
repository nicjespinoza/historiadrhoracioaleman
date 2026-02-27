
import sys

def check_braces(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    stack = []
    for i, char in enumerate(content):
        if char in '{[(':
            stack.append(char)
        elif char in '}])':
            if not stack:
                print(f"Unmatched closing brace '{char}' at index {i}")
                return False
            last = stack.pop()
            if (char == '}' and last != '{') or \
               (char == ']' and last != '[') or \
               (char == ')' and last != '('):
                print(f"Mismatched brace '{char}' at index {i}, expected closing for '{last}'")
                return False

    if stack:
        print(f"Unclosed braces: {stack}")
        return False

    print("Braces are balanced.")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = r"c:\Users\HP\Historia Clinica 2026\Historia-Clinica\src\screens\PatientHistoryScreen.tsx"
    
    check_braces(file_path)
