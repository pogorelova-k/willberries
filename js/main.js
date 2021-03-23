const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

//! Корзина
// Получаем элемент кнопки в переменную 
const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const modalClose = document.querySelector('.modal-close');

const openModal = () => {
	modalCart.classList.add('show');
};
const closeModal = () => {
	modalCart.classList.remove('show');
};
// по клику на корзину открываем модальное окно
buttonCart.addEventListener('click', openModal);
// по клику на крестик или вне МО закрываем модальное окно
modalCart.addEventListener('click', event => {
	const target = event.target;
	console.log(target);
	if (target.classList.contains('modal-close') || target === modalCart ) {
		closeModal();
	}
});

//! плавный скролл в модальном окне
(function() {
	const scrollLinks = document.querySelectorAll('a.scroll-link');

	for (let i = 0; i < scrollLinks.length; i++) {
		scrollLinks[i].addEventListener('click', event => {
			// отключаем обычный способ возвращения наверх 
			event.preventDefault();
			// задаем свои свойства скролла, делаем плавно
			const id = scrollLinks[i].getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		});
	};
})();