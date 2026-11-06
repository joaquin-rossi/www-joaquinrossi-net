---
date: 2026-11-06
---

This is a **test post** that uses every basic Markdown feature, to check how
each one looks on the blog.

## Text

Plain paragraph with **bold**, _italic_, **_both_**, ~~strikethrough~~ and
`inline code`. Keyboard keys look like <kbd>Ctrl</kbd> + <kbd>C</kbd>.

A line ending with a backslash\
breaks without starting a new paragraph.

Links: an [external one](https://github.com/joaquin-rossi) (new tab), an
[internal one](/blog) and an autolink: <https://www.joaquinrossi.net>.

## Headings

### Third level

#### Fourth level

Text under each heading.

## Lists

Unordered:

- First item
- Second item
    - Nested item
    - Another nested item
        - Even deeper
- Third item

Ordered:

1. Step one
2. Step two
    1. Sub-step
    2. Another sub-step
3. Step three

Task list:

- [x] Write the post
- [x] Render Markdown
- [ ] Publish it

## Quotes

> A simple quote.
>
> With a second paragraph.
>
> > And a nested quote inside.

## Table

| Feature    | Supported |                 Notes |
| :--------- | :-------: | --------------------: |
| Tables     |    Yes    |          GitHub-style |
| Task lists |    Yes    |       with checkboxes |
| Footnotes  |    No     | not in plain `marked` |

## Code

TypeScript:

```ts
type Post = { name: string; date: string };

export function latest(posts: Post[]): Post | undefined {
    return posts.toSorted((a, b) => b.date.localeCompare(a.date))[0];
}
```

Shell:

```bash
pnpm install
pnpm dev # http://localhost:3000
```

JSON:

```json
{ "title": "Hello, world", "draft": false, "tags": ["test"] }
```

CSS:

```css
.post pre {
    border: 1px solid #7f9db9;
}
```

Without a language:

```
plain text, no highlighting
```

## Image

![A Windows XP folder](/icons/folder-closed-96.png)

---

That's all: above this line there's a horizontal rule.
