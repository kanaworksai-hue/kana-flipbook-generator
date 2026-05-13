import * as THREE from "https://esm.sh/three@0.165.0";
import { createIcons, icons } from "https://esm.sh/lucide@0.468.0";

const canvas = document.querySelector("#flipCanvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 0.2, 7.2);

const ambient = new THREE.AmbientLight(0xffffff, 1.5);
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(2.8, 4, 4);
const fill = new THREE.DirectionalLight(0x9ee7d8, 1.1);
fill.position.set(-3.5, 2.5, 3);
scene.add(ambient, key, fill);

const backgroundPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    color: 0x16a085,
    depthTest: false,
    depthWrite: false,
  }),
);
backgroundPlane.position.z = -8;
backgroundPlane.renderOrder = -1000;
scene.add(backgroundPlane);

const bookGroup = new THREE.Group();
const pageGroup = new THREE.Group();
bookGroup.add(pageGroup);
scene.add(bookGroup);

const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(5.4, 3.8),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  }),
);
shadowPlane.position.set(0.2, -1.55, -0.8);
shadowPlane.rotation.x = -Math.PI / 2.35;
scene.add(shadowPlane);

const meshRefs = {
  leftCover: null,
  rightCover: null,
  spine: null,
  gutter: null,
  leftPage: null,
  revealPage: null,
  turnFront: null,
  turnBack: null,
  sweepShadow: null,
  leftStack: null,
  rightStack: null,
};

const state = {
  pages: [],
  textures: [],
  blankTexture: null,
  shadowTexture: null,
  ratio: "9:16",
  exportFormat: "mp4",
  binding: "left",
  bookAngle: 63,
  zoom: 1,
  interval: 0.35,
  flip: 0.75,
  accent: "#16a085",
  backgroundImageUrl: null,
  backgroundTexture: null,
  playing: false,
  playStartedAt: 0,
  exportMode: false,
  recording: false,
  currentIndex: 0,
  selectedPageId: null,
  draggingPageId: null,
  endVideoStarted: false,
  language: "en",
};

const timelineSettings = {
  endHold: 0.75,
};

