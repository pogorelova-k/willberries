const mySwiper = new Swiper(".swiper-container", {
  loop: true,

  // Navigation arrows
  navigation: {
    nextEl: ".slider-button-next",
    prevEl: ".slider-button-prev",
  },
});

//! Корзина
// Получаем элемент кнопки в переменную
const buttonCart = document.querySelector(".button-cart");
const modalCart = document.querySelector("#modal-cart");
const modalClose = document.querySelector(".modal-close");
const cartTableGoods = document.querySelector(".cart-table__goods");
const cardTableTotal = document.querySelector(".card-table__total");
const cartCount = document.querySelector(".cart-count");
const clearCart = document.querySelector(".clear-cart");
let totalCount;

//* ассинхронная функция, которая получает товары с сервера
// Сервер, в данном случае - готовый файл db/db.json: в основном сервера в таком формате
// await говорит программе, сделаать сначало то, что находится справа, а потом только всё остальное
// fetch - это API, которые встроены в браузер и умеет запрашивать данные с сервера по определённому URL и возвращать промисы
// промисы(promise) - это обещание, что придёт ответ от сервера; может быть true/false
const getGoods = async () => {
  // todo получаем не промис, а ответ от сервера за счёт await
  const result = await fetch("db/db.json");
  if (!result.ok) {
    // выполним исключение
    throw "Ошибочка вышла:" + result.status;
  }
  return await result.json();
};
// промисы обрабатывают с помощью метода then
// функция вызовется, когда выполнится then
// getGoods().then(function (data) {})

// ? как по другому можно использовать fetch
// fetch('db/db.json')
// 	.then(function (response) {
// 		return response.json()
// 	})
// 	.then (function (data) {
// 		console.log(data);
// 	})

//* пишем свои методы для формирования корзины
const cart = {
  //* товары в корзине
  cartGoods: [],

  //* метод для отображения товаров в корзине
  renderCart() {
    //todo удаляем товары из корзины
    cartTableGoods.textContent = "";
    //todo формируем товары заново
    // this будет обращаться к объекту cart. this=cart
    this.cartGoods.forEach(({ id, name, price, count }) => {
      //todo создаем строку tr
      const trGood = document.createElement("tr");
      trGood.className = "cart-item";
      trGood.dataset.id = id;

      //todo вставляем в верстку
      trGood.innerHTML = `
				<td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus">+</button></td>
				<td>${price * count}$</td>
				<td><button class="cart-btn-delete">x</button></td>
			`;
      //todo вставляем на страницу
      cartTableGoods.append(trGood);
    });

    //todo вывод итоговой суммы
    // перебираем cartGoods с помощью reduce
    // reduce - в функции которая внутри принмает на один аргумент больше (некий аккамулятор), который скалдывает и передает в следующую итерацию цикла. получаем акк от той ф-ции, которая завершилась до этого
    const totalPrice = this.cartGoods.reduce((sum, item) => {
      return sum + item.price * item.count;
    }, 0);

    cardTableTotal.textContent = totalPrice + "$";

    // выводим общее количество товаров на кнопке с корзиной при открытом модальном окне
    cartCount.textContent = totalCount;
  },

  //* метод получает товар по id и удаляет его
  deleteGood(id) {
    //todo  удалять ненужные объекты, остальные возвращать. с помощью filter
    // если id будут разные, то элемент вернётся в корзину, иначе игнор
    this.cartGoods = this.cartGoods.filter((item) => id !== item.id);
    this.renderCart();
  },
  //* + и - в корзине
  minusGood(id) {
    for (const item of this.cartGoods) {
      if (item.id === id) {
        // прибавляем товар, если совпали id
        if (item.count <= 1) {
          // удаляем товар, если он один или меньше
          this.deleteGood(id);
        } else {
          item.count--;
          totalCount--;
        }

        break;
      }
    }
    this.renderCart();
  },
  plusGood(id) {
    for (const item of this.cartGoods) {
      if (item.id === id) {
        // прибавляем товар, если совпали id
        item.count++;
        totalCount++;
        break;
      }
    }
    this.renderCart();
  },
  //* добавлять товар в корзину с сайта
  addCartGoods(id) {
    // find - как только находит товар, его возвращает
    const goodItem = this.cartGoods.find((item) => item.id === id);
    if (goodItem) {
      this.plusGood(id);
    } else {
      // получаем с сервера с помощью getGoods
      getGoods()
        //todo ищем в массиве данных с сервера товар(элемент)
        // если находим передаём в следующий then
        .then((data) => data.find((item) => item.id === id))
        // todo добавляем найденный товар в массив товаров корзины cartGoods
        .then(({ id, name, price }) => {
          // push - добавляет элемент в массив
          this.cartGoods.push({
            id,
            name,
            price,
            count: 1,
          });
        });
    }

    // Общее количество товаров в корзине
    totalCount = this.cartGoods.reduce((sum, item) => {
      if (id === item.id) {
        return sum * item.count;
      } else {
        return sum + item.count;
      }
    }, 1);
    // выводим общее количество товаров на кнопке с корзиной при закрытом модальном окне
    cartCount.textContent = totalCount;
  },

  //* метод удаления всех товаров из корзины
  clearCartGoods() {
    this.cartGoods = this.cartGoods.filter((item) => item.id === -1);
    this.renderCart();
    cartCount.textContent = "";
  },
};

//todo очищаем корзину по кнопке
clearCart.addEventListener("click", () => {
  cart.clearCartGoods();
}); //! кнопка не кликабельна

// clearCart.addEventListener('click', console.log(1));

