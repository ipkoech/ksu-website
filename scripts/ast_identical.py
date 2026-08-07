#!/usr/bin/env python3
"""Prove a promotion is a PURE MOVE.

Without tests, the only real guarantee that logic is unchanged is that the code is
identical. This compares a symbol across N copies by AST (ignoring formatting,
comments, docstrings and service-name tokens) and reports whether they are the same.

  identical -> promoting is behaviour-preserving by construction
  drifted   -> the differences are printed; a human must choose, because promoting
               silently picks one service's behaviour for all four.

usage: astsame.py <symbol> <file1> <file2> ...
"""
import ast
import difflib
import re
import sys

SVC = re.compile(r"\b(main|research|library|heri_africa|heri)\b")

def norm(src: str) -> str:
    return SVC.sub("SVC", src)

def extract(path, symbol):
    with open(path) as fh:
        src = norm(fh.read())
    tree = ast.parse(src)
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and node.name == symbol:
            # strip docstring so wording differences do not register as drift
            body = node.body
            if body and isinstance(body[0], ast.Expr) and isinstance(body[0].value, ast.Constant) \
               and isinstance(body[0].value.value, str):
                node = type(node)(**{**node.__dict__, "body": body[1:]})
            return ast.dump(ast.parse(ast.unparse(node)), indent=1), ast.unparse(node)
    return None, None

symbol, paths = sys.argv[1], sys.argv[2:]
dumps = {}
for p in paths:
    d, srccode = extract(p, symbol)
    if d is None:
        print(f"  ABSENT   {p}")
    else:
        dumps[p] = (d, srccode)

if not dumps:
    print(f"'{symbol}' not found in any file"); sys.exit(1)

first = next(iter(dumps))
same = [p for p, (d, _) in dumps.items() if d == dumps[first][0]]
diff = [p for p in dumps if p not in same]

print(f"symbol: {symbol}   copies found: {len(dumps)}/{len(paths)}")
print(f"  IDENTICAL ({len(same)}): " + ", ".join(p.split('/services/')[-1] for p in same))
if diff:
    print(f"  DRIFTED   ({len(diff)}): " + ", ".join(p.split('/services/')[-1] for p in diff))
    for p in diff:
        print(f"\n--- diff {first.split('/services/')[-1]} vs {p.split('/services/')[-1]} ---")
        for line in list(difflib.unified_diff(
                dumps[first][1].splitlines(), dumps[p][1].splitlines(), lineterm="", n=1))[2:22]:
            print("   " + line)
    sys.exit(2)
print("  -> pure move: promoting cannot change behaviour")
