import { covers } from "./covers.js";

//
//
const bodyElements = {
  url: document.querySelector('meta[property="og:url"]'),
  header: document.querySelector("body > header"),
  resetButtons: document.querySelectorAll('a[data-id="base-clickable"]'),
  GQlogos: document.querySelectorAll(".logo"),
  yearsContainer: document.querySelector(".one-nav-container"),
  main: document.querySelector("main"),
  summaryCollection: document.querySelector(".summary-collection-content"),
  footers: document.querySelectorAll(".footer"),
  popup: document.querySelector(".popup"),
  popupContent: document.querySelector(".popup-content"),
  GQlogo: document.getElementById("GQ-logo"),
  itemTemplate: document.getElementById("summary-item-template"),
  pictureTemplate: document.getElementById("picture-template"),
}; // Элементы тела страницы
const basicLink = bodyElements.url.content; // Главная ссылка
const popupElements = {
  header: bodyElements.popup.querySelector(".header"),
  hed: bodyElements.popupContent.querySelector(".content-header"),
  hedContainer: bodyElements.popupContent.querySelector(
    ".content-header-container",
  ),
  title: bodyElements.popupContent.querySelector("h1"),
  date: bodyElements.popupContent.querySelector("time"),
  articleBody: bodyElements.popupContent.querySelector(".article-body"),
}; // Элементы попапа
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]; // Названия месяцев для форматирования даты
const formatDate = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return `${+day} ${months[+month - 1]} ${year}`;
}; // Форматируем дату
const textToSlug = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\$/g, "s")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}; // Текст в URL-формат
const deleteNum = (name) =>
  name.replace(/(?<=[A-Za-z])\d+|\d+(?=[A-Za-z])/g, "").trim(); // Удаление слипшихся с текстом цифр
const buildUrl = (type, name, mark = "", { mobile = false } = {}) => {
  const slug = textToSlug(name);
  const mobilePath = mobile ? "/mobile" : "";

  switch (type) {
    case "cover":
      return `${basicLink}images/covers/${slug}/cover.webp`;
    case "poster":
      return `${basicLink}images/posters/${slug}/${mark}.jpg`;
    case "video":
      return `${basicLink}video/${slug}/${mark}.mp4`;
    default:
      return `${basicLink}images/covers/${slug}${mobilePath}/${mark}.webp`;
  }
}; // Генерация URL
const showImage = (img) => {
  const onLoadOrError = () => {
    img.style.opacity = "1";
    img.removeEventListener("load", onLoadOrError);
    img.removeEventListener("error", onLoadOrError);
  };

  if (img.complete) {
    onLoadOrError();
  } else {
    img.addEventListener("load", onLoadOrError, { once: true });
    img.addEventListener("error", onLoadOrError, { once: true });
  }
}; // Функция для настройки загрузки изображения
const createVideoElement = (key, mark) => {
  const video = document.createElement("video");
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("loop", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("preload", "auto");
  video.poster = buildUrl("poster", key, mark);
  video.src = buildUrl("video", key, mark);
  return video;
}; // Создание видеоэлемента
const createImageTemplate = () => {
  const template = bodyElements.pictureTemplate.content.cloneNode(true);
  const picture = template.querySelector("picture");
  const sources = picture.querySelectorAll("source");
  const img = picture.querySelector("img");

  return { template, picture, sources, img };
}; // Создание базового шаблона изображения

//
//
//
const openPopup = (popup) => {
  const body = document.body;
  const scrollPosition = window.scrollY;
  body.dataset.scrollPosition = scrollPosition;
  body.style.top = `-${scrollPosition}px`;
  body.classList.add("scroll-lock");
  popup.classList.add("is-open");
  document.addEventListener("keydown", closePopupByEsc);
}; // Открытие модуля
const closePopup = (popup) => {
  const body = document.body;
  const scrollPosition = body.dataset.scrollPosition;
  body.style.top = "";
  body.classList.remove("scroll-lock");
  window.scrollTo(0, scrollPosition);
  popup.classList.remove("is-open");
  document.removeEventListener("keydown", closePopupByEsc);
}; // Закрытие модуля
const closePopupByEsc = (e) => {
  if (e.key === "Escape") closePopup(document.querySelector(".is-open"));
}; // Закрытие модуля по Esc
const addCloseOverlayListener = (element) => {
  element.addEventListener("click", function (e) {
    if (e.target === e.currentTarget) closePopup(e.currentTarget);
  });
}; // Закрытие модуля при нажатии вне его
popupElements.header.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    closePopup(bodyElements.popup);
  } else {
    bodyElements.popup.scrollTop = 0;
  }
}); // Обработчик на шапку попапа: закрытие по лого и скролл наверх по самой шапке