const els = {
  assetInput: document.querySelector("#assetInput"),
  addTextBtn: document.querySelector("#addTextBtn"),
  textTitleInput: document.querySelector("#textTitleInput"),
  textInput: document.querySelector("#textInput"),
  pageList: document.querySelector("#pageList"),
  pageCount: document.querySelector("#pageCount"),
  clearPagesBtn: document.querySelector("#clearPagesBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  previewBtn: document.querySelector("#previewBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  downloadLink: document.querySelector("#downloadLink"),
  statusText: document.querySelector("#statusText"),
  currentPageLabel: document.querySelector("#currentPageLabel"),
  aspectRatioLabel: document.querySelector("#aspectRatioLabel"),
  exportFormatLabel: document.querySelector("#exportFormatLabel"),
  bindingDirectionLabel: document.querySelector("#bindingDirectionLabel"),
  holdInput: document.querySelector("#holdInput"),
  holdOutput: document.querySelector("#holdOutput"),
  flipInput: document.querySelector("#flipInput"),
  flipOutput: document.querySelector("#flipOutput"),
  bookAngleInput: document.querySelector("#bookAngleInput"),
  bookAngleOutput: document.querySelector("#bookAngleOutput"),
  zoomInput: document.querySelector("#zoomInput"),
  zoomOutput: document.querySelector("#zoomOutput"),
  accentInput: document.querySelector("#accentInput"),
  backgroundImageInput: document.querySelector("#backgroundImageInput"),
  clearBackgroundBtn: document.querySelector("#clearBackgroundBtn"),
  emptyState: document.querySelector("#emptyState"),
  dropZone: document.querySelector(".drop-zone"),
  languageButtons: document.querySelectorAll("[data-language]"),
  creatorTitle: document.querySelector("#creatorTitle"),
  creatorPromo: document.querySelector("#creatorPromo"),
  appTitle: document.querySelector("#appTitle"),
  assetsHeading: document.querySelector("#assetsHeading"),
  uploadTitle: document.querySelector("#uploadTitle"),
  uploadHint: document.querySelector("#uploadHint"),
  titleLabel: document.querySelector("#titleLabel"),
  contentLabel: document.querySelector("#contentLabel"),
  addTextLabel: document.querySelector("#addTextLabel"),
  videoSettingsHeading: document.querySelector("#videoSettingsHeading"),
  pageIntervalLabel: document.querySelector("#pageIntervalLabel"),
  flipDurationLabel: document.querySelector("#flipDurationLabel"),
  bookAngleLabel: document.querySelector("#bookAngleLabel"),
  zoomLabel: document.querySelector("#zoomLabel"),
  backgroundLabel: document.querySelector("#backgroundLabel"),
  backgroundColorLabel: document.querySelector("#backgroundColorLabel"),
  backgroundImageLabel: document.querySelector("#backgroundImageLabel"),
  backgroundStatus: document.querySelector("#backgroundStatus"),
  clearBackgroundLabel: document.querySelector("#clearBackgroundLabel"),
  pageOrderHeading: document.querySelector("#pageOrderHeading"),
  clearPagesLabel: document.querySelector("#clearPagesLabel"),
  previewLabel: document.querySelector("#previewLabel"),
  exportLabel: document.querySelector("#exportLabel"),
  downloadLabel: document.querySelector("#downloadLabel"),
  emptyStateText: document.querySelector("#emptyStateText"),
};

const translations = {
  en: {
    htmlLang: "en",
    documentTitle: "KANA Flipbook Generator",
    creatorTitle: "AI Creator & Flipbook Video Tool",
    creatorPromo: "Follow X for the latest AI news, prompts, and tool updates.",
    appTitle: "KANA Flipbook Generator",
    resetProject: "Reset project",
    assets: "Assets",
    uploadTitle: "Upload images or videos",
    uploadHint: "Select multiple files. Pages follow the upload order.",
    titleLabel: "Title",
    titlePlaceholder: "Enter a title",
    contentLabel: "Content",
    contentPlaceholder: "Enter announcements, issue notes, or portfolio text. Long content is split automatically.",
    addTextPage: "Add Text Page",
    videoSettings: "Video Settings",
    aspectRatio: "Aspect ratio",
    exportFormat: "Export Format",
    bindingDirection: "Binding Direction",
    leftBind: "Left Bind",
    rightBind: "Right Bind",
    pageInterval: "Page Interval",
    flipDuration: "Flip Duration",
    bookAngle: "Book Angle",
    zoom: "Zoom",
    background: "Background",
    backgroundColor: "Background Color",
    backgroundImage: "Upload Background Image",
    clearBackground: "Clear Image",
    colorBackgroundStatus: "Using color background",
    imageBackgroundStatus: "Using image background",
    pageOrder: "Page Order",
    clear: "Clear",
    preview: "Preview",
    generateVideo: "Generate Video",
    downloadVideo: "Download Video",
    canvasLabel: "3D flipbook video preview",
    emptyState: "Upload text, images, or videos to generate a recordable 3D flipbook.",
    statusInitial: "Add assets to start previewing",
    ready: "Ready",
    previewing: "Previewing",
    previewComplete: "Preview complete",
    mediaRecorderUnsupported: "This browser does not support MediaRecorder video export",
    formatUnsupported: "This browser cannot record MP4/MOV. Please use Chrome or Safari",
    generating: "Generating",
    done: "Done",
    pageSingular: "page",
    pagePlural: "pages",
    untitled: "Untitled",
    textPage: "Text page",
    image: "Image",
    video: "Video",
    dragToReorder: "Drag to reorder",
    deletePage: "Delete page",
    coverTitle: "KANA Flipbook Generator",
    coverDescription: "Upload text, images, and videos to create flipbook shorts for launches, announcements, portfolios, and archives.",
  },
  ja: {
    htmlLang: "ja",
    documentTitle: "KANA Flipbook Generator",
    creatorTitle: "AIクリエイター & フリップブック動画ツール",
    creatorPromo: "Xをフォローして、AIの最新ニュース、プロンプト、ツール更新をチェック。",
    appTitle: "KANA フリップブック生成ツール",
    resetProject: "プロジェクトをリセット",
    assets: "素材",
    uploadTitle: "画像または動画をアップロード",
    uploadHint: "複数ファイルを選択できます。ページはアップロード順に並びます。",
    titleLabel: "タイトル",
    titlePlaceholder: "タイトルを入力",
    contentLabel: "本文",
    contentPlaceholder: "告知、特集紹介、作品説明などを入力してください。長い本文は自動で複数ページに分割されます。",
    addTextPage: "テキストページを追加",
    videoSettings: "動画設定",
    aspectRatio: "画面比率",
    exportFormat: "書き出し形式",
    bindingDirection: "綴じ方向",
    leftBind: "左綴じ",
    rightBind: "右綴じ",
    pageInterval: "ページ間隔",
    flipDuration: "めくり時間",
    bookAngle: "本の角度",
    zoom: "ズーム",
    background: "背景",
    backgroundColor: "背景色",
    backgroundImage: "背景画像をアップロード",
    clearBackground: "画像をクリア",
    colorBackgroundStatus: "背景色を使用中",
    imageBackgroundStatus: "背景画像を使用中",
    pageOrder: "ページ順",
    clear: "クリア",
    preview: "プレビュー",
    generateVideo: "動画を生成",
    downloadVideo: "動画をダウンロード",
    canvasLabel: "3Dフリップブック動画プレビュー",
    emptyState: "テキスト、画像、動画をアップロードして、録画可能な3Dフリップブックを生成します。",
    statusInitial: "素材を追加してプレビューを開始",
    ready: "準備完了",
    previewing: "プレビュー中",
    previewComplete: "プレビュー完了",
    mediaRecorderUnsupported: "このブラウザはMediaRecorderによる動画書き出しに対応していません",
    formatUnsupported: "このブラウザではMP4/MOV録画に対応していません。ChromeまたはSafariを使用してください",
    generating: "生成中",
    done: "完了",
    pageSingular: "ページ",
    pagePlural: "ページ",
    untitled: "無題",
    textPage: "テキストページ",
    image: "画像",
    video: "動画",
    dragToReorder: "ドラッグして並べ替え",
    deletePage: "ページを削除",
    coverTitle: "KANA フリップブック生成ツール",
    coverDescription: "テキスト、画像、動画をアップロードして、新刊告知、ニュース、ポートフォリオ、アーカイブに使えるフリップブック動画を作成できます。",
  },
};

const ratioSizes = {
  "9:16": { width: 1080, height: 1920, pageW: 2.2, pageH: 3.9 },
  "3:4": { width: 1080, height: 1440, pageW: 2.7, pageH: 3.6 },
  "1:1": { width: 1080, height: 1080, pageW: 3.15, pageH: 3.15 },
  "4:3": { width: 1440, height: 1080, pageW: 4.0, pageH: 3.0 },
  "16:9": { width: 1920, height: 1080, pageW: 4.25, pageH: 2.4 },
};

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const clamp01 = (value) => Math.max(0, Math.min(1, value));
const imageFilePattern = /\.(avif|gif|heic|heif|jpe?g|png|webp)$/i;
const videoFilePattern = /\.(m4v|mov|mp4|og[gv]|webm)$/i;

function copy() {
  return translations[state.language] || translations.en;
}

function setText(element, value) {
  if (element) element.textContent = value;
}

function setAttribute(element, name, value) {
  if (element) element.setAttribute(name, value);
}

function pageCountLabel(count) {
  const labels = copy();
  return `${count} ${count === 1 ? labels.pageSingular : labels.pagePlural}`;
}

function detectInitialLanguage() {
  const urlLanguage = new URLSearchParams(window.location.search).get("lang");
  if (urlLanguage && translations[urlLanguage]) return urlLanguage;
  const storedLanguage = window.localStorage.getItem("kanaFlipbookLanguage");
  if (storedLanguage && translations[storedLanguage]) return storedLanguage;
  return navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";
}

function updateLanguageUrl(language) {
  const url = new URL(window.location.href);
  if (language === "en") {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", language);
  }
  window.history.replaceState({}, "", url);
}

function applyStaticLanguage() {
  const labels = copy();
  document.documentElement.lang = labels.htmlLang;
  document.title = labels.documentTitle;
  setText(els.creatorTitle, labels.creatorTitle);
  setText(els.creatorPromo, labels.creatorPromo);
  setText(els.appTitle, labels.appTitle);
  setText(els.assetsHeading, labels.assets);
  setText(els.uploadTitle, labels.uploadTitle);
  setText(els.uploadHint, labels.uploadHint);
  setText(els.titleLabel, labels.titleLabel);
  setText(els.contentLabel, labels.contentLabel);
  setText(els.addTextLabel, labels.addTextPage);
  setText(els.videoSettingsHeading, labels.videoSettings);
  setText(els.aspectRatioLabel, labels.aspectRatio);
  setText(els.exportFormatLabel, labels.exportFormat);
  setText(els.bindingDirectionLabel, labels.bindingDirection);
  setText(els.pageIntervalLabel, labels.pageInterval);
  setText(els.flipDurationLabel, labels.flipDuration);
  setText(els.bookAngleLabel, labels.bookAngle);
  setText(els.zoomLabel, labels.zoom);
  setText(els.backgroundLabel, labels.background);
  setText(els.backgroundColorLabel, labels.backgroundColor);
  setText(els.backgroundImageLabel, labels.backgroundImage);
  setText(els.clearBackgroundLabel, labels.clearBackground);
  setText(els.pageOrderHeading, labels.pageOrder);
  setText(els.clearPagesLabel, labels.clear);
  setText(els.previewLabel, labels.preview);
  setText(els.exportLabel, labels.generateVideo);
  setText(els.downloadLabel, labels.downloadVideo);
  setText(els.emptyStateText, labels.emptyState);
  setAttribute(els.textTitleInput, "placeholder", labels.titlePlaceholder);
  setAttribute(els.textInput, "placeholder", labels.contentPlaceholder);
  setAttribute(els.resetBtn, "aria-label", labels.resetProject);
  setAttribute(els.resetBtn, "title", labels.resetProject);
  setAttribute(document.querySelector(".ratio-segmented"), "aria-label", labels.aspectRatio);
  setAttribute(document.querySelector("[data-export-format]")?.parentElement, "aria-label", labels.exportFormat);
  setAttribute(document.querySelector("[data-binding]")?.parentElement, "aria-label", labels.bindingDirection);
  setAttribute(canvas, "aria-label", labels.canvasLabel);
  els.languageButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.language === state.language);
  });
  document.querySelectorAll("[data-binding]").forEach((button) => {
    const label = button.dataset.binding === "left" ? labels.leftBind : labels.rightBind;
    button.textContent = label;
  });
  updateBackgroundStatus();
}

function setLanguage(language, options = {}) {
  if (!translations[language]) return;
  state.language = language;
  if (options.persist !== false) window.localStorage.setItem("kanaFlipbookLanguage", language);
  if (options.updateUrl !== false) updateLanguageUrl(language);
  applyStaticLanguage();
  if (!state.playing && !state.recording) {
    els.statusText.textContent = state.pages.length ? `${copy().ready} · ${ratioLabel()}` : copy().statusInitial;
  }
  if (options.rerender !== false) rebuildBook();
}

function easeInOutCubic(value) {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function ratioLabel() {
  const { width, height } = ratioSizes[state.ratio];
  return `${width}x${height}`;
}

function activeTurnSide() {
  return state.binding === "right" ? "left" : "right";
}

function oppositeSide(side) {
  return side === "left" ? "right" : "left";
}

function spreadPageIndex(completedFlips, side) {
  const base = 2 * completedFlips;
  if (state.binding === "right") {
    return side === "left" ? base + 1 : base;
  }
  return side === "left" ? base : base + 1;
}

function getRecordingType(format = state.exportFormat) {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return null;
  const candidates = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4;codecs=avc1.4D401E",
    "video/mp4;codecs=avc1.640028",
    "video/mp4;codecs=avc1",
    "video/mp4",
  ];
  const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  if (!mimeType) return null;
  return {
    mimeType,
    extension: format === "mov" ? "mov" : "mp4",
  };
}

