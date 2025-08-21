// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

mobileMenuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuToggle.innerHTML = navLinks.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Close menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Tab functionality
function opentab(tabname) {
    const tablinks = document.getElementsByClassName('tab-links');
    const tabcontents = document.getElementsByClassName('tab-contents');
    
    for (let tablink of tablinks) {
        tablink.classList.remove('active-link');
    }
    
    for (let tabcontent of tabcontents) {
        tabcontent.classList.remove('active-tab');
    }
    
    event.currentTarget.classList.add('active-link');
    document.getElementById(tabname).classList.add('active-tab');
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Update active nav link on scroll
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});


// Testimonial Slider
const track = document.querySelector('.testimonial-track');
const dots = document.querySelectorAll('.testimonial-dot');
let currentSlide = 0;

function updateSlider() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        updateSlider();
    });
});

// Auto-rotate testimonials
setInterval(() => {
    currentSlide = (currentSlide + 1) % dots.length;
    updateSlider();
}, 5000);

document.querySelectorAll('.book-card').forEach(card => {
    card.addEventListener('click', function () {
      console.log('Book clicked:', this.querySelector('h3').textContent);
    });
});
  

document.addEventListener('DOMContentLoaded', function() {
    // Get modal element
    const modal = document.getElementById('worksModal');
    
    // Get open modal button
    const openModalBtn = document.getElementById('openModal');
    
    // Get close button
    const closeBtn = document.getElementsByClassName('close')[0];
    
    // Function to open modal
    function openModal() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Function to close modal
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable scrolling
    }
    
    // Listen for open click
    openModalBtn.addEventListener('click', openModal);
    
    // Listen for close click
    closeBtn.addEventListener('click', closeModal);
    
    // Listen for outside click
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});