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
	
	// Modal functionality (improved for mobile & multi-image support)
	document.querySelectorAll('.card').forEach(card => {
		card.addEventListener('click', function() {
			// Prefer data-images if present (comma separated), otherwise use card img
			const imagesAttr = this.getAttribute('data-images');
			let images = [];
			if (imagesAttr) {
				images = imagesAttr.split(',').map(s => s.trim()).filter(Boolean);
			}
			const imgEl = this.querySelector('img');
			if (!images.length && imgEl) images = [ imgEl.getAttribute('src') || imgEl.src ];

			const title = this.querySelector('h2')?.textContent || '';
			const price = this.querySelector('.price')?.textContent || '';
			const description = this.querySelector('.description')?.textContent || '';
			const details = this.getAttribute('data-details') || '';

			// Show first available image, handle load/fallback
			const srcToLoad = images[0] || '';
			modalImage.removeAttribute('src');
			modalImage.alt = imgEl?.alt || title;

			// Ensure modal-content scrolls to top on open
			const modalContent = modal.querySelector('.modal-content');
			if (modalContent) modalContent.scrollTop = 0;

			if (srcToLoad) {
				// show a tiny loading state (optional)
				modalImage.style.opacity = '0';
				modalImage.src = srcToLoad;
				modalImage.onload = () => {
					modalImage.style.transition = 'opacity .18s ease';
					modalImage.style.opacity = '1';
				};
				// fallback if image fails
				modalImage.onerror = () => {
					// try card image as fallback
					if (imgEl && imgEl.getAttribute('src') !== srcToLoad) {
						modalImage.src = imgEl.getAttribute('src') || imgEl.src;
					} else {
						// remove image if nothing loads
						modalImage.style.opacity = '0';
						modalImage.removeAttribute('src');
					}
				};
			} else {
				modalImage.removeAttribute('src');
			}

			modalTitle.textContent = title;
			modalPrice.textContent = price;

			// Compose description/details (allow HTML from data-details)
			if (details) {
				modalDescription.innerHTML = (description ? escapeHtml(description) + '<br><br>' : '') + details;
			} else {
				modalDescription.textContent = description || '';
			}

			modal.classList.add('active');
			document.body.style.overflow = 'hidden';
		});
	});
	
	// Close modal (keeps existing behavior)
	function closeModal() {
		modal.classList.remove('active');
		document.body.style.overflow = '';
		// cleanup image src to release memory on mobile
		if (modalImage) {
			modalImage.removeAttribute('src');
		}
	}

	// ensure modalClose exists before attaching
	if (modalClose) {
		modalClose.addEventListener('click', closeModal);
	}
	modal.addEventListener('click', function(e) {
		if (e.target === modal) closeModal();
	});
	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
	});

	// small helper to escape plain text before inserting + preserve plain string usage
	function escapeHtml(str) {
		return String(str).replace(/[&<>"'`=\/]/g, function(s) {
			return ({
				'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
			})[s];
		});
	}

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

	// Mobile-fix: Entferne lazy-loading auf kleineren Bildschirmen und preload erste modal-Bilder
	(() => {
		const isMobile = window.matchMedia('(max-width:800px)').matches || ('ontouchstart' in window);
		if (isMobile) {
			document.querySelectorAll('img[loading="lazy"]').forEach(img => img.removeAttribute('loading'));
		}
		// Preload first image from data-images (falls vorhanden) to speed up modal open
		document.querySelectorAll('.card[data-images]').forEach(card => {
			const attr = card.getAttribute('data-images') || '';
			const first = attr.split(',').map(s => s.trim()).find(Boolean);
			if (first) {
				const im = new Image();
				im.src = first;
			}
		});
	})();
});
