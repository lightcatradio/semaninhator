import { createCanvas, loadImage } from "@napi-rs/canvas";

const TILE_SIZE = 300;
const GRID_SIZE = 5;
const FONT_SIZE = 16;

export async function generateGridImage(albums, drawAlbumName = false, drawAlbumPlays = false) {
  const canvasSize = TILE_SIZE * GRID_SIZE;
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  const images = await Promise.all(
    albums.map(async (album) => {
      if (!album.coverUrl) return null;
      try {
        return await loadImage(album.coverUrl);
      } catch {
        return null;
      }
    })
  );

  albums.forEach((album, index) => {
    const col = index % GRID_SIZE;
    const row = Math.floor(index / GRID_SIZE);
    const x = col * TILE_SIZE;
    const y = row * TILE_SIZE;

    const img = images[index];
    if (img) {
      ctx.drawImage(img, x, y, TILE_SIZE, TILE_SIZE);
    } else {
      ctx.fillStyle = "#333333";
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }
      ctx.font = `${FONT_SIZE}px NotoSans, NotoSansJP, NotoSansKR, NotoSansSC, NotoSansTC, NotoColorEmoji, sans-serif`;
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.textBaseline = "top";
      let nextLine = y;
      if (drawAlbumName) {
          nextLine = wrapText(ctx, `${album.name} - ${album.artist}`, x+4, nextLine + 4, TILE_SIZE-16, FONT_SIZE);
      }
      if (drawAlbumPlays) {
          wrapText(ctx, `${album.playcount} scrobbles`, x+4, nextLine + 4, TILE_SIZE - 16, FONT_SIZE);
      }
  });
  return canvas.toBuffer("image/png");
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(/\s+/);
    let line = '';

    for (const word of words) {
        const testLine = line
            ? `${line} ${word}`
            : word;

        if (
            context.measureText(testLine).width > maxWidth &&
            line
        ) {
            context.strokeText(line, x, y);
            context.fillText(line, x, y);

            line = word;
            y += lineHeight;
        } else {
            line = testLine;
        }
    }

    if (line) {
        context.strokeText(line, x, y);
        context.fillText(line, x, y);
    }

    return y + lineHeight;
}