function createCanvas(width = 1080, height = 1920) {
  const result = document.createElement("canvas");
  result.width = width;
  result.height = height;
  return result;
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function coverDraw(ctx, media, width, height) {
  const sourceWidth = media.videoWidth || media.naturalWidth || media.width;
  const sourceHeight = media.videoHeight || media.naturalHeight || media.height;
  if (!sourceWidth || !sourceHeight) return;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;
  ctx.drawImage(media, x, y, drawWidth, drawHeight);
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  drawTextLines(ctx, wrapTextLines(ctx, text, maxWidth), x, y, lineHeight, maxLines);
}

function tokenizeText(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const hasCjk = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/.test(normalized);
  if (hasCjk) return Array.from(normalized);
  return normalized.split(/(\s+)/).filter(Boolean);
}

function wrapTextLines(ctx, text, maxWidth) {
  const paragraphs = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const lines = [];
  paragraphs.forEach((paragraph, paragraphIndex) => {
    const normalized = paragraph.replace(/\s+/g, " ").trim();
    if (!normalized) {
      if (paragraphIndex > 0 && paragraphIndex < paragraphs.length - 1) lines.push("");
      return;
    }

    const tokens = tokenizeText(normalized);
    let current = "";
    for (const token of tokens) {
      const test = current ? `${current}${token}` : token;
      if (ctx.measureText(test).width > maxWidth && current.trim()) {
        lines.push(current.trimEnd());
        current = token.trimStart();
        if (ctx.measureText(current).width > maxWidth) {
          const pieces = splitOversizedToken(ctx, current, maxWidth);
          lines.push(...pieces.slice(0, -1));
          current = pieces.at(-1) || "";
        }
      } else {
        current = test;
      }
    }
    if (current.trim()) lines.push(current.trimEnd());
    if (paragraphIndex < paragraphs.length - 1) lines.push("");
  });
  return lines;
}

function splitOversizedToken(ctx, token, maxWidth) {
  const pieces = [];
  let current = "";
  for (const char of Array.from(token)) {
    const test = `${current}${char}`;
    if (ctx.measureText(test).width > maxWidth && current) {
      pieces.push(current);
      current = char;
    } else {
      current = test;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

function drawTextLines(ctx, lines, x, y, lineHeight, maxLines = Infinity) {
  lines.slice(0, maxLines).forEach((line, index) => {
    if (line) ctx.fillText(line, x, y + index * lineHeight);
  });
}

function getTextLayout(ratio = state.ratio) {
  const { width, height } = ratioSizes[ratio];
  const base = Math.min(width, height);
  return {
    cardX: width * 0.08,
    cardY: height * 0.1,
    cardW: width * 0.84,
    cardH: height * 0.8,
    contentX: width * 0.16,
    titleY: height * 0.18,
    maxTextW: width * 0.7,
    titleSize: Math.round(base * 0.072),
    titleLineHeight: Math.round(base * 0.086),
    titleGap: Math.round(base * 0.046),
    bodySize: Math.round(base * 0.036),
    bodyLineHeight: Math.round(base * 0.056),
    footerY: height * 0.86,
  };
}

function paginateTextContent(title, content, ratio = state.ratio) {
  const { width, height } = ratioSizes[ratio];
  const measure = createCanvas(width, height).getContext("2d");
  const layout = getTextLayout(ratio);
  const normalizedTitle = title.trim() || copy().untitled;

  measure.font = `800 ${layout.titleSize}px Inter, system-ui, sans-serif`;
  const titleLines = wrapTextLines(measure, normalizedTitle, layout.maxTextW).slice(0, 3);
  const bodyY = layout.titleY + titleLines.length * layout.titleLineHeight + layout.titleGap;
  const maxBodyLines = Math.max(1, Math.floor((layout.footerY - bodyY - layout.bodyLineHeight * 0.35) / layout.bodyLineHeight));

  measure.font = `500 ${layout.bodySize}px Inter, system-ui, sans-serif`;
  const bodyLines = wrapTextLines(measure, content.trim(), layout.maxTextW);
  const chunks = bodyLines.length ? [] : [[]];
  for (let index = 0; index < bodyLines.length; index += maxBodyLines) {
    chunks.push(bodyLines.slice(index, index + maxBodyLines));
  }

  const groupId = crypto.randomUUID();
  return chunks.map((lines, index) => ({
    id: crypto.randomUUID(),
    type: "text",
    title: normalizedTitle,
    body: lines.join("\n").trim(),
    text: lines.join("\n").trim(),
    textGroupId: groupId,
    partIndex: index + 1,
    partTotal: chunks.length,
  }));
}

function drawTextPage(pageData, ratio = state.ratio) {
  const { width, height } = ratioSizes[ratio];
  const page = createCanvas(width, height);
  const ctx = page.getContext("2d");
  const layout = getTextLayout(ratio);
  const title = typeof pageData === "string" ? pageData.split(/\n/).find(Boolean) || "Flipbook" : pageData.title || copy().untitled;
  const body = typeof pageData === "string" ? pageData : pageData.body || pageData.text || "";
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#fffdf8");
  gradient.addColorStop(0.58, "#f3eee5");
  gradient.addColorStop(1, state.accent);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  roundedRect(ctx, layout.cardX, layout.cardY, layout.cardW, layout.cardH, 42);
  ctx.fill();

  ctx.fillStyle = "#1f2423";
  ctx.textBaseline = "top";
  ctx.font = `800 ${layout.titleSize}px Inter, system-ui, sans-serif`;
  const titleLines = wrapTextLines(ctx, title, layout.maxTextW).slice(0, 3);
  drawTextLines(ctx, titleLines, layout.contentX, layout.titleY, layout.titleLineHeight, 3);

  ctx.fillStyle = "rgba(31,36,35,0.72)";
  ctx.font = `500 ${layout.bodySize}px Inter, system-ui, sans-serif`;
  const bodyY = layout.titleY + titleLines.length * layout.titleLineHeight + layout.titleGap;
  const maxBodyLines = Math.max(1, Math.floor((layout.footerY - bodyY - layout.bodyLineHeight * 0.35) / layout.bodyLineHeight));
  const bodyLines = Array.isArray(pageData.bodyLines) ? pageData.bodyLines : wrapTextLines(ctx, body, layout.maxTextW);
  drawTextLines(ctx, bodyLines, layout.contentX, bodyY, layout.bodyLineHeight, maxBodyLines);
  return page;
}

function drawCoverPage() {
  const { width, height } = ratioSizes[state.ratio];
  const page = createCanvas(width, height);
  const ctx = page.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#20312f");
  gradient.addColorStop(0.48, state.accent);
  gradient.addColorStop(1, "#fff7ea");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.84)";
  roundedRect(ctx, width * 0.11, height * 0.13, width * 0.78, height * 0.74, 48);
  ctx.fill();

  ctx.fillStyle = "#1f2423";
  ctx.textBaseline = "top";
  ctx.font = `900 ${Math.round(width * 0.085)}px Inter, system-ui, sans-serif`;
  drawWrappedText(ctx, copy().coverTitle, width * 0.19, height * 0.26, width * 0.64, width * 0.09, 2);

  ctx.fillStyle = "rgba(31,36,35,0.7)";
  ctx.font = `550 ${Math.round(width * 0.036)}px Inter, system-ui, sans-serif`;
  drawWrappedText(
    ctx,
    copy().coverDescription,
    width * 0.19,
    height * 0.48,
    width * 0.62,
    width * 0.056,
    6,
  );

  ctx.fillStyle = state.accent;
  ctx.fillRect(width * 0.19, height * 0.72, width * 0.32, 12);
  return page;
}

function drawBlankPage() {
  const { width, height } = ratioSizes[state.ratio];
  const page = createCanvas(width, height);
  const ctx = page.getContext("2d");
  ctx.fillStyle = "#f8f4ec";
  ctx.fillRect(0, 0, width, height);
  const paper = ctx.createLinearGradient(0, 0, width, height);
  paper.addColorStop(0, "rgba(255,255,255,0.74)");
  paper.addColorStop(0.62, "rgba(240,233,222,0.84)");
  paper.addColorStop(1, "rgba(215,205,190,0.44)");
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(31,36,35,0.08)";
  ctx.fillRect(width * 0.08, height * 0.1, width * 0.84, 2);
  ctx.fillRect(width * 0.08, height * 0.9, width * 0.84, 2);
  return page;
}

function drawSweepShadow() {
  const canvasShadow = createCanvas(512, 1024);
  const ctx = canvasShadow.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvasShadow.width, 0);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.52, "rgba(0,0,0,0.04)");
  gradient.addColorStop(0.82, "rgba(0,0,0,0.38)");
  gradient.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasShadow.width, canvasShadow.height);
  return canvasShadow;
}

