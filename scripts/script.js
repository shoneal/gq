import { covers } from "./covers.js";

const basicLink = "https://shoneal.github.io/gq/images/covers"; // Главная ссылка

const header = document.querySelector("header");
const mainLink = header.querySelector(".logo-clickable");
const yearsContainer = header.querySelector(".years");
const main = document.querySelector("main");
const summaryCollection = document.querySelector(".summary-collection");
const popup = document.querySelector(".popup");
const popupHeader = popup.querySelector(".header");
const closeBtn = popup.querySelector(".logo");
const template = document.querySelector("template");

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
function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
} // Форматируем дату
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\$/g, "s") // $ → s (явное правило)
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9\s-]/g, "") // остальные спецсимволы удаляем
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
} // Создаёт slug для URL изображения
const setupImageWithContainer = (img) => {
  const onLoadOrError = () => {
    img.style.opacity = "1";
    img.removeEventListener("load", onLoadOrError);
    img.removeEventListener("error", onLoadOrError);
  };

  if (img.complete) {
    onLoadOrError();
  } else {
    img.addEventListener("load", onLoadOrError);
    img.addEventListener("error", onLoadOrError);
  }
}; // Функция для настройки прозрачности изображения
const clearContainer = (el) => el.replaceChildren?.() || (el.innerHTML = ""); // Очистка divoв
const openPopup = (popup) => {
  const body = document.body;
  const scrollPosition = window.scrollY;
  body.dataset.scrollPosition = scrollPosition;
  body.style.top = `-${scrollPosition}px`;
  body.classList.add("scroll-lock");
  popup.classList.add("popup_is-opened");
  document.addEventListener("keydown", closePopupByEsc);
}; // Открытие popup
const closePopup = (popup) => {
  const body = document.body;
  const scrollPosition = body.dataset.scrollPosition;
  body.style.top = "";
  body.classList.remove("scroll-lock");
  window.scrollTo(0, scrollPosition);
  popup.classList.remove("popup_is-opened");
  popup.querySelectorAll("img").forEach((img) => {
    img.src = "";
  });
  popup.querySelectorAll("source").forEach((source) => {
    source.srcset = "";
  });
  document.removeEventListener("keydown", closePopupByEsc);
}; // Закрытие popup
const closePopupByEsc = (e) =>
  e.key === "Escape" && closePopup(document.querySelector(".popup_is-opened")); // Закрытие popup по Esc
closeBtn.addEventListener("click", () => closePopup(popup)); // Клик по закрытию popup

const renderItems = (items) => {
  clearContainer(summaryCollection);
  const fragment = document.createDocumentFragment();

  items.forEach(([title, date, number]) => {
    const clone = template.content.cloneNode(true);
    const rootElement = clone.firstElementChild;
    const path = `${basicLink}/${generateSlug(title)}/`;

    const img = rootElement.querySelector(".summary-item-image");
    img.style.opacity = "0";
    img.src = `${path}cover.webp`;
    img.alt = title.replace(/[0-9]/g, "");
    setupImageWithContainer(img);

    rootElement.querySelector(".summary-item-hed").textContent = title.replace(
      /[0-9]/g,
      "",
    );
    rootElement.querySelector(".summary-item-publish-date").textContent =
      formatDate(date);

    rootElement.addEventListener("click", (e) => {
      const contentHeader = popup.querySelector(".content-header");
      const picture = contentHeader.querySelector(
        ".content-header-image-picture",
      );
      const mobileSource = picture.querySelector(
        'source[media="(max-width: 767px)"]',
      );
      const desktopSource = picture.querySelector(
        'source[media="(min-width: 768px)"]',
      );
      const imgEl = picture.querySelector("img");
      const time = contentHeader.querySelector(".content-publish-date");
      const name = contentHeader.querySelector(".content-header-hed");
      const wrapper = popup.querySelector(".content-embed-wrapper");
      const container = popup.querySelector(".group");

      desktopSource.srcset = imgEl.src = `${path}header.webp`;
      mobileSource.srcset = `${path}cover.webp`;
      imgEl.alt = title.replace(/[0-9]/g, "");
      imgEl.addEventListener("load", () => {
        contentHeader.classList.toggle(
          "row",
          imgEl.naturalWidth <= imgEl.naturalHeight,
        );
      });
      time.textContent = formatDate(date);
      name.textContent = title.replace(/[0-9]/g, "");

      wrapper.style.opacity = "0";
      wrapper.src = `${path}1.webp`;
      wrapper.alt = title.replace(/[0-9]/g, "");
      setupImageWithContainer(wrapper);

      container.style.opacity = "0";
      clearContainer(container);
      const images = [];

      for (let i = 2; i <= number; i++) {
        const img = document.createElement("img");
        img.src = `${path}/${i}.webp`;
        img.alt = title.replace(/[0-9]/g, "");
        img.loading = "lazy";

        container.append(img);
        images.push(img);
      }

      const assignClasses = () => {
        let verticalGroup = [];

        images.forEach((img, index) => {
          const isHorizontal = img.naturalWidth >= img.naturalHeight;

          if (isHorizontal) {
            img.classList.add("horizontal");
            if (verticalGroup.length > 0) {
              applyAloneImageToLast(verticalGroup);
              verticalGroup = [];
            }
          } else {
            verticalGroup.push(img);
          }

          if (index === images.length - 1) {
            applyAloneImageToLast(verticalGroup);
          }
        });

        container.style.opacity = "1";
      };

      const applyAloneImageToLast = (group) => {
        if (group.length % 2 === 1) {
          group[group.length - 1].classList.add("alone-image");
        }
      };

      Promise.all(
        images.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              }),
        ),
      ).then(assignClasses);

      openPopup(popup);
      popup.scrollTop = 0;
    });
    fragment.appendChild(clone);
  });

  summaryCollection.appendChild(fragment);
}; // Рендерит карточки в контейнер