//* добавляем товары в корзину по кнопке с ценой на сайте
document.body.addEventListener("click", (event) => {
  const addToCart = event.target.closest(".add-to-cart");
  if (addToCart) {
    cart.addCartGoods(addToCart.dataset.id);
  }
});

//* действия при открывании модального окна корзины
cartTableGoods.addEventListener("click", (event) => {
  const target = event.target;
  // получаем id
  if (target.tagName === "BUTTON") {
    // получаем родителя и его id
    const id = target.closest(".cart-item").dataset.id;
    //todo Удаляем товар полностью из корзины
    if (target.classList.contains("cart-btn-delete")) {
      cart.deleteGood(id);
    }
    //todo уменьшаем кол-во товаров на 1
    if (target.classList.contains("cart-btn-minus")) {
      cart.minusGood(id);
      console.log("1");
    }
    //todo увеличиваем кол-во товаров на 1
    if (target.classList.contains("cart-btn-plus")) {
      cart.plusGood(id);
    }
  }
});

const openModal = () => {
  cart.renderCart();
  modalCart.classList.add("show");
};
const closeModal = () => {
  modalCart.classList.remove("show");
};
// по клику на корзину открываем модальное окно
buttonCart.addEventListener("click", openModal);
// по клику на крестик или вне МО закрываем модальное окно
modalCart.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("modal-close") || target === modalCart) {
    closeModal();
  }
});

//! плавный скролл в модальном окне
const scroll = () => {
  const scrollLinks = document.querySelectorAll(".scroll-link");

  // ? 1 способ
  // for (let i = 0; i < scrollLinks.length; i++) {
  // 	scrollLinks[i].addEventListener('click', event => {
  // отключаем обычный способ возвращения наверх
  // 		event.preventDefault();
  // задаем свои свойства скролла, делаем плавно
  // 		const id = scrollLinks[i].getAttribute('href');
  // 		document.querySelector(id).scrollIntoView({
  // 			behavior: 'smooth',
  // 			block: 'start',
  // 		});
  // 	});
  // };
  //? 2 способ цикл forOf
  for (const scrollLink of scrollLinks) {
    scrollLink.addEventListener("click", (event) => {
      // отключаем обычный способ возвращения наверх
      event.preventDefault();
      // задаем свои свойства скролла, делаем плавно
      const id = scrollLink.getAttribute("href");
      document.querySelector(id).scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
};
scroll();

// ! Товары
const more = document.querySelector(".more");
const navigationLink = document.querySelectorAll(".navigation-link");
const longGoodsList = document.querySelector(".long-goods-list");
const moreAccessories = document.querySelector(".more-accessories");
const moreClothing = document.querySelector(".more-clothing");

// * Создание 1 карточки
const createCard = ({ label, name, img, description, id, price }) => {
  //todo создаем оболочку для карточки и добавляем классы от бутсрапа
  const card = document.createElement("div");
  card.className = "col-lg-3 col-sm-6";

  // деструктуризация
  // const {label, name, img, description, id, price} = objectCard;

  // innerHTML - стирать всё внутри тега , который написан в  html
  card.innerHTML = `
		<div class="goods-card">
			${label ? `<span class="label">${label}</span>` : ""}
			<img src="db/${img}" alt="${name}" class="goods-image">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="${id}">
				<span class="button-price">$${price}</span>
			</button>
		</div>
	`;
  return card;
};

// *функция, которая будет показывать карточкИ, вызывая createCard
const renderCards = (data) => {
  //todo стираем всё,что есть в списке товаров
  longGoodsList.textContent = "";
  //todo создаём элементы и передаем туда объекты
  // метод MAP перебирает массив(data) и возвращает объект  из него
  const cards = data.map(createCard);
  //todo выводим на страницу наши card: 2 способа
  //? 1 способ простой
  // cards.forEach((card) => {
  // 	longGoodsList.append(card);
  // });
  // ? 2 способ интересный:)
  // в метод append передавать не card, а разберем на объекы с помощью spread
  // spread передеает объекты так ( *, *, * ), а не один элемент массив, в котором эти объекты
  longGoodsList.append(...cards);
  document.body.classList.add("show-goods");
};

/* getGoods().then(renderCards) : кратко код выше :
	1 когда ответ от сервера придёт , будет переделан из json в массив
	2 будет вызвана функция renderCards 
	3 туда попадут данные из сервера (в data)
	4 каждый объект из этого массива будет отправле в createCard 
	5 созданы карточки, записаны  в cards
	6 отправвляем на страницу (в longGoodsList)
*/

//* открытие всех товаров по кнопкам ALL и view all
window.addEventListener("click", (event) => {
  const target = event.target;
  if (target === more || target.textContent === "All") {
    event.preventDefault();
    getGoods().then(renderCards);
    scroll(event);
  }
});

//* функция фильтрации товаров получает свойство-field и значение-value
const filterCards = (field, value) => {
  // todo полуачем данные с сервера
  getGoods()
    .then((data) => {
      // filter - если (good[field] === value)-true, тогда товар будет добавлен в массив отфильтрованных товаров (filteredGoods), иначе следующая итерация
      const filteredGoods = data.filter((good) => {
        // сравнивает любое свойство у товара с value
        return good[field] === value;
      });
      return filteredGoods;
    })
    .then(renderCards);
};

//* показывыаются элементы соответствующие заголовку из шапки-меню
navigationLink.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault;
    // получаем field из верстки из data атрибута(data-field)
    const field = link.dataset.field;
    // названия категорий в шапке сайта
    const value = link.textContent;
    filterCards(field, value);
  });
});

moreAccessories.addEventListener("click", (event) => {
  filterCards("category", "Accessories");
  scroll(event);
});
moreClothing.addEventListener("click", (event) => {
  filterCards("category", "Clothing");
  scroll(event);
});
