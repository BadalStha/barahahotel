/**
 * Renders JSON-LD structured data (server component). Pass a single
 * schema object or an array of them — both are valid inside
 * application/ld+json script tags.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Escape `<` so CMS-sourced values can never break out of the script
      // tag (JSON parsers decode \u003c back to `<`).
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