function drawGutterShadow() {
  const gutter = createCanvas(256, 1024);
  const ctx = gutter.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, gutter.width, 0);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.34, "rgba(0,0,0,0.035)");
  gradient.addColorStop(0.5, "rgba(0,0,0,0.13)");
  gradient.addColorStop(0.66, "rgba(0,0,0,0.035)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, gutter.width, gutter.height);
  return gutter;
}

function pageTextureFromCanvas(pageCanvas) {
  const texture = new THREE.CanvasTexture(pageCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

function makeFallbackTexture() {
  return pageTextureFromCanvas(drawCoverPage());
}

function disposeTextures() {
  state.textures.forEach((texture) => texture.dispose());
  state.textures = [];
  state.blankTexture?.dispose();
  state.blankTexture = null;
  state.shadowTexture?.dispose();
  state.shadowTexture = null;
}

function disposeMeshes() {
  while (pageGroup.children.length) {
    const child = pageGroup.children.pop();
    child.geometry?.dispose();
    if (Array.isArray(child.material)) {
      child.material.forEach((mat) => {
        if (child.userData.localTexture && child.userData.localTexture === mat.map) mat.map.dispose();
        mat.dispose();
      });
    } else {
      if (child.userData.localTexture && child.userData.localTexture === child.material?.map) child.material.map.dispose();
      child.material?.dispose();
    }
  }
  Object.keys(meshRefs).forEach((key) => {
    meshRefs[key] = null;
  });
}

async function createImageElement(file) {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();
  return { image, url };
}

async function createVideoElement(file) {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.loop = false;
  video.playsInline = true;
  video.preload = "auto";
  const ready = new Promise((resolve, reject) => {
    video.onloadedmetadata = resolve;
    video.onloadeddata = resolve;
    video.onerror = reject;
  });
  video.src = url;
  video.load();
  await ready;
  await video.play().catch(() => {});
  return { video, url };
}

function isImageFile(file) {
  return (file.type || "").startsWith("image/") || imageFilePattern.test(file.name || "");
}

function isVideoFile(file) {
  return (file.type || "").startsWith("video/") || videoFilePattern.test(file.name || "");
}

function updateBackgroundStatus() {
  setText(els.backgroundStatus, state.backgroundTexture ? copy().imageBackgroundStatus : copy().colorBackgroundStatus);
  els.clearBackgroundBtn.classList.toggle("hidden", !state.backgroundTexture);
}

function fitTextureToAspect(texture, targetAspect) {
  const sourceWidth = texture.image?.naturalWidth || texture.image?.width || 1;
  const sourceHeight = texture.image?.naturalHeight || texture.image?.height || 1;
  const sourceAspect = sourceWidth / sourceHeight;
  if (sourceAspect > targetAspect) {
    texture.repeat.set(targetAspect / sourceAspect, 1);
    texture.offset.set((1 - texture.repeat.x) / 2, 0);
  } else {
    texture.repeat.set(1, sourceAspect / targetAspect);
    texture.offset.set(0, (1 - texture.repeat.y) / 2);
  }
  texture.needsUpdate = true;
}

function updateBackgroundSurface(targetAspect = canvas.clientWidth / Math.max(1, canvas.clientHeight)) {
  if (state.backgroundTexture) {
    fitTextureToAspect(state.backgroundTexture, targetAspect);
    backgroundPlane.material.map = state.backgroundTexture;
    backgroundPlane.material.color.set(0xffffff);
  } else {
    backgroundPlane.material.map = null;
    backgroundPlane.material.color.set(state.accent);
  }
  backgroundPlane.material.needsUpdate = true;
  updateBackgroundStatus();
}

function fitBackgroundPlane(width, height) {
  const planeZ = -8;
  const distance = camera.position.z - planeZ;
  const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
  const visibleWidth = visibleHeight * camera.aspect;
  backgroundPlane.position.set(0, 0, planeZ);
  backgroundPlane.scale.set(visibleWidth, visibleHeight, 1);
  updateBackgroundSurface(width / Math.max(1, height));
}

function clearBackgroundImage() {
  state.backgroundTexture?.dispose();
  state.backgroundTexture = null;
  if (state.backgroundImageUrl) URL.revokeObjectURL(state.backgroundImageUrl);
  state.backgroundImageUrl = null;
  updateBackgroundSurface();
}

async function setBackgroundImage(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();
  clearBackgroundImage();
  const texture = new THREE.Texture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;
  state.backgroundTexture = texture;
  state.backgroundImageUrl = url;
  updateBackgroundSurface();
}

function updateVideoLoopModes() {
  state.pages.forEach((page, index) => {
    if (page.type !== "video") return;
    page.source.loop = index !== state.pages.length - 1;
  });
}

function resetVideoToStart(video) {
  try {
    video.currentTime = 0;
  } catch {
    // Some browser codecs are not seekable until playback settles.
  }
}

function playTimelineVideos(options = {}) {
  updateVideoLoopModes();
  state.endVideoStarted = false;
  const shouldDelayLastVideo = !options.includeLast && getFlipCount() > 0;
  state.pages.forEach((page, index) => {
    if (page.type !== "video") return;
    const isLastPageVideo = index === state.pages.length - 1;
    if (isLastPageVideo && shouldDelayLastVideo) {
      page.source.pause();
      resetVideoToStart(page.source);
      return;
    }
    resetVideoToStart(page.source);
    page.source.play().catch(() => {});
    if (isLastPageVideo) state.endVideoStarted = true;
  });
}

function prepareLastVideoOnce() {
  const lastPage = state.pages[state.pages.length - 1];
  if (!lastPage || lastPage.type !== "video" || state.endVideoStarted) return;
  lastPage.source.loop = false;
  resetVideoToStart(lastPage.source);
  lastPage.source.play().catch(() => {});
  state.endVideoStarted = true;
}

async function addFiles(files) {
  const accepted = [...files].filter((file) => isImageFile(file) || isVideoFile(file));
  for (const file of accepted) {
    if (isImageFile(file)) {
      const { image, url } = await createImageElement(file);
      state.pages.push({
        id: crypto.randomUUID(),
        type: "image",
        title: file.name,
        source: image,
        url,
      });
    } else {
      const { video, url } = await createVideoElement(file);
      state.pages.push({
        id: crypto.randomUUID(),
        type: "video",
        title: file.name,
        source: video,
        url,
      });
    }
  }
  updateVideoLoopModes();
  await rebuildBook();
}

function addTextPages() {
  const title = els.textTitleInput.value.trim();
  const content = els.textInput.value.trim();
  if (!title && !content) return;
  state.pages.push(...paginateTextContent(title, content));
  els.textTitleInput.value = "";
  els.textInput.value = "";
  updateVideoLoopModes();
  rebuildBook();
}

function pageToCanvas(page, index = -1) {
  const { width, height } = ratioSizes[state.ratio];
  const result = createCanvas(width, height);
  const ctx = result.getContext("2d");
  if (page.type === "text") {
    return drawTextPage({
      ...page,
      pageNumber: index + 1,
      totalPages: state.pages.length,
    });
  }
  ctx.fillStyle = "#f8f4ec";
  ctx.fillRect(0, 0, width, height);
  coverDraw(ctx, page.source, width, height);
  return result;
}

function refreshDynamicVideoTextures() {
  state.pages.forEach((page, index) => {
    if (page.type !== "video" || !state.textures[index]) return;
    const canvasPage = pageToCanvas(page, index);
    const ctx = state.textures[index].image.getContext("2d");
    ctx.clearRect(0, 0, state.textures[index].image.width, state.textures[index].image.height);
    ctx.drawImage(canvasPage, 0, 0);
    state.textures[index].needsUpdate = true;
  });
}

function addBookBack() {
  const { pageW, pageH } = ratioSizes[state.ratio];
  const coverGeometry = new THREE.BoxGeometry(pageW - 0.045, pageH - 0.045, 0.08);
  const coverMaterial = new THREE.MeshStandardMaterial({
    color: 0x17211f,
    roughness: 0.88,
    metalness: 0,
  });
  meshRefs.leftCover = new THREE.Mesh(coverGeometry, coverMaterial.clone());
  meshRefs.leftCover.position.set(-pageW / 2, 0, -0.15);
  meshRefs.leftCover.userData.cover = true;
  pageGroup.add(meshRefs.leftCover);

  meshRefs.rightCover = new THREE.Mesh(coverGeometry.clone(), coverMaterial.clone());
  meshRefs.rightCover.position.set(pageW / 2, 0, -0.15);
  meshRefs.rightCover.userData.cover = true;
  pageGroup.add(meshRefs.rightCover);

  const spineColor = new THREE.Color(state.accent).lerp(new THREE.Color(0x16201d), 0.58);
  meshRefs.spine = new THREE.Mesh(
    new THREE.BoxGeometry(0.032, pageH + 0.08, 0.14),
    new THREE.MeshStandardMaterial({
      color: spineColor,
      roughness: 0.92,
      metalness: 0,
      transparent: true,
      opacity: 0.42,
    }),
  );
  meshRefs.spine.position.set(0, 0, -0.15);
  pageGroup.add(meshRefs.spine);

  const gutterTexture = pageTextureFromCanvas(drawGutterShadow());
  meshRefs.gutter = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, pageH + 0.02),
    new THREE.MeshBasicMaterial({
      map: gutterTexture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }),
  );
  meshRefs.gutter.userData.localTexture = gutterTexture;
  meshRefs.gutter.position.set(0, 0, 0.06);
  pageGroup.add(meshRefs.gutter);

  meshRefs.leftStack = createStackMesh("left");
  meshRefs.rightStack = createStackMesh("right");
  pageGroup.add(meshRefs.leftStack, meshRefs.rightStack);
}