//
//
//
const updateStickinessHeader = (source, prop, header, isActive) => {
  if (!header) return;

  let last = source[prop];
  const sensitivity = 4;

  source.addEventListener(
    "scroll",
    () => {
      window.requestAnimationFrame(() => {
        const current = source[prop];
        const delta = current - last;

        if (isActive?.(current) === false) {
          last = current;
          return;
        }

        if (current === 0) {
          header.classList.remove("is-hidden");
          last = current;
          return;
        }

        if (Math.abs(delta) < sensitivity) {
          last = current;
          return;
        }

        const shouldHide = current > last;

        if (shouldHide) {
          header.classList.add("is-hidden");
        } else {
          header.classList.remove("is-hidden");
        }

        last = current;
      });
    },
    { passive: true },
  );
}; // Функция обновления состояния шапок при скролле
const additionYearsHeader = (data, container) => {
  const years = [
    ...new Set(
      Object.values(data).map(({ published }) => published.slice(0, 4)),
    ),
  ].sort((a, b) => b - a);

  years.forEach((year) => {
    const link = document.createElement("a");
    link.className = "one-nav-clickable";
    link.textContent = year;
    container.appendChild(link);
  });
}; // Года в header
const createTitleYear = (container, year) => {
  const heading = container.querySelector("h1.year-header-hed");

  if (heading) {
    heading.textContent = year.textContent.trim();
  } else {
    const newHeading = document.createElement("h1");
    newHeading.className = "year-header-hed";
    newHeading.textContent = year.textContent.trim();
    container.insertBefore(newHeading, container.firstChild);
  }
}; // Создание заголовка с выбранным годом
const createCovers = (data, container) => {
  container.innerHTML = "";

  const activeYear =
    document
      .querySelector(
        '.one-nav-container a.active:not([data-id="base-clickable"])',
      )
      ?.textContent.trim() || null;

  const fragment = document.createDocumentFragment();

  Object.entries(data)
    .filter(
      ([, person]) =>
        !activeYear || person.published.split("-")[0] === activeYear,
    )
    .forEach(([key, data]) => {
      const clone = bodyElements.itemTemplate.content.cloneNode(true);

      const [item, img, title, date] = clone.querySelectorAll(
        ".summary-item, img, h2, time",
      );

      item.dataset.name = key;

      img.style.opacity = "0";
      img.src = buildUrl("cover", key);
      img.alt = deleteNum(key);
      showImage(img);

      title.textContent = deleteNum(key);
      date.textContent = formatDate(data.published);

      fragment.appendChild(clone);
    });

  container.appendChild(fragment);
}; // Функция выведения covers на страницу
const openCover = (key) => {
  const data = covers[key];
  const { hed, hedContainer, title, date, articleBody } = popupElements;
  const popup = bodyElements.popup;

  hedContainer.innerHTML = "";
  articleBody.innerHTML = "";

  const headerFlags = data.cases?.header || [];

  if (headerFlags.includes("video")) {
    hedContainer.appendChild(createVideoElement(key, "header"));
    // hedContainer.classList.remove("grid-wrapper");
  } else {
    const { template, picture, sources, img } = createImageTemplate();

    hedContainer.classList.toggle(
      "grid-wrapper",
      !headerFlags.includes("horizontal"),
    );

    sources[0].srcset = headerFlags.includes("cover")
      ? buildUrl("cover", key)
      : buildUrl("img", key, "header", { mobile: true });
    sources[1].srcset = buildUrl("img", key, "header");

    img.style.opacity = "0";
    img.src = sources[1].srcset;
    img.alt = deleteNum(key);
    showImage(img);

    hedContainer.appendChild(template);
  }

  hed.classList.toggle("video", headerFlags.includes("video"));
  hed.classList.toggle("line", headerFlags.includes("row"));
  if (headerFlags.includes("video") || headerFlags.includes("row"))
    hedContainer.classList.remove("grid-wrapper");
  title.textContent = deleteNum(key);
  date.textContent = formatDate(data.published);

  const fragment = document.createDocumentFragment();
  const cases = data.cases || {};

  for (let i = 1; i <= data.gallery; i++) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("asset-embed");

    const div = document.createElement("div");

    let sizeClass = "grid-wrapper";
    if (cases.special?.includes(i)) sizeClass = "special";
    else if (cases["50"]?.includes(i)) sizeClass = "width-50";
    else if (cases["33"]?.includes(i)) sizeClass = "width-33";
    else if (cases["25"]?.includes(i)) sizeClass = "width-25";
    else if (cases.horizontal?.includes(i)) sizeClass = "horizontal-img";

    if (cases.mobile?.includes(i)) sizeClass += " mobile";

    div.className = sizeClass;

    if (cases.video?.includes(i)) {
      div.appendChild(createVideoElement(key, i));
    } else {
      const { template, picture, sources, img } = createImageTemplate();

      sources[0].srcset = buildUrl("image", key, i, { mobile: true });
      sources[1].srcset = buildUrl("image", key, i);
      img.style.opacity = "0";
      img.src = sources[0].srcset;
      img.alt = deleteNum(key);
      showImage(img);

      div.appendChild(template);
    }

    wrapper.appendChild(div);
    fragment.appendChild(wrapper);
  }

  articleBody.appendChild(fragment);
  popup.scrollTop = 0;
  openPopup(popup);
  addCloseOverlayListener(popup);
}; // Открытие модального окна с галереей

