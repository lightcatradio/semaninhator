import { createCanvas, loadImage } from "@napi-rs/canvas";

const TILE_SIZE = 300;
const GRID_SIZE = 5;

export async function generateGridImage(albums) {
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
  });

  return canvas.toBuffer("image/png");
}