function createStackMesh(side) {
  const { pageW, pageH } = ratioSizes[state.ratio];
  const gutterInset = 0.055;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(pageW - gutterInset, pageH, 1),
    new THREE.MeshStandardMaterial({
      color: 0xe6dccb,
      roughness: 0.95,
      metalness: 0,
    }),
  );
  mesh.position.x = side === "left" ? -pageW / 2 - gutterInset / 2 : pageW / 2 + gutterInset / 2;
  mesh.position.z = -0.04;
  mesh.scale.z = 0.001;
  mesh.visible = false;
  mesh.receiveShadow = true;
  return mesh;
}

function createPageGeometry(side, mirrorUv = false) {
  const { pageW, pageH } = ratioSizes[state.ratio];
  const geometry = new THREE.PlaneGeometry(pageW, pageH, 56, 8);
  geometry.translate(side === "left" ? -pageW / 2 : pageW / 2, 0, 0);
  if (mirrorUv) {
    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i += 1) {
      uv.setX(i, 1 - uv.getX(i));
    }
    uv.needsUpdate = true;
  }
  geometry.userData.basePositions = Float32Array.from(geometry.attributes.position.array);
  geometry.userData.side = side;
  return geometry;
}

function createPageMaterial(texture, side = THREE.FrontSide, opacity = 1) {
  return new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.48,
    metalness: 0.02,
    clearcoat: 0.22,
    clearcoatRoughness: 0.38,
    side,
    transparent: opacity < 1,
    opacity,
  });
}

function createPageMesh(side, texture, materialSide, z, mirrorUv = false) {
  const mesh = new THREE.Mesh(
    createPageGeometry(side, mirrorUv),
    createPageMaterial(texture, materialSide, 1),
  );
  mesh.position.z = z;
  mesh.userData.textureIndex = null;
  pageGroup.add(mesh);
  return mesh;
}

