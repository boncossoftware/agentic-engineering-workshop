# Support Triage Kata

This is a small workshop repo for practicing agentic engineering with Claude Code.

The product is intentionally tiny: classify incoming support ticket text into a priority, route, SLA, and set of tags.

The code starts with failing tests. That is deliberate. The goal is to use Claude Code to:

1. Explore the project before editing.
2. Use TDD to fix behavior.
3. Add one vertical slice at a time.
4. Review the diff.
5. Discuss security issues around user-provided text.

## Requirements

Read `docs/requirements.md`.

## Commands

```bash
npm test
```

There are no runtime dependencies beyond Node.js.

## Suggested workshop flow

```bash
npm test
claude
```

Then prompt Claude:

```text
The tests in this repo are failing. Diagnose the failures.
Use TDD: explain the failing behavior, implement the minimal fix, run npm test, and iterate until the suite passes.
Do not change the tests unless they contradict docs/requirements.md.
```

After the tests pass, work the backlog one ticket at a time.

Open `BACKLOG.md`. It is a queue of feature requests ordered easy to hard. Pull the
top ticket and run one vertical slice:

```text
Implement the next ticket in BACKLOG.md (start at the top).
Begin with one failing node:test test that describes the behavior.
Then implement the smallest production code change.
Run npm test.
Stop after the first passing implementation and show me the diff.
Do not create new layers, frameworks, or abstractions unless the existing code forces it.
```

There are more tickets than most people will finish — that is intentional. If you
clear a few, keep going, or ask Claude to review your own slices for missed edge
cases. No one runs out of work.

