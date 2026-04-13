# KaTeX gotchas (don't lose a day to these)

## 1. Delimiter escaping in HTML attributes

When you configure `renderMathInElement` from an inline `onload` attribute like this:

```html
<script ... onload="renderMathInElement(document.body, {
    delimiters:[
      {left:'\\[', right:'\\]', display:true},
      {left:'\\(', right:'\\)', display:false}
    ]
  });"></script>
```

The HTML attribute parser does NOT unescape backslashes. `\\` in the attribute becomes `\\` in the string, and the JS string-literal parser then turns `\\` into `\`.

So `\\[` in the HTML source → `\\[` as the JS attribute value → `\[` as the runtime string value → matches the `\[` delimiter in the document content. ✅

Writing `\\\\[` in the HTML source → `\\\\[` as the JS attribute value → `\\[` as the runtime string → no match because the document uses `\[`, not `\\[`. ❌ (This is the bug that took an hour to find on the regression site.)

**Rule**: use TWO backslashes in the HTML attribute. Not four.

## 2. Dynamically-inserted math needs a re-render

KaTeX auto-render runs once on DOM ready. If you set `element.innerHTML = "Here is \(\\alpha\) inline"`, KaTeX doesn't know and the raw source appears.

**Fix**: after any dynamic content update, call:
```js
if (typeof renderMathInElement === 'function') {
  renderMathInElement(element, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\[', right: '\\]', display: true },
      { left: '\\(', right: '\\)', display: false },
      { left: '$', right: '$', display: false }
    ]
  });
}
```

(In JS string literals, one backslash is written as `\\`.)

## 3. Math inside SVG text elements

KaTeX renders to HTML. It does NOT render inside `<text>` elements of an SVG. If you want Greek letters on SVG axis labels, either:
- Use the Unicode characters directly (β, μ, σ) — they'll render as the platform default font
- Put the math in a `<foreignObject>` with an HTML div containing the KaTeX-rendered math
- Accept plain-text (write "beta-hat" instead of \hat{\beta})

## 4. `\text{}` and spacing

`\text{}` inside math switches to upright text. But if you have inline `\(\beta \text{ when} X>0\)`, KaTeX treats the space after `\text{when}` as math spacing. Often you want `\(\beta\text{ when }X>0\)` with spaces inside the `\text`.

## 5. The `$` delimiter is fragile

`$` as a delimiter is convenient but can collide with literal dollar signs in your prose ("the exam costs $50"). Many Distill-style sites use only `\(...\)` and `\[...\]` for this reason. We kept `$` in the regression site because we never have dollar signs in prose, but your mileage may vary.

## 6. Macros don't persist across `renderMathInElement` calls

If you define `\newcommand` macros inside a KaTeX block, they're scoped to that block only. For site-wide macros, configure the `macros` option of `renderMathInElement`:

```js
renderMathInElement(document.body, {
  macros: {
    "\\Ex": "\\mathbb{E}",
    "\\Var": "\\operatorname{Var}"
  },
  delimiters: [...]
});
```

Then `\Ex[X]` and `\Var(X)` work in every `\(...\)` and `\[...\]` on the page.

## 7. `align` and `aligned` environments

KaTeX does NOT support `align`. Use `aligned` inside `\[...\]`:

```
\[
\begin{aligned}
  a &= b + c \\
  d &= e + f
\end{aligned}
\]
```

Same for `eqnarray` (not supported) — replace with `aligned`.
