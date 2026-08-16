# FieldKit Build Log

## Block 1 — Patterns (Sat AM)

What I built: I built 5 reusable architectural patterns that are common in parternership engagements, with grounded sources that reference Anthropics architectural patterns and best practices.
How it works, in my words: These are md files with - - - frontmatter, aka structured data about the documents in a YAML format. Containing triggers that are deterministic keywords for indexing this specific pattern. The front matter is meant to be read by machines, and the body of the md file is meant to be read by humans.

## Block 2 — MCP Server

What I built: a MCP server package that lists the tools as a catalog, it gets one full pattern and then runs the recommend pattern as the hard gate itself
How it works, in my words: main.py is the main routing mechanism for the MCP.  then the 3 tools are created

