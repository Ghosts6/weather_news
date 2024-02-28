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
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000"
        },
        polygon: {
          nb_sides: 5
        },
        image: {
          src: "path/to/your/snowdrop-image.png",
          width: 100,
          height: 100
        }
      },
      opacity: {
        value: 0.5,
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

function toggleDarkMode() {
    const body = document.body;
    const darkModeIcon = document.getElementById('dark-mode-icon');

    body.classList.toggle('dark-mode');

    darkModeIcon.classList.toggle('fa-moon');
    darkModeIcon.classList.toggle('fa-sun');

    if (body.classList.contains('dark-mode')) {
        body.style.setProperty('background', 'linear-gradient(180deg, rgb(54, 28, 71) 10%, #20173a 20%, rgb(5, 78, 78) 100%)', 'important');
        body.style.setProperty('background-attachment', 'fixed', 'important');
        body.style.setProperty('animation', 'movingColor 10s infinite', 'important');
        body.style.setProperty('overflow','hidden','important');
    } else {
        body.style.setProperty('background', 'linear-gradient(180deg, rgb(176, 142, 199) 10%, #7966af 20%, rgb(16, 177, 177) 100%)', 'important');
        body.style.removeProperty('background-attachment');
        body.style.removeProperty('animation');
        body.style.setProperty('overflow');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const homeButton = document.getElementById('homeButton');
    homeButton.addEventListener('click', function () {
        window.location.href = '../home/';
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search');
    const suggestionsContainer = document.getElementById('suggestions-container');

    searchInput.addEventListener('input', function () {
        handleInput(searchInput.value);
    });

    searchInput.addEventListener('keydown', function (event) {
        handleKeyDown(event);
    });

    function handleInput(input) {
        suggestionsContainer.innerHTML = "";

        if (input.length >= 3) {
            fetch(`/search_suggestions/?city_name=${input}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        data.suggestions.slice(0, 5).forEach(suggestion => {
                            const suggestionItem = document.createElement("div");
                            suggestionItem.textContent = suggestion;
                            suggestionItem.addEventListener('click', function () {
                                searchInput.value = suggestion;
                                suggestionsContainer.innerHTML = "";
                            });
                            suggestionsContainer.appendChild(suggestionItem);
                        });
                    } else {
                        console.error("Error fetching suggestions:", data.error);
                    }
                })
                .catch(error => {
                    console.error("Error fetching suggestions:", error);
                });
        }
    }

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            const cityName = searchInput.value;
            console.log("Search for weather in " + cityName);
        }
    }
});