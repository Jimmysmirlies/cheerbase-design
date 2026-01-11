import type { CSSProperties } from "react";

type ColorSwatchProps = {
  name: string;
  token: string;
  textToken?: string;
  usage?: string;
};

export function ColorSwatch({
  name,
  token,
  textToken,
  usage,
}: ColorSwatchProps) {
  const tokenLabel = token.replace("var(", "").replace(")", "");
  const textLabel = textToken
    ? textToken.replace("var(", "").replace(")", "")
    : undefined;

  return (
    <article className="flex flex-col gap-4">
      <div
        className="h-24 w-full rounded-xl border border-border/60"
        style={{ backgroundColor: token } as CSSProperties}
        aria-label={`${name} swatch`}
      />
      <div className="space-y-1 px-1 text-left text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-muted-foreground text-xs">
          Token: {tokenLabel}
          {textLabel ? ` · Foreground: ${textLabel}` : ""}
        </p>
        {usage ? <p>Usage: {usage}</p> : null}
      </div>
    </article>
  );
}