function buildOpenBook() {
  addBookBack();
  const turnSide = activeTurnSide();
  meshRefs.leftPage = createPageMesh("left", textureAt(-1), THREE.FrontSide, 0.04);
  meshRefs.revealPage = createPageMesh("right", textureAt(0), THREE.FrontSide, 0.045);
  meshRefs.turnFront = createPageMesh(turnSide, textureAt(0), THREE.FrontSide, 0.09);
  meshRefs.turnBack = createPageMesh(turnSide, textureAt(1, { clamp: true }), THREE.BackSide, 0.091, true);

  meshRefs.sweepShadow = new THREE.Mesh(
    createPageGeometry(oppositeSide(turnSide)),
    new THREE.MeshBasicMaterial({
      map: state.shadowTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  meshRefs.sweepShadow.position.z = 0.13;
  pageGroup.add(meshRefs.sweepShadow);
}

function textureAt(index, options = {}) {
  if (options.clamp && state.textures.length) {
    const clamped = Math.max(0, Math.min(index, state.textures.length - 1));
    return state.textures[clamped];
  }
  return state.textures[index] || state.blankTexture;
}

function setMeshTexture(mesh, index, options = {}) {
  if (!mesh || mesh.userData.textureIndex === index) return;
  mesh.material.map = textureAt(index, options);
  mesh.material.needsUpdate = true;
  mesh.userData.textureIndex = index;
}

function setMeshVisible(mesh, visible) {
  if (mesh) mesh.visible = visible;
}

function setBookStructureVisible(visible) {
  setMeshVisible(meshRefs.leftCover, visible);
  setMeshVisible(meshRefs.rightCover, visible);
  setMeshVisible(meshRefs.spine, visible);
  setMeshVisible(meshRefs.gutter, visible);
}

async function rebuildBook() {
  updateVideoLoopModes();
  disposeTextures();
  disposeMeshes();
  els.emptyState.classList.toggle("hidden", state.pages.length > 0);
  if (!state.playing && !state.recording) {
    els.statusText.textContent = state.pages.length ? `${copy().ready} · ${ratioLabel()}` : copy().statusInitial;
  }

  const pages = state.pages.length
    ? state.pages
    : [
        {
          id: "cover",
          type: "cover",
          title: copy().coverTitle,
        },
      ];

  pages.forEach((page, index) => {
    const canvasPage = page.type === "cover" ? drawCoverPage() : pageToCanvas(page, index);
    state.textures.push(pageTextureFromCanvas(canvasPage));
  });
  state.blankTexture = pageTextureFromCanvas(drawBlankPage());
  state.shadowTexture = pageTextureFromCanvas(drawSweepShadow());

  buildOpenBook();
  updatePageTransforms(0);
  renderPageList();
  resizeRenderer();
}

function rebuildBookMeshes() {
  disposeMeshes();
  buildOpenBook();
  updatePageTransforms(0);
  renderPageList();
  resizeRenderer();
  renderFrameOnce();
}

function updatePageTransforms(timeSeconds) {
  const timeline = state.playing || state.exportMode ? timeSeconds : 0;
  const pose = getTimelinePose(timeline);
  renderTimelinePose(pose);

  const labelPage = state.pages[pose.labelIndex] || state.pages[state.pages.length - 1];
  state.currentIndex = Math.min(pose.labelIndex, Math.max(0, state.pages.length - 1));
  els.currentPageLabel.textContent = labelPage?.title || copy().coverTitle;
}

function getTimelinePose(timeSeconds) {
  const pageCount = state.textures.length;
  if (!state.pages.length) {
    return { mode: "idle", labelIndex: 0 };
  }

  const flipCount = getFlipCount(pageCount);
  const cycle = state.interval + state.flip;
  if (!flipCount) {
    return timeSeconds < state.interval
      ? { mode: "spread", completedFlips: 0, labelIndex: 0 }
      : { mode: "end", labelIndex: Math.max(0, pageCount - 1) };
  }

  const elapsed = timeSeconds;
  if (elapsed >= flipCount * cycle) {
    return { mode: "end", labelIndex: Math.max(0, pageCount - 1) };
  }

  const flipIndex = Math.floor(elapsed / cycle);
  const phase = elapsed - flipIndex * cycle;
  if (phase < state.interval) {
    return {
      mode: "spread",
      completedFlips: flipIndex,
      labelIndex: Math.min(2 * flipIndex, pageCount - 1),
    };
  }

  const progress = easeInOutCubic((phase - state.interval) / state.flip);
  const frontIndex = flipFrontIndex(flipIndex);
  return {
    mode: "flip",
    flipIndex,
    progress,
    labelIndex: Math.min(frontIndex, pageCount - 1),
  };
}

function getFlipCount(pageCount = state.textures.length) {
  return Math.max(0, Math.ceil(pageCount / 2) - 1);
}

function getTotalDuration() {
  const noFlipLastVideo = getFlipCount() === 0 && state.pages[state.pages.length - 1]?.type === "video";
  return (noFlipLastVideo ? 0 : getFlipTimelineDuration()) + getEndHoldDuration();
}

function getFlipTimelineDuration() {
  const flipCount = getFlipCount();
  return flipCount ? flipCount * (state.interval + state.flip) : state.interval;
}

function getEndHoldDuration() {
  const lastPage = state.pages[state.pages.length - 1];
  if (lastPage?.type !== "video") return timelineSettings.endHold;
  const duration = lastPage.source.duration;
  return Number.isFinite(duration) ? Math.max(timelineSettings.endHold, duration) : timelineSettings.endHold;
}

function spreadLeftIndex(completedFlips) {
  return Math.min(spreadPageIndex(completedFlips, "left"), state.textures.length - 1);
}

function spreadRightIndex(completedFlips) {
  const index = spreadPageIndex(completedFlips, "right");
  return index < state.textures.length ? index : -1;
}

function flipFrontIndex(flipIndex) {
  return 2 * flipIndex + 1;
}

function renderTimelinePose(pose) {
  switch (pose.mode) {
    case "closed":
      renderClosedBook();
      break;
    case "open":
      renderOpeningBook(pose.progress);
      break;
    case "flip":
      renderActiveFlip(pose.flipIndex, pose.progress);
      break;
    case "spread":
      renderSpread(pose.completedFlips);
      break;
    case "end":
      renderEndSpread();
      break;
    default:
      renderIdleSpread();
  }
}

function renderClosedBook() {
  setBookStructureVisible(false);
  setMeshVisible(meshRefs.leftPage, false);
  setMeshVisible(meshRefs.revealPage, false);
  setMeshVisible(meshRefs.sweepShadow, false);
  showTurningSheet(0, 0, 0, { centered: true, clampBack: true });
  setStackThickness(meshRefs.leftStack, 0);
  setStackThickness(meshRefs.rightStack, 0);
}

function renderOpeningBook(progress) {
  setBookStructureVisible(progress > 0.04);
  setMeshVisible(meshRefs.leftPage, false);
  setMeshVisible(meshRefs.revealPage, true);
  setMeshTexture(meshRefs.revealPage, 1);
  settlePage(meshRefs.revealPage);
  showTurningSheet(0, 0, progress, { centered: true, clampBack: true });
  updateStacks(0, progress, "open");
}

function renderSpread(completedFlips) {
  setBookStructureVisible(true);
  setMeshVisible(meshRefs.turnFront, false);
  setMeshVisible(meshRefs.turnBack, false);
  setMeshVisible(meshRefs.sweepShadow, false);
  setMeshVisible(meshRefs.leftPage, true);
  setMeshVisible(meshRefs.revealPage, true);
  setMeshTexture(meshRefs.leftPage, spreadLeftIndex(completedFlips), { clamp: true });
  setMeshTexture(meshRefs.revealPage, spreadRightIndex(completedFlips));
  settlePage(meshRefs.leftPage);
  settlePage(meshRefs.revealPage);
  updateStacks(completedFlips + 1, 0, "spread");
}

function renderActiveFlip(flipIndex, progress) {
  setBookStructureVisible(true);
  const frontIndex = flipFrontIndex(flipIndex);
  const backIndex = Math.min(frontIndex + 1, state.textures.length - 1);
  const revealIndex = frontIndex + 2;
  const turnSide = activeTurnSide();
  setMeshVisible(meshRefs.leftPage, true);
  setMeshVisible(meshRefs.revealPage, true);
  if (turnSide === "right") {
    setMeshTexture(meshRefs.leftPage, spreadLeftIndex(flipIndex), { clamp: true });
    setMeshTexture(meshRefs.revealPage, revealIndex);
  } else {
    setMeshTexture(meshRefs.leftPage, revealIndex);
    setMeshTexture(meshRefs.revealPage, spreadRightIndex(flipIndex), { clamp: true });
  }
  settlePage(meshRefs.leftPage);
  settlePage(meshRefs.revealPage);
  showTurningSheet(frontIndex, backIndex, progress, { centered: false, clampBack: true, side: turnSide });
  updateStacks(flipIndex + 1, progress, "flip");
}

function renderEndSpread() {
  prepareLastVideoOnce();
  renderSpread(getFlipCount());
}

function renderIdleSpread() {
  setBookStructureVisible(true);
  setMeshVisible(meshRefs.leftPage, false);
  setMeshVisible(meshRefs.revealPage, true);
  setMeshTexture(meshRefs.revealPage, 0);
  settlePage(meshRefs.revealPage);
  setMeshVisible(meshRefs.turnFront, false);
  setMeshVisible(meshRefs.turnBack, false);
  setMeshVisible(meshRefs.sweepShadow, false);
  updateStacks(0, 0, "idle");
}

function showTurningSheet(frontIndex, backIndex, progress, options = {}) {
  setMeshVisible(meshRefs.turnFront, true);
  setMeshVisible(meshRefs.turnBack, true);
  setMeshTexture(meshRefs.turnFront, frontIndex, options);
  setMeshTexture(meshRefs.turnBack, backIndex, { clamp: options.clampBack });
  poseTurningSheet(progress, options);
}

function poseTurningSheet(progress, options = {}) {
  const { pageW } = ratioSizes[state.ratio];
  const curl = Math.sin(progress * Math.PI);
  const side = options.side || activeTurnSide();
  const sideSign = side === "right" ? 1 : -1;
  const angleProgress = Math.pow(progress, 1.22);
  const angle = -Math.PI * angleProgress * sideSign;
  const centeredOffset = options.centered ? -sideSign * pageW * 0.5 * (1 - progress) : 0;
  for (const mesh of [meshRefs.turnFront, meshRefs.turnBack]) {
    if (!mesh) continue;
    mesh.rotation.y = angle;
    mesh.position.x = centeredOffset;
    mesh.position.y = 0;
    mesh.position.z = 0.092 + curl * 0.075;
    bendPage(mesh, progress);
  }

  if (meshRefs.sweepShadow) {
    meshRefs.sweepShadow.visible = progress > 0.02 && progress < 0.98;
    meshRefs.sweepShadow.material.opacity = curl * 0.34;
    meshRefs.sweepShadow.position.x = -sideSign * pageW * (0.08 + progress * 0.16);
    meshRefs.sweepShadow.scale.x = 0.78 + progress * 0.34;
  }
}

function updateStacks(leftSheets, activeProgress, mode) {
  const totalSheets = Math.max(1, Math.ceil(state.textures.length / 2));
  const maxThickness = Math.min(0.055, 0.006 * totalSheets + 0.018);
  const sheetThickness = maxThickness / totalSheets;
  let leftThickness = Math.max(0, leftSheets * sheetThickness);
  let rightThickness = Math.max(0, (totalSheets - leftSheets) * sheetThickness);
  if (mode === "closed") {
    leftThickness = 0;
    rightThickness = maxThickness;
  } else if (mode === "open") {
    leftThickness = activeProgress * sheetThickness;
    rightThickness = Math.max(0, maxThickness - leftThickness);
  } else if (mode === "flip") {
    leftThickness += activeProgress * sheetThickness;
    rightThickness = Math.max(0, rightThickness - activeProgress * sheetThickness);
  }
  if (state.binding === "right") {
    [leftThickness, rightThickness] = [rightThickness, leftThickness];
  }
  setStackThickness(meshRefs.leftStack, leftThickness);
  setStackThickness(meshRefs.rightStack, rightThickness);
}

function setStackThickness(mesh, thickness) {
  if (!mesh) return;
  mesh.visible = thickness > 0.002;
  mesh.scale.z = Math.max(0.001, thickness);
  mesh.position.z = -0.075 + thickness / 2;
}

function bendPage(mesh, progress) {
  const basePositions = mesh.geometry.userData.basePositions;
  if (!basePositions) return;
  const { pageW, pageH } = ratioSizes[state.ratio];
  const side = mesh.geometry.userData.side;
  const sideSign = side === "right" ? 1 : -1;
  const positions = mesh.geometry.attributes.position;
  const curl = Math.sin(progress * Math.PI);
  for (let i = 0; i < positions.count; i += 1) {
    const offset = i * 3;
    const x = basePositions[offset];
    const y = basePositions[offset + 1];
    const u = side === "left" ? clamp01(Math.abs(x) / pageW) : clamp01(x / pageW);
    const verticalSoftness = 1 - Math.min(1, Math.abs(y) / (pageH / 2));
    const arch = Math.sin(u * Math.PI * 0.92) * curl;
    positions.array[offset] = x - sideSign * Math.sin(u * Math.PI) * curl * 0.26;
    positions.array[offset + 1] = y + arch * verticalSoftness * 0.018;
    positions.array[offset + 2] = basePositions[offset + 2] + arch * 0.46 + Math.pow(u, 2.5) * curl * 0.055;
  }
  positions.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

function settlePage(mesh) {
  const basePositions = mesh.geometry.userData.basePositions;
  if (!basePositions) return;
  const { pageW } = ratioSizes[state.ratio];
  const side = mesh.geometry.userData.side;
  const positions = mesh.geometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const offset = i * 3;
    const x = basePositions[offset];
    const u = side === "left" ? clamp01(Math.abs(x) / pageW) : clamp01(x / pageW);
    positions.array[offset] = x;
    positions.array[offset + 1] = basePositions[offset + 1];
    positions.array[offset + 2] = basePositions[offset + 2] + Math.sin(u * Math.PI) * 0.025;
  }
  positions.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

function renderPageList() {
  els.pageList.innerHTML = "";
  els.pageCount.textContent = pageCountLabel(state.pages.length);
  if (!state.pages.some((page) => page.id === state.selectedPageId)) state.selectedPageId = null;
  state.pages.forEach((page, index) => {
    const card = document.createElement("article");
    card.className = "page-card";
    card.draggable = true;
    card.dataset.pageId = page.id;
    card.classList.toggle("selected", page.id === state.selectedPageId);
    if (page.id === state.draggingPageId) card.classList.add("dragging");

    const handle = document.createElement("button");
    handle.className = "drag-handle";
    handle.type = "button";
    handle.title = copy().dragToReorder;
    handle.ariaLabel = copy().dragToReorder;
    handle.innerHTML = '<i data-lucide="grip-vertical"></i>';

    const thumb = document.createElement("div");
    thumb.className = "page-thumb";
    if (page.type === "image") {
      const img = document.createElement("img");
      img.src = page.url;
      img.alt = "";
      thumb.append(img);
    } else if (page.type === "video") {
      const video = document.createElement("video");
      video.src = page.url;
      video.muted = true;
      video.playsInline = true;
      thumb.append(video);
    } else {
      const icon = document.createElement("i");
      icon.dataset.lucide = "file-text";
      thumb.append(icon);
    }

    const meta = document.createElement("div");
    meta.className = "page-meta";
    const summary = page.type === "text" ? page.body || page.text || copy().textPage : page.type === "video" ? copy().video : copy().image;
    meta.innerHTML = `<strong>${index + 1}. ${escapeHtml(page.title)}</strong><span>${escapeHtml(summary)}</span>`;

    const remove = document.createElement("button");
    remove.className = "icon-button";
    remove.type = "button";
    remove.title = copy().deletePage;
    remove.ariaLabel = copy().deletePage;
    remove.innerHTML = '<i data-lucide="x"></i>';
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      removePage(page.id);
    });

    card.addEventListener("click", () => {
      state.selectedPageId = page.id;
      renderPageList();
    });
    card.addEventListener("dragstart", (event) => {
      state.draggingPageId = page.id;
      state.selectedPageId = page.id;
      card.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", page.id);
    });
    card.addEventListener("dragover", (event) => {
      if (!state.draggingPageId || state.draggingPageId === page.id) return;
      event.preventDefault();
      const rect = card.getBoundingClientRect();
      card.classList.toggle("drop-after", event.clientY > rect.top + rect.height / 2);
      card.classList.toggle("drop-before", event.clientY <= rect.top + rect.height / 2);
    });
    card.addEventListener("dragleave", () => {
      card.classList.remove("drop-before", "drop-after");
    });
    card.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const draggedId = event.dataTransfer.getData("text/plain") || state.draggingPageId;
      const rect = card.getBoundingClientRect();
      reorderPage(draggedId, page.id, { after: event.clientY > rect.top + rect.height / 2 });
    });
    card.addEventListener("dragend", () => {
      state.draggingPageId = null;
      renderPageList();
    });

    card.append(handle, thumb, meta, remove);
    els.pageList.append(card);
  });
  createIcons({ icons });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function removePage(id) {
  const page = state.pages.find((item) => item.id === id);
  if (page?.url) URL.revokeObjectURL(page.url);
  state.pages = state.pages.filter((item) => item.id !== id);
  if (state.selectedPageId === id) state.selectedPageId = null;
  state.currentIndex = 0;
  updateVideoLoopModes();
  rebuildBook();
}

function clearPages() {
  state.pages.forEach((page) => {
    if (page.url) URL.revokeObjectURL(page.url);
  });
  state.pages = [];
  state.currentIndex = 0;
  state.selectedPageId = null;
  state.draggingPageId = null;
  state.endVideoStarted = false;
  els.downloadLink.classList.add("hidden");
  rebuildBook();
}

function reorderPage(draggedId, targetId, options = {}) {
  if (!draggedId || !targetId || draggedId === targetId) return;
  const fromIndex = state.pages.findIndex((page) => page.id === draggedId);
  const targetIndex = state.pages.findIndex((page) => page.id === targetId);
  if (fromIndex < 0 || targetIndex < 0) return;
  const [movedPage] = state.pages.splice(fromIndex, 1);
  const liveTargetIndex = state.pages.findIndex((page) => page.id === targetId);
  const insertIndex = liveTargetIndex + (options.after ? 1 : 0);
  state.pages.splice(insertIndex, 0, movedPage);
  state.selectedPageId = movedPage.id;
  state.draggingPageId = null;
  state.currentIndex = 0;
  state.endVideoStarted = false;
  updateVideoLoopModes();
  rebuildBook();
}

function movePageToEnd(draggedId) {
  if (!draggedId) return;
  const fromIndex = state.pages.findIndex((page) => page.id === draggedId);
  if (fromIndex < 0 || fromIndex === state.pages.length - 1) return;
  const [movedPage] = state.pages.splice(fromIndex, 1);
  state.pages.push(movedPage);
  state.selectedPageId = movedPage.id;
  state.draggingPageId = null;
  state.currentIndex = 0;
  state.endVideoStarted = false;
  updateVideoLoopModes();
  rebuildBook();
}

function resizeRenderer() {
  const wrap = canvas.parentElement.getBoundingClientRect();
  renderer.setSize(wrap.width, wrap.height, false);
  fitBookToViewport(wrap.width, wrap.height);
}

function fitBookToViewport(width, height) {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  const { pageW, pageH } = ratioSizes[state.ratio];
  const spreadW = pageW * 2.08;
  const baseScale = camera.aspect < 0.8 ? 0.72 : 0.94;
  const zoom = THREE.MathUtils.clamp(state.zoom, 0.65, 1.35);
  const bookAngleT = clamp01((state.bookAngle - 40) / 45);
  const fovTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const distanceForHeight = (pageH * baseScale * 0.58) / fovTan;
  const distanceForWidth = (spreadW * baseScale * 0.54) / (fovTan * camera.aspect);
  bookGroup.scale.setScalar(baseScale * zoom);
  bookGroup.position.y = 0;
  bookGroup.rotation.x = THREE.MathUtils.lerp(-0.02, -0.36, bookAngleT);
  bookGroup.rotation.y = camera.aspect < 0.8 ? -0.08 : -0.2;
  const cameraDistance = Math.max(distanceForHeight, distanceForWidth) + 0.7;
  camera.position.set(0, 0.18, cameraDistance);
  camera.lookAt(0, 0, 0);
  shadowPlane.scale.set((spreadW + 0.8) / 5.4, (pageH + 0.55) / 3.8, 1);
  fitBackgroundPlane(width, height);
}

function renderFrameOnce() {
  refreshDynamicVideoTextures();
  shadowPlane.material.opacity = 0.17;
  renderer.render(scene, camera);
}

function render(now = performance.now()) {
  refreshDynamicVideoTextures();
  if (state.playing) {
    const elapsed = (now - state.playStartedAt) / 1000;
    updatePageTransforms(elapsed);
    const totalDuration = getTotalDuration();
    if (elapsed > totalDuration) {
      state.playing = false;
      els.statusText.textContent = copy().previewComplete;
    }
  }

  renderFrameOnce();
  requestAnimationFrame(render);
}

function preview() {
  if (!state.pages.length) return;
  state.playing = true;
  state.exportMode = false;
  state.playStartedAt = performance.now();
  els.statusText.textContent = `${copy().previewing} · ${ratioLabel()}`;
  els.downloadLink.classList.add("hidden");
  playTimelineVideos({ includeLast: false });
}

async function exportVideo() {
  if (!state.pages.length || state.recording) return;
  if (typeof MediaRecorder === "undefined") {
    els.statusText.textContent = copy().mediaRecorderUnsupported;
    return;
  }
  const recordingType = getRecordingType(state.exportFormat);
  if (!recordingType) {
    els.statusText.textContent = copy().formatUnsupported;
    return;
  }

  const { width, height } = ratioSizes[state.ratio];
  const oldSize = canvas.getBoundingClientRect();
  const oldPixelRatio = renderer.getPixelRatio();
  state.recording = true;
  state.exportMode = true;
  state.playing = false;
  els.exportBtn.disabled = true;
  els.previewBtn.disabled = true;
  els.downloadLink.classList.add("hidden");
  els.statusText.textContent = `${copy().generating} · ${ratioLabel()}`;

  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  fitBookToViewport(width, height);

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType: recordingType.mimeType,
    videoBitsPerSecond: state.ratio === "16:9" ? 9_000_000 : 7_000_000,
  });
  const chunks = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  const done = new Promise((resolve) => {
    recorder.onstop = resolve;
  });

  playTimelineVideos({ includeLast: false });
  updatePageTransforms(0);
  refreshDynamicVideoTextures();
  renderer.render(scene, camera);

  recorder.start(250);
  const totalDuration = getTotalDuration();
  const started = performance.now();
  while ((performance.now() - started) / 1000 < totalDuration) {
    const elapsed = (performance.now() - started) / 1000;
    updatePageTransforms(elapsed);
    refreshDynamicVideoTextures();
    renderer.render(scene, camera);
    await sleep(1000 / 30);
  }
  recorder.stop();
  await done;

  const blob = new Blob(chunks, { type: recordingType.mimeType });
  const url = URL.createObjectURL(blob);
  if (els.downloadLink.href) URL.revokeObjectURL(els.downloadLink.href);
  els.downloadLink.href = url;
  els.downloadLink.download = `flipbook-${state.ratio.replace(":", "x")}.${recordingType.extension}`;
  els.downloadLink.classList.remove("hidden");
  els.statusText.textContent = `${copy().done} · ${Math.round(blob.size / 1024 / 1024 * 10) / 10} MB`;

  state.recording = false;
  state.exportMode = false;
  els.exportBtn.disabled = false;
  els.previewBtn.disabled = false;
  renderer.setPixelRatio(oldPixelRatio);
  renderer.setSize(oldSize.width, oldSize.height, false);
  resizeRenderer();
}

