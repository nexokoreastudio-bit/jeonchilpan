/**
 * 카카오톡 링크 미리보기용 1200x1200 썸네일 생성
 * 로고가 잘리지 않도록 중앙 배치 후 assets/images/og-image.png 로 저장
 * 실행: npm run generate-og-image (또는 node scripts/generate-og-image.js)
 */
const fs = require('fs');
const path = require('path');

const sharpPath = path.join(__dirname, '../node_modules/sharp');
if (!fs.existsSync(sharpPath)) {
  console.log('sharp 패키지가 없습니다. 설치 후 다시 실행하세요: npm install sharp --save-dev');
  process.exit(1);
}

const sharp = require('sharp');
const SIZE = 1200;
const PUBLIC_ASSETS = path.join(__dirname, '../public/assets/images');
const LOGO_PATH = path.join(PUBLIC_ASSETS, 'jeonchilpan_og_logo.png');
const OUT_PATH = path.join(PUBLIC_ASSETS, 'og-image.png');

async function generate() {
  if (!fs.existsSync(LOGO_PATH)) {
    console.error('로고 파일을 찾을 수 없습니다:', LOGO_PATH);
    process.exit(1);
  }
  // 전칠판 로고를 1200x1200 캔버스에 맞게 크게 배치 (카카오톡 공유 시 전체 노출)
  const logoResized = await sharp(LOGO_PATH)
    .resize(1100, 1100, { fit: 'inside' })
    .toBuffer();
  const logoMeta = await sharp(logoResized).metadata();
  const w = logoMeta.width || 1100;
  const h = logoMeta.height || 1100;
  const x = Math.round((SIZE - w) / 2);
  const y = Math.round((SIZE - h) / 2);

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  })
    .composite([{ input: logoResized, left: x, top: y }])
    .png()
    .toFile(OUT_PATH);

  console.log('생성 완료:', OUT_PATH);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