const updateActiveState = (element) => {
  document
    .querySelectorAll(".text-clickable, .logo-clickable")
    .forEach((link) => {
      link.classList.remove("active");
    });

  if (element) {
    element.classList.add("active");
    if (element.matches(".text-clickable-main, .logo-clickable")) {
      document.querySelector(".text-clickable-main")?.classList.add("active");
      document.querySelector(".logo-clickable")?.classList.add("active");
    }
  }

  if (element.matches(".text-clickable-main, .logo-clickable")) {
    const sectionHeaderWrapper = document.querySelector(
      ".section-header-wrapper",
    );
    document.querySelector(".section-header-wrapper")?.remove();
  } else {
    let wrapper = document.querySelector(".section-header-wrapper");

    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "section-header-wrapper";
      main.prepend(wrapper);
    }

    if (wrapper) {
      let headerEl = wrapper.querySelector(".section-header");
      if (!headerEl) {
        headerEl = document.createElement("h1");
        headerEl.className = "section-header";
        wrapper.appendChild(headerEl);
      }
      headerEl.textContent = element.textContent;
    }
  }
}; // Активная кнопка
const handleClick = (e) => {
  let target =
    e.target.closest(".text-clickable") ||
    (e.target.matches(".logo-clickable") ? mainLink : null);
  if (!target || target.classList.contains("active")) return;

  const filteredItems = target.matches(".text-clickable-main, .logo-clickable")
    ? covers
    : covers.filter(([_, date]) => date.startsWith(target.textContent));

  updateActiveState(target);
  renderItems(filteredItems);
  window.scrollTo({ top: 0, behavior: "auto" });
}; // Нажатие на года
const createYearLinks = () => {
  const years = [
    ...new Set(covers.map(([_, date]) => date.split("-")[0])),
  ].sort((a, b) => b - a);
  const fragment = document.createDocumentFragment();

  years.forEach((year) => {
    const link = document.createElement("a");
    link.className = "text-clickable";
    link.textContent = year;
    fragment.appendChild(link);
  });

  yearsContainer.appendChild(fragment);
}; // Добавление годов в HTML

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark")
    document.body.classList.add("dark-theme"); // Тема

  const sourceSvg = document.querySelector(".logo-clickable.logo svg");
  if (!sourceSvg) return;
  document.querySelectorAll(".logo").forEach((el) => {
    if (!el.querySelector("svg")) {
      el.appendChild(sourceSvg.cloneNode(true));
    }
  }); // Svg во все Logo

  createYearLinks(covers);
  renderItems(covers);
  updateActiveState(mainLink);
  yearsContainer.addEventListener("click", handleClick);
  mainLink.addEventListener("click", handleClick);

  let lastScrollY = 0;
  let lastPopupScrollY = 0;
  window.addEventListener("scroll", () => {
    const currentY = window.scrollY;

    if (currentY === 0) {
      header?.classList.remove("header-hide");
    } else if (currentY !== lastScrollY) {
      header?.classList.toggle("header-hide", currentY > lastScrollY);
    }

    lastScrollY = currentY;
  });
  if (popup) {
    popup.addEventListener("scroll", () => {
      const currentY = popup.scrollTop;

      if (currentY === 0) {
        popupHeader.classList.remove("header-hide");
      } else if (currentY !== lastPopupScrollY) {
        popupHeader.classList.toggle(
          "header-hide",
          currentY > lastPopupScrollY,
        );
      }

      lastPopupScrollY = currentY;
    });
  } // Скрытие header'ов при скроллах страницы и popup

  document.querySelectorAll(".footer").forEach((element) => {
    element.addEventListener("click", (e) => {
      if (!e.target.closest("a")) return;

      e.preventDefault();

      if (e.target.closest(".popup")) {
        popup.scrollTop = 0;
      } else {
        window.scrollTo(0, 0);
      }
    });
  }); // Обработчики на логотип в footer
});