//
//
//
bodyElements.resetButtons.forEach((button) => {
  const { yearsContainer, main, summaryCollection, resetButtons } =
    bodyElements;

  button.addEventListener("click", (e) => {
    e.preventDefault();

    yearsContainer
      .querySelectorAll('a:not([data-id="base-clickable"])')
      .forEach((l) => l.classList.remove("active"));

    const heading = main.querySelector("h1.year-header-hed");
    heading?.remove();

    createCovers(covers, summaryCollection);

    resetButtons.forEach((btn) => btn.classList.add("active"));

    window.scrollTo(0, 0);
  });
}); // Обработчик для кнопок reset
bodyElements.yearsContainer.addEventListener("click", (e) => {
  const link = e.target.closest('a:not([data-id="base-clickable"])');
  if (!link) return;

  const { yearsContainer, resetButtons, summaryCollection, main } =
    bodyElements;

  e.preventDefault();

  yearsContainer
    .querySelectorAll('a:not([data-id="base-clickable"])')
    .forEach((l) => l.classList.remove("active"));
  link.classList.add("active");

  resetButtons.forEach((btn) => btn.classList.remove("active"));

  createCovers(covers, summaryCollection);
  createTitleYear(main, link);
  window.scrollTo(0, 0);
}); // Обработчик на года
bodyElements.summaryCollection.addEventListener("click", (e) => {
  const cover = e.target.closest(".summary-item");
  if (!cover) return;

  openCover(cover.getAttribute("data-name"));
}); // Обработчик на клики по профилям
bodyElements.footers.forEach((element) => {
  element.addEventListener("click", (e) => {
    if (!e.target.closest("a")) return;

    e.preventDefault();

    if (e.target.closest(".popup")) {
      bodyElements.popup.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  });
}); // Обработчики на логотипы в footer

document.addEventListener("DOMContentLoaded", () => {
  const { header, GQlogo, GQlogos, yearsContainer, summaryCollection, popup } =
    bodyElements;

  if (localStorage.getItem("theme") === "dark")
    document.body.classList.add("dark-theme"); // Тема

  const svgTemplate = GQlogo.content.cloneNode(true);
  GQlogos.forEach((link) => link.appendChild(svgTemplate.cloneNode(true))); // svg GQ в нужные ссылки

  updateStickinessHeader(window, "scrollY", header); // Обработчик скролла
  if (popup) {
    updateStickinessHeader(popup, "scrollTop", popupElements.header, () =>
      popup.classList.contains("is-open"),
    );
  } // Обработчик скролла popup
  additionYearsHeader(covers, yearsContainer); // Года в header
  createCovers(covers, summaryCollection); // Ввыведение covers на страницу
});
