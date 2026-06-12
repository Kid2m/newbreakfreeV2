// 24 animation images: 12 boy + 12 girl
// 4 animations (one per chapter transition) x 3 images each
// Emotional arc: distress → processing → healing/hope

const base = '/images/quiz/';

// Boy animations
const boyAnim1Img1 = base + 'ChatGPT_Image_14_déc._2025,_05_34_06_1765687552867.png';
const boyAnim1Img2 = base + 'ChatGPT_Image_14_déc._2025,_05_37_20_1765687591926.png';
const boyAnim1Img3 = base + 'ChatGPT_Image_14_déc._2025,_05_39_29_1765687684108.png';

const boyAnim2Img1 = base + 'ChatGPT_Image_14_déc._2025,_05_39_29_1765687832136.png';
const boyAnim2Img2 = base + 'ChatGPT_Image_14_déc._2025,_05_42_11_1765690518553.png';
const boyAnim2Img3 = base + 'ChatGPT_Image_14_déc._2025,_06_33_59_1765690558979.png';

const boyAnim3Img1 = base + 'ChatGPT_Image_14_déc._2025,_06_33_59_1765690596119.png';
const boyAnim3Img2 = base + 'ChatGPT_Image_14_déc._2025,_05_45_03_1765690612426.png';
const boyAnim3Img3 = base + 'ChatGPT_Image_14_déc._2025,_06_28_31_1765690633341.png';

const boyAnim4Img1 = base + 'ChatGPTImage3nov.202523_39_37_1765690683401.png';
const boyAnim4Img2 = base + 'ChatGPT_Image_14_déc._2025,_06_00_32_1765690703534.png';
const boyAnim4Img3 = base + 'ChatGPT_Image_14_déc._2025,_06_33_56_1765690722405.png';

// Girl animations
const girlAnim1Img1 = base + 'ChatGPT_Image_14_déc._2025,_06_43_47_1765691050277.png';
const girlAnim1Img2 = base + 'ChatGPT_Image_14_déc._2025,_06_19_08_1765691067705.png';
const girlAnim1Img3 = base + 'ChatGPT_Image_14_déc._2025,_06_59_25_1765691974697.png';

const girlAnim2Img1 = base + 'ChatGPT_Image_14_déc._2025,_06_59_25_1765691992911.png';
const girlAnim2Img2 = base + 'ChatGPT_Image_14_déc._2025,_06_45_18_1765692041463.png';
const girlAnim2Img3 = base + 'ChatGPT_Image_14_déc._2025,_06_42_33_1765692120599.png';

const girlAnim3Img1 = base + 'ChatGPT_Image_14_déc._2025,_06_42_33_1765692146680.png';
const girlAnim3Img2 = base + 'ChatGPT_Image_14_déc._2025,_06_42_38_1765692160088.png';
const girlAnim3Img3 = base + 'ChatGPT_Image_14_déc._2025,_06_50_17_1765692194116.png';

const girlAnim4Img1 = base + 'ChatGPT_Image_14_déc._2025,_06_50_17_1765692217896.png';
const girlAnim4Img2 = base + 'ChatGPT_Image_14_déc._2025,_06_55_23_1765692234194.png';
const girlAnim4Img3 = base + 'ChatGPT_Image_14_déc._2025,_06_51_50_1765692261574.png';

export type AnimationSequence = { images: [string, string, string] };
export type GenderAnimations = { boy: AnimationSequence[]; girl: AnimationSequence[] };

export const animations: GenderAnimations = {
  boy: [
    { images: [boyAnim1Img1, boyAnim1Img2, boyAnim1Img3] },
    { images: [boyAnim2Img1, boyAnim2Img2, boyAnim2Img3] },
    { images: [boyAnim3Img1, boyAnim3Img2, boyAnim3Img3] },
    { images: [boyAnim4Img1, boyAnim4Img2, boyAnim4Img3] },
  ],
  girl: [
    { images: [girlAnim1Img1, girlAnim1Img2, girlAnim1Img3] },
    { images: [girlAnim2Img1, girlAnim2Img2, girlAnim2Img3] },
    { images: [girlAnim3Img1, girlAnim3Img2, girlAnim3Img3] },
    { images: [girlAnim4Img1, girlAnim4Img2, girlAnim4Img3] },
  ],
};

// Hero images for intro scene
export const heroImage = '/images/quiz/hero-desktop.webp';
export const heroImageMobile = '/images/quiz/hero-mobile.webp';
