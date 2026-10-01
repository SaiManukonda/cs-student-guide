# Practice case bank

The shipped bank contains 1,915 deterministic cases across all 75 problems (24–26 each). The first case remains the displayed example. Submit runs the entire suite; Run example runs only the first case.

Coverage includes empty inputs where supported by this site's original contract, singleton inputs, duplicates, zeroes, negative values, ordering, unreachable states, graph connectivity/cycles, sparse and skewed trees, matrix dimensions, overlapping intervals, repeated prefixes, codec separators/escapes, integer boundaries, and longer operation sequences.

Stress cases are bounded for the shared compiler: examples include 2,000-element arrays, 1,000-character palindrome/LCS inputs, coin amounts of 10,000, 511-node trees, 1,000-node graphs/lists, and hundreds of data-structure operations. Some problem-specific maximum sizes and scalar limits are covered. These are not an exhaustive reproduction of LeetCode's private tests or a formal complexity benchmark; the compiler's time/output limits apply to the whole submission.

## Maintenance

- `node tests/generate-practice-cases.mjs --write` deterministically regenerates the bank with a fixed seed. It preserves and independently checks the four original fixtures per problem, then adds named edge, generated, and stress cases.
- `node tests/practice.mjs` checks the catalog, graders, representative solutions, invalid outputs, and alternate valid answers.
- `node tests/practice-expanded.mjs` checks input/output adapters, independent brute-force oracles, mutation detection, output/source budgets, Python syntax for every problem, and representative Java/Python/C++ compilation/execution. Requires Python 3, a JDK, and Clang. It runs only trusted test-authored code in temporary files, never submitted user code.

Reference implementations in this directory are test-only and do not ship to the client. Generated inputs and expected outputs live in `app/practice-data/problems.json`; these are practice cases, not secret contest tests. Failed results name the case so students can identify the scenario.

Java runs each case in a separate method to avoid the JVM's per-method bytecode limit as suites grow. Every case still creates a fresh solution/data-structure instance.
