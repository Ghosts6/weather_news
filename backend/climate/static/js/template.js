// Particles config
function getRandomMode() {
  const modes = ['snowy', 'rainy', 'windy'];
  const randomIndex = Math.floor(Math.random() * modes.length);
  return modes[randomIndex];
}

function getImageForMode(mode) {
  switch (mode) {
    case 'snowy':
      return '/static/img/snow.png';
    case 'rainy':
      return '/static/img/rain.png';  
    case 'windy':
      return '/static/img/wind.png';  
    default:
      return '/static/img/snow.png';
  }
}

const mode = getRandomMode();
const particleImage = getImageForMode(mode);

particlesJS("particles-js", {
  particles: {
    number: {
      value: 150, 
      density: {
        enable: true,
        value_area: 800
      }
    },
    color: {
      value: "#ffffff"
    },
    shape: {
      type: "image",
      stroke: {
        width: 0,
        color: "#000000"
      },
      image: {
        src: particleImage,   
        width: 40,            
        height: 40            
      }
    },
    opacity: {
      value: 0.7, 
      random: true,
      anim: {
        enable: true,
        speed: 1,
        opacity_min: 0,
        sync: false
      }
    },
    size: {
      value: 10, 
      random: true,
      anim: {
        enable: true,
        speed: 3,
        size_min: 0,
        sync: false
      }
    },
    line_linked: {
      enable: false
    },
    move: {
      enable: true,
      speed: 1,
      direction: "bottom", 
      random: false,
      straight: false,
      out_mode: "out", 
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200
      }
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: false
      },
      onclick: {
        enable: false
      },
      resize: true
    }
  },
  retina_detect: true
});
// Scroll to top
document.addEventListener('DOMContentLoaded', () => {
    const scrollToTopButton = document.getElementById('scrollToTopButton');
    
    window.addEventListener('scroll', () => {
        scrollToTopButton.style.display = window.scrollY > 100 ? 'block' : 'none';
    });

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Toggle Light mode 
function toggleDarkMode() {
    const html = document.documentElement;
    const darkModeIcon = document.getElementById('dark-mode-icon');

    html.classList.toggle('dark');
    
    darkModeIcon.classList.toggle('fa-moon');
    darkModeIcon.classList.toggle('fa-sun');

    if (html.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.getElementById('dark-mode-icon').classList.add('fa-sun');
        document.getElementById('dark-mode-icon').classList.remove('fa-moon');
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('dark-mode-icon').classList.add('fa-moon');
        document.getElementById('dark-mode-icon').classList.remove('fa-sun');
    }
}

applySavedTheme();