function setRatio(ratio) {
  if (state.recording || !ratio || state.ratio === ratio) return;
  state.playing = false;
  state.ratio = ratio;
  document.querySelectorAll("[data-ratio]").forEach((segment) => {
    segment.classList.toggle("active", segment.dataset.ratio === ratio);
  });
  rebuildBook();
}

function setExportFormat(format) {
  if (state.recording) return;
  const nextFormat = format === "mov" ? "mov" : "mp4";
  if (state.exportFormat === nextFormat) return;
  state.exportFormat = nextFormat;
  document.querySelectorAll("[data-export-format]").forEach((button) => {
    button.classList.toggle("active", button.dataset.exportFormat === state.exportFormat);
  });
  els.downloadLink.download = `flipbook-video.${state.exportFormat}`;
}

function setBindingDirection(binding) {
  if (state.recording) return;
  const nextBinding = binding === "right" ? "right" : "left";
  if (state.binding === nextBinding) return;
  state.playing = false;
  state.binding = nextBinding;
  document.querySelectorAll("[data-binding]").forEach((button) => {
    button.classList.toggle("active", button.dataset.binding === state.binding);
  });
  rebuildBookMeshes();
}

function setBookAngle(value) {
  if (state.recording) return;
  state.bookAngle = Number(value);
  els.bookAngleOutput.value = `${Math.round(state.bookAngle)}°`;
  resizeRenderer();
  renderFrameOnce();
}

