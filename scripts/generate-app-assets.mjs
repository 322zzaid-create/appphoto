import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "public", "logo.jpg");
const out = join(root, "resources");
const BLACK = "#0a0a0f";

async function save(buffer, name) {
  const file = join(out, name);
  await mkdir(dirname(file), { recursive: true });
  await sharp(buffer).toFile(file);
  console.log("generated", name);
}

const logo = sharp(src);
const logoMeta = await logo.metadata();

// Square source, resized to 1024x1024.
const icon512 = await logo.resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

// Legacy icon (no transparency).
await save(await sharp(icon512).ensureAlpha().toBuffer(), "icon-only.png");

// Adaptive icon foreground: logo at ~62% centered with transparent padding.
await save(
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: await sharp(icon512).resize(640, 640).png().toBuffer(), gravity: "center" },
    ])
    .png()
    .toBuffer(),
  "icon-foreground.png"
);

// Adaptive icon background: solid dark.
await save(
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: BLACK },
  }).png().toBuffer(),
  "icon-background.png"
);

// Splash: solid dark (animation handled by the web splash screen).
for (const name of ["splash.png", "splash-dark.png"]) {
  await save(
    await sharp({
      create: { width: 2732, height: 2732, channels: 4, background: BLACK },
    }).png().toBuffer(),
    name
  );
}

// Web app (PWA) icons from the logo.
for (const size of [96, 192, 512]) {
  const file = join(root, "public", "icons", `icon-${size}.png`);
  await mkdir(dirname(file), { recursive: true });
  await sharp(icon512).resize(size, size, { fit: "contain" }).png().toFile(file);
  console.log("generated public/icons/icon-" + size + ".png");
}

console.log("logo source:", logoMeta.width + "x" + logoMeta.height);
console.log("done");
