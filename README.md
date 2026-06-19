# Agentic Engineering Workshop

A hands-on workshop for practicing **agentic engineering** with Claude Code — using an
AI coding agent while keeping engineering control through clear context, vertical slices,
test-driven development, and review.

The core idea: *the model generates code quickly; your job becomes designing context,
decomposing work, verifying behavior, and reviewing risk.*

## What's here

- [`exercises/support-triage-kata`](exercises/support-triage-kata) — a tiny Node.js lab
  that classifies support tickets. It starts with **intentionally failing tests** and
  ships a **backlog** of progressively harder slices. No dependencies beyond Node.js.

## Prerequisites

- Node.js LTS and npm
- Git
- Claude Code (CLI and/or the desktop app), with an active Claude subscription that
  includes Claude Code access
- An editor you are comfortable with

Verify your setup:

```bash
claude --version
claude doctor
git --version
node --version
npm --version
```

## Start the lab

```bash
cd exercises/support-triage-kata
npm test     # see the failing tests
claude       # start Claude Code
```

Then follow the kata's [README](exercises/support-triage-kata/README.md): repair the
failing tests with TDD, then work the [BACKLOG](exercises/support-triage-kata/BACKLOG.md)
one vertical slice at a time.

## The loop you are practicing

**Explore → Plan one vertical slice → Write a failing test → Implement the smallest
change → Run the tests → Review the diff → Commit.** Keep context tight; treat each
session as one PR-sized change.

## Safety

Do not use production secrets, customer data, or credentials in the exercises. The kata
is a safe, self-contained practice repo, and the "your own repo" portion of the workshop
should be done read-only.
