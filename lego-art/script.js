// Warte bis DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
	console.log("Script initialisiert");

	const heroSection = document.querySelector('.hero');
	const modal = document.getElementById('imageModal');
	const modalImage = document.getElementById('modalImage');
	const modalTitle = document.getElementById('modalTitle');
	const modalPrice = document.getElementById('modalPrice');
	const modalDescription = document.getElementById('modalDescription');
	const modalClose = document.querySelector('.modal-close');
	
	// Modal functionality
	document.querySelectorAll('.card').forEach(card => {
		card.addEventListener('click', function() {
			const img = this.querySelector('img');
			const title = this.querySelector('h2').textContent;
			const price = this.querySelector('.price').textContent;
			const description = this.querySelector('.description').textContent;
			
			modalImage.src = img.src;
			modalImage.alt = img.alt;
			modalTitle.textContent = title;
			modalPrice.textContent = price;
			modalDescription.textContent = description;
			
			modal.classList.add('active');
			document.body.style.overflow = 'hidden';
		});
	});
	
	// Close modal
	function closeModal() {
		modal.classList.remove('active');
		document.body.style.overflow = '';
	}

	modalClose.addEventListener('click', closeModal);
	modal.addEventListener('click', function(e) {
		if (e.target === modal) {
			closeModal();
		}
	});
	
	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape' && modal.classList.contains('active')) {
			closeModal();
		}
	});

	// Filter Funktionalität
	document.querySelectorAll('.filter-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const filter = btn.getAttribute('data-filter');
			
			document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			
			// Change hero background based on filter
			if (filter === 'regensburg') {
				heroSection.classList.add('regensburg-active');
			} else {
				heroSection.classList.remove('regensburg-active');
			}
			
			// Filter cards
			document.querySelectorAll('.card').forEach(card => {
				if (filter === 'all' || card.getAttribute('data-category') === filter) {
					card.classList.remove('hidden');
				} else {
					card.classList.add('hidden');
				}
			});
		});
	});

	// Intersection Observer für Scroll-Animationen
	const observerOptions = {
		threshold: 0.1,
		rootMargin: '0px 0px -50px 0px'
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry, index) => {
			if (entry.isIntersecting) {
				setTimeout(() => {
					entry.target.classList.add('fade-in-up');
				}, index * 50);
				observer.unobserve(entry.target);
			}
		});
	}, observerOptions);

	// Beobachte alle Cards
	const cards = document.querySelectorAll('.card');
	cards.forEach(card => {
		card.classList.add('fade-in-hidden');
		observer.observe(card);
	});

	// Smooth scroll für Nav-Links
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute('href'));
			if (target) {
				target.scrollIntoView({
					behavior: 'smooth',
					block: 'start'
				});
			}
		});
	});

	// Parallax-Effekt für Hero
	let ticking = false;
	window.addEventListener('scroll', () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				const hero = document.querySelector('.hero');
				const scrolled = window.pageYOffset;
				hero.style.transform = `translateY(${scrolled * 0.5}px)`;
				hero.style.opacity = 1 - (scrolled / 500);
				ticking = false;
			});
			ticking = true;
		}
	});

	// Scroll to home after form submission (from URL hash)
	if (window.location.hash === '#home') {
		setTimeout(() => {
			const homeSection = document.getElementById('home');
			if (homeSection) {
				homeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 100);
	}

	// Web3Forms Submission
	const contactForm = document.getElementById('contactForm');
	if (contactForm) {
		contactForm.addEventListener('submit', async function(e) {
			e.preventDefault();
			
			const submitButton = this.querySelector('.btn-primary');
			const buttonText = submitButton.querySelector('.button-text');
			const originalText = buttonText.textContent;
			
			// Button Feedback
			submitButton.disabled = true;
			buttonText.textContent = 'Wird gesendet...';
			
			const formData = new FormData(contactForm);
			const object = Object.fromEntries(formData);
			const json = JSON.stringify(object);

			try {
				const response = await fetch('https://api.web3forms.com/submit', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					body: json
				});

				const result = await response.json();
				
				if (result.success) {
					console.log('Success:', result);
					buttonText.textContent = '✓ Gesendet!';
					contactForm.reset();
					
					// Scroll to home after 1.5 seconds
					setTimeout(() => {
						const homeSection = document.getElementById('home');
						if (homeSection) {
							homeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}
						buttonText.textContent = originalText;
						submitButton.disabled = false;
					}, 1500);
				} else {
					throw new Error(result.message || 'Fehler beim Senden');
				}
			} catch (error) {
				console.error('Error:', error);
				buttonText.textContent = '✗ Fehler - Bitte erneut versuchen';
				setTimeout(() => {
					buttonText.textContent = originalText;
					submitButton.disabled = false;
				}, 3000);
			}
		});
	}
});