function setZoom(value) {
  if (state.recording) return;
  state.zoom = Number(value);
  els.zoomOutput.value = `${state.zoom.toFixed(2)}x`;
  resizeRenderer();
  renderFrameOnce();
}

function setAccent(value) {
  state.accent = value;
  document.documentElement.style.setProperty("--accent", value);
  updateBackgroundSurface();
  rebuildBook();
}

els.assetInput.addEventListener("change", (event) => {
  addFiles(event.target.files);
  event.target.value = "";
});

["dragenter", "dragover"].forEach((eventName) => {
  els.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.dropZone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  els.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.dropZone.classList.remove("dragging");
  });
});

els.dropZone.addEventListener("drop", (event) => {
  addFiles(event.dataTransfer.files);
});

els.addTextBtn.addEventListener("click", addTextPages);
els.textTitleInput.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    addTextPages();
  }
});
els.textInput.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    addTextPages();
  }
});

els.pageList.addEventListener("dragover", (event) => {
  if (!state.draggingPageId) return;
  event.preventDefault();
});

els.pageList.addEventListener("drop", (event) => {
  const dropTarget = event.target instanceof Element ? event.target.closest(".page-card") : null;
  if (!state.draggingPageId || dropTarget) return;
  event.preventDefault();
  movePageToEnd(event.dataTransfer.getData("text/plain") || state.draggingPageId);
});

document.querySelectorAll("[data-ratio]").forEach((segment) => {
  segment.addEventListener("click", () => setRatio(segment.dataset.ratio));
});

document.querySelectorAll("[data-export-format]").forEach((segment) => {
  segment.addEventListener("click", () => setExportFormat(segment.dataset.exportFormat));
});

document.querySelectorAll("[data-binding]").forEach((segment) => {
  segment.addEventListener("click", () => setBindingDirection(segment.dataset.binding));
});

els.languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

els.holdInput.addEventListener("input", () => {
  state.interval = Number(els.holdInput.value);
  els.holdOutput.value = `${state.interval.toFixed(2)}s`;
});

els.flipInput.addEventListener("input", () => {
  state.flip = Number(els.flipInput.value);
  els.flipOutput.value = `${state.flip.toFixed(2)}s`;
});

els.bookAngleInput.addEventListener("input", () => setBookAngle(els.bookAngleInput.value));
els.zoomInput.addEventListener("input", () => setZoom(els.zoomInput.value));
els.accentInput.addEventListener("input", () => setAccent(els.accentInput.value));
els.backgroundImageInput.addEventListener("change", async (event) => {
  await setBackgroundImage(event.target.files[0]);
  event.target.value = "";
});
els.clearBackgroundBtn.addEventListener("click", clearBackgroundImage);
els.clearPagesBtn.addEventListener("click", clearPages);
els.resetBtn.addEventListener("click", clearPages);
els.previewBtn.addEventListener("click", preview);
els.exportBtn.addEventListener("click", exportVideo);

window.addEventListener("resize", resizeRenderer);

createIcons({ icons });
setLanguage(detectInitialLanguage(), { persist: false, updateUrl: false, rerender: false });
rebuildBook();
requestAnimationFrame(render);
