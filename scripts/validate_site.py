from __future__ import annotations

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.references: list[tuple[str, str]] = []
        self.h1_count = 0
        self.table_count = 0
        self.video_count = 0
        self.blank_links_without_rel: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"] or "")
        if tag == "h1":
            self.h1_count += 1
        elif tag == "table":
            self.table_count += 1
        elif tag == "video":
            self.video_count += 1

        for attribute in ("href", "src", "poster"):
            value = values.get(attribute)
            if value:
                self.references.append((attribute, value))

        if tag == "a" and values.get("target") == "_blank":
            rel = set((values.get("rel") or "").split())
            if not {"noopener", "noreferrer"}.issubset(rel):
                self.blank_links_without_rel.append(values.get("href") or "")


def local_path(reference: str) -> Path | None:
    parsed = urlparse(reference)
    if parsed.scheme or parsed.netloc or reference.startswith(("#", "data:")):
        return None
    return ROOT / unquote(parsed.path.lstrip("/"))


def main() -> None:
    source = INDEX.read_text(encoding="utf-8")
    parser = SiteParser()
    parser.feed(source)

    errors: list[str] = []
    duplicates = [item for item, count in Counter(parser.ids).items() if count > 1]
    if duplicates:
        errors.append(f"Duplicate IDs: {', '.join(duplicates)}")
    if parser.h1_count != 1:
        errors.append(f"Expected one H1, found {parser.h1_count}")
    if parser.table_count != 4:
        errors.append(f"Expected four results tables, found {parser.table_count}")
    if parser.video_count != 10:
        errors.append(f"Expected ten video instances (4 teaser + 6 gallery), found {parser.video_count}")
    if parser.blank_links_without_rel:
        errors.append("External _blank links missing noopener/noreferrer")

    missing = sorted(
        {
            str(path.relative_to(ROOT))
            for _, reference in parser.references
            if (path := local_path(reference)) is not None and not path.exists()
        }
    )
    if missing:
        errors.append(f"Missing local assets: {', '.join(missing)}")

    locked_terms = (
        "PrepareGroceries",
        "[x, y, z]",
        "four previous actions",
        "Qwen2.5-0.5B",
        "https://arxiv.org/abs/2603.22760",
    )
    absent = [term for term in locked_terms if term not in source]
    if absent:
        errors.append(f"Missing locked content: {', '.join(absent)}")

    if errors:
        raise SystemExit("\n".join(f"ERROR: {message}" for message in errors))

    print(
        "Site validation passed: "
        f"{parser.h1_count} H1, {parser.table_count} tables, "
        f"{parser.video_count} video instances, and all local assets resolved."
    )


if __name__ == "__main__":
    main()
