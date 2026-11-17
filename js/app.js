const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");
menuToggle?.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "×" : "☰";
});
$$(".main-nav a").forEach(a => a.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
  if (menuToggle) menuToggle.textContent = "☰";
}));

const progressLine = $("#progressLine");
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressLine.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
});

$$(".detail-toggle").forEach(button => {
  button.addEventListener("click", () => {
    const panel = button.nextElementSibling;
    const open = panel.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
    button.innerHTML = `${open ? "Ocultar explicación" : "Ver explicación"} <span>${open ? "－" : "＋"}</span>`;
  });
});

$$(".impact-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    $$(".impact-tab").forEach(t => {
      const active = t === tab;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", String(active));
    });
    $$(".impact-panel").forEach(panel => panel.classList.toggle("active", panel.id === tab.dataset.impact));
  });
});

function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i=3; i<=Math.sqrt(n); i+=2) if (n%i===0) return false;
  return true;
}
$("#checkPrime")?.addEventListener("click", () => {
  const input = $("#primeInput");
  const p = Number(input.value);
  const result = $("#primeResult");
  if (!Number.isInteger(p) || p < 2) {
    result.innerHTML = `<span class="result-icon">!</span><strong>Dato no válido</strong><p>Ingresa un número entero mayor o igual que 2.</p>`;
    return;
  }
  if (!isPrime(p)) {
    result.innerHTML = `<span class="result-icon">↗</span><strong>${p} no es primo</strong><p>Intenta con un número primo. Recuerda que debe ser primo tanto p como 2p + 1.</p>`;
    return;
  }
  const q = 2*p+1;
  result.innerHTML = isPrime(q)
    ? `<span class="result-icon">✦</span><strong>${p} → ${q}</strong><p>¡Sí! ${p} y ${q} son primos. ${p} es un número primo de Sophie Germain.</p>`
    : `<span class="result-icon">◇</span><strong>${p} → ${q}</strong><p>${p} es primo, pero ${q} no lo es. No es un primo de Sophie Germain.</p>`;
});
$("#primeInput")?.addEventListener("keydown", e => { if (e.key === "Enter") $("#checkPrime").click(); });

const questions = [
  {tag:"LAPLACE",q:"¿En qué localidad nació Pierre-Simon Laplace?",a:["París","Beaumont-en-Auge","Lyon","Caen"],c:1,why:"Nació el 23 de marzo de 1749 en Beaumont-en-Auge, Normandía."},
  {tag:"GERMAIN",q:"¿Qué seudónimo utilizó Sophie Germain para acceder a materiales de estudio?",a:["Marie Curie","Antoine-Auguste Le Blanc","Émilie du Châtelet","Madame Fourier"],c:1,why:"Utilizó el nombre Antoine-Auguste Le Blanc para enviar trabajos y obtener apuntes."},
  {tag:"LAPLACE",q:"¿Qué obra publicó Laplace en 1812?",a:["Mecánica celeste","Los elementos","Teoría analítica de las probabilidades","Disquisitiones Arithmeticae"],c:2,why:"La Théorie analytique des probabilités apareció en 1812."},
  {tag:"GERMAIN",q:"¿Cuándo ganó Sophie Germain el Gran Premio de la Academia de Ciencias de París?",a:["1799","1807","1812","1816"],c:3,why:"En 1816 recibió el Gran Premio por su investigación sobre superficies elásticas."},
  {tag:"LAPLACE",q:"¿Qué expresa la regla clásica de Laplace para sucesos equiprobables?",a:["Casos posibles / casos favorables","Casos favorables / casos posibles","Suma de todos los resultados","El producto de las probabilidades"],c:1,why:"P(A) = número de casos favorables dividido entre el número de casos posibles, si son equiprobables."},
  {tag:"GERMAIN",q:"¿Cuál de estos números es un primo de Sophie Germain?",a:["7","9","11","15"],c:2,why:"11 es primo y 2(11)+1 = 23 también es primo."},
  {tag:"LAPLACE",q:"¿En qué campo se utiliza la transformada de Laplace?",a:["Diseño de moda","Análisis de circuitos y control","Pintura al óleo","Cartografía histórica exclusivamente"],c:1,why:"Es una herramienta útil para analizar sistemas dinámicos, circuitos y control automático."},
  {tag:"GERMAIN",q:"¿Qué fenómeno estudió Sophie Germain en su trabajo premiado en 1816?",a:["Órbitas planetarias","Vibraciones de superficies elásticas","Óptica de lentes","Mareas oceánicas"],c:1,why:"Su memoria trató sobre la teoría de las superficies elásticas y la vibración de placas."}
];
let current = 0, score = 0, answered = false;
function renderQuestion() {
  answered = false;
  const q = questions[current];
  $("#quizCounter").textContent = `${String(current+1).padStart(2,"0")} / ${String(questions.length).padStart(2,"0")}`;
  $("#quizProgress").style.width = `${(current/questions.length)*100}%`;
  $("#quizScore").textContent = `Aciertos: ${score}`;
  $("#quizContent").classList.remove("hidden");
  $("#quizFinish").classList.add("hidden");
  $("#quizContent .quiz-category").textContent = `PREGUNTA ${String(current+1).padStart(2,"0")} · ${q.tag}`;
  $("#questionText").textContent = q.q;
  $("#quizFeedback").textContent = "";
  $("#nextQuestion").disabled = true;
  $("#nextQuestion").textContent = current === questions.length-1 ? "Ver resultado ↗" : "Siguiente pregunta →";
  $("#answerList").innerHTML = "";
  q.a.forEach((answer,i) => {
    const btn = document.createElement("button");
    btn.className = "answer-option";
    btn.textContent = `${String.fromCharCode(65+i)}. ${answer}`;
    btn.addEventListener("click", () => chooseAnswer(i));
    $("#answerList").appendChild(btn);
  });
}
function chooseAnswer(index) {
  if (answered) return;
  answered = true;
  const q = questions[current];
  const buttons = $$(".answer-option");
  buttons.forEach((b,i) => {
    b.disabled = true;
    if (i === q.c) b.classList.add("correct");
    if (i === index && index !== q.c) b.classList.add("wrong");
  });
  if (index === q.c) {
    score++;
    $("#quizFeedback").textContent = `¡Correcto! ${q.why}`;
  } else {
    $("#quizFeedback").textContent = `No exactamente. ${q.why}`;
  }
  $("#quizScore").textContent = `Aciertos: ${score}`;
  $("#nextQuestion").disabled = false;
}
$("#nextQuestion")?.addEventListener("click", () => {
  if (!answered) return;
  current++;
  if (current < questions.length) renderQuestion();
  else {
    $("#quizContent").classList.add("hidden");
    $("#quizFinish").classList.remove("hidden");
    $("#quizProgress").style.width = "100%";
    $("#quizCounter").textContent = `${questions.length} / ${questions.length}`;
    $("#finalScore").textContent = `${score} de ${questions.length} respuestas correctas`;
    $("#finalMessage").textContent = score === questions.length ? "¡Impresionante! Has dominado el recorrido por las ideas de Laplace y Germain." : score >= 5 ? "¡Muy bien! Ya conoces buena parte de sus historias. Puedes volver a jugar para reforzar lo aprendido." : "¡Este es solo el comienzo! Explora de nuevo las secciones y vuelve a intentarlo.";
  }
});
$("#restartQuiz")?.addEventListener("click", () => { current=0; score=0; renderQuestion(); });
renderQuestion();

// Animación discreta de entrada de secciones (respeta la preferencia de movimiento reducido).
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.08});
  $$(".contribution-card,.timeline-item,.impact-feature,.curiosity-grid article,.podcast-card").forEach(el => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}


// Galería: filtros y visor ampliado con navegación por teclado y botones.
const galleryItems = $$(".gallery-item");
const galleryFilters = $$(".gallery-filter");
galleryFilters.forEach(filter => {
  filter.addEventListener("click", () => {
    galleryFilters.forEach(f => {
      const active = f === filter;
      f.classList.toggle("active", active);
      f.setAttribute("aria-pressed", String(active));
    });
    galleryItems.forEach(item => {
      item.hidden = filter.dataset.filter !== "all" && item.dataset.person !== filter.dataset.filter;
    });
  });
});

const lightbox = $("#galleryLightbox");
const lightboxImage = $("#lightboxImage");
const lightboxCaption = $("#lightboxCaption");
let visibleGallery = [];
let lightboxIndex = 0;
function openGalleryImage(item) {
  visibleGallery = galleryItems.filter(i => !i.hidden);
  lightboxIndex = visibleGallery.indexOf(item);
  showGalleryImage();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#lightboxClose").focus();
}
function showGalleryImage() {
  const item = visibleGallery[lightboxIndex];
  if (!item) return;
  lightboxImage.src = item.dataset.image;
  lightboxImage.alt = item.querySelector("img").alt;
  lightboxCaption.textContent = item.dataset.caption;
}
function closeGallery() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
galleryItems.forEach(item => item.addEventListener("click", () => openGalleryImage(item)));
$("#lightboxClose")?.addEventListener("click", closeGallery);
$("#lightboxPrev")?.addEventListener("click", () => {
  lightboxIndex = (lightboxIndex - 1 + visibleGallery.length) % visibleGallery.length;
  showGalleryImage();
});
$("#lightboxNext")?.addEventListener("click", () => {
  lightboxIndex = (lightboxIndex + 1) % visibleGallery.length;
  showGalleryImage();
});
lightbox?.addEventListener("click", e => { if (e.target === lightbox) closeGallery(); });
document.addEventListener("keydown", e => {
  if (!lightbox?.classList.contains("open")) return;
  if (e.key === "Escape") closeGallery();
  if (e.key === "ArrowLeft") $("#lightboxPrev").click();
  if (e.key === "ArrowRight") $("#lightboxNext").click();
});



/* =====================================
   JUEGO DE PROBABILIDAD - DADO DE LAPLACE
===================================== */

const diceFace = document.getElementById("diceFace");
const rollDie = document.getElementById("rollDie");
const resetDie = document.getElementById("resetDie");

if (diceFace && rollDie && resetDie) {

    let totalThrows = 0;
    let evenThrows = 0;
    let oddThrows = 0;
    let lastResults = [];

    const dicePositions = {
        1: [5],
        2: [1, 9],
        3: [1, 5, 9],
        4: [1, 3, 7, 9],
        5: [1, 3, 5, 7, 9],
        6: [1, 3, 4, 6, 7, 9]
    };

    // Dibuja visualmente las caras del dado.
    function drawDice(number) {

        const positions = dicePositions[number];

        diceFace.innerHTML = Array.from(
            { length: 9 },
            (_, index) => {
                const visible = positions.includes(index + 1);

                return `<span class="pip ${visible ? "" : "empty"}"></span>`;
            }
        ).join("");

        diceFace.setAttribute(
            "aria-label",
            `Dado mostrando el número ${number}`
        );
    }

    // Actualiza las estadísticas del experimento.
    function updateStatistics() {

        const percentage = totalThrows > 0
            ? (evenThrows / totalThrows) * 100
            : 0;

        document.getElementById("throwsCount").textContent =
            totalThrows;

        document.getElementById("evenCount").textContent =
            evenThrows;

        document.getElementById("oddCount").textContent =
            oddThrows;

        document.getElementById("evenPercentage").textContent =
            percentage.toFixed(1) + "%";

        document.getElementById("evenBar").style.width =
            percentage + "%";

        const conclusion = document.getElementById("diceConclusion");

        if (totalThrows === 0) {

            conclusion.innerHTML = `
                <span>✦</span>
                <p>
                    Comienza a lanzar el dado para comparar tus
                    resultados con la probabilidad teórica.
                </p>
            `;

        } else {

            const difference = Math.abs(percentage - 50);

            conclusion.innerHTML = `
                <span>✦</span>
                <p>
                    Has obtenido ${evenThrows} números pares de
                    ${totalThrows} lanzamientos.
                    Tu resultado está a
                    ${difference.toFixed(1)} puntos porcentuales
                    del 50% teórico.
                    ${totalThrows < 20
                        ? "Continúa experimentando para observar cómo cambia la frecuencia."
                        : "Compara la frecuencia observada con la probabilidad teórica de Laplace."
                    }
                </p>
            `;
        }
    }

    // Muestra los últimos lanzamientos.
    function updateHistory() {

        const history = document.getElementById("diceHistory");

        history.innerHTML = lastResults.length
            ? lastResults.map(number => `
                <span
                    class="history-item ${number % 2 === 0 ? "even" : "odd"}"
                    title="${number % 2 === 0 ? "Par" : "Impar"}">
                    ${number}
                </span>
            `).join("")
            : `<span class="history-empty">Tus resultados aparecerán aquí.</span>`;
    }

    // Lanza el dado.
    rollDie.addEventListener("click", () => {

        if (rollDie.disabled) return;

        rollDie.disabled = true;
        diceFace.classList.remove("rolling");

        // Reinicia la animación.
        void diceFace.offsetWidth;

        diceFace.classList.add("rolling");

        document.getElementById("diceFeedback").textContent =
            "El dado está rodando...";

        const result = Math.floor(Math.random() * 6) + 1;

        setTimeout(() => {

            drawDice(result);

            totalThrows++;

            if (result % 2 === 0) {
                evenThrows++;

                document.getElementById("diceFeedback").textContent =
                    `¡Salió ${result}! Es un número PAR. Caso favorable.`;

            } else {
                oddThrows++;

                document.getElementById("diceFeedback").textContent =
                    `¡Salió ${result}! Es un número IMPAR.`;
            }

            lastResults.unshift(result);

            // Conserva los últimos 12 resultados.
            lastResults = lastResults.slice(0, 12);

            updateStatistics();
            updateHistory();

            diceFace.classList.remove("rolling");
            rollDie.disabled = false;

        }, 650);
    });

    // Reinicia el experimento.
    resetDie.addEventListener("click", () => {

        totalThrows = 0;
        evenThrows = 0;
        oddThrows = 0;
        lastResults = [];

        diceFace.innerHTML =
            `<span class="dice-placeholder">?</span>`;

        diceFace.setAttribute(
            "aria-label",
            "Dado sin lanzar"
        );

        document.getElementById("diceFeedback").textContent =
            "¡Haz tu primer lanzamiento!";

        rollDie.disabled = false;

        updateStatistics();
        updateHistory();

    });

    updateStatistics();
    updateHistory();
}



/* =========================================
   JUEGO DE MEMORIA
   EL ARCHIVO DE LA MEMORIA
========================================= */

(() => {

    const memoryGrid = document.getElementById("memoryGrid");

    // Evita errores si el juego no existe en la página.
    if (!memoryGrid) return;

    const memoryMoves = document.getElementById("memoryMoves");
    const memoryPairs = document.getElementById("memoryPairs");
    const memoryTime = document.getElementById("memoryTime");
    const memoryStatus = document.getElementById("memoryStatus");
    const memoryComplete = document.getElementById("memoryComplete");
    const memoryFinalMessage = document.getElementById("memoryFinalMessage");

    const memoryRestart = document.getElementById("memoryRestart");
    const memoryPlayAgain = document.getElementById("memoryPlayAgain");

    // =====================================
    // 1. INFORMACIÓN DE LAS SEIS PAREJAS
    // =====================================

    const memoryData = [

        {
            id: "laplace-birth",
            person: "Pierre-Simon Laplace",
            clue: "¿Dónde nació Laplace?",
            answer: "Beaumont-en-Auge, Normandía, Francia (1749)"
        },

        {
            id: "laplace-book",
            person: "Pierre-Simon Laplace",
            clue: "Su gran obra publicada entre 1799 y 1825",
            answer: "Mecánica celeste, una obra de cinco volúmenes"
        },

        {
            id: "laplace-probability",
            person: "Pierre-Simon Laplace",
            clue: "¿Qué expresa la regla clásica de Laplace?",
            answer: "Casos favorables divididos entre casos posibles"
        },

        {
            id: "germain-pseudonym",
            person: "Sophie Germain",
            clue: "¿Qué seudónimo utilizó Sophie Germain?",
            answer: "Antoine-Auguste Le Blanc"
        },

        {
            id: "germain-award",
            person: "Sophie Germain",
            clue: "¿Qué reconocimiento obtuvo en 1816?",
            answer: "Gran Premio por su investigación sobre elasticidad"
        },

        {
            id: "germain-primes",
            person: "Sophie Germain",
            clue: "¿Qué define un primo de Sophie Germain?",
            answer: "p y 2p + 1 son ambos primos (11 y 23)"
        }

    ];

    // =====================================
    // 2. VARIABLES DEL JUEGO
    // =====================================

    let movements = 0;
    let matchedPairs = 0;
    let seconds = 0;

    let firstCard = null;
    let boardLocked = false;

    let timerInterval = null;
    let mismatchTimeout = null;

    // =====================================
    // 3. MEZCLAR LAS CARTAS
    // =====================================

    function shuffleCards(cards) {

        const shuffled = [...cards];

        for (let i = shuffled.length - 1; i > 0; i--) {

            const randomIndex = Math.floor(
                Math.random() * (i + 1)
            );

            [shuffled[i], shuffled[randomIndex]] =
                [shuffled[randomIndex], shuffled[i]];
        }

        return shuffled;
    }

    // =====================================
    // 4. CREAR EL TABLERO
    // =====================================

    function createMemoryBoard() {

        const cards = memoryData.flatMap(pair => [

            {
                pairId: pair.id,
                person: pair.person,
                type: "PISTA",
                text: pair.clue
            },

            {
                pairId: pair.id,
                person: pair.person,
                type: "RESPUESTA",
                text: pair.answer
            }

        ]);

        const shuffled = shuffleCards(cards);

        memoryGrid.innerHTML = "";

        shuffled.forEach((cardData, index) => {

            const card = document.createElement("button");

            card.type = "button";
            card.className = "memory-card";

            card.dataset.pair = cardData.pairId;

            card.setAttribute(
                "aria-label",
                `Carta ${index + 1}, oculta`
            );

            card.innerHTML = `

                <span class="memory-card-inner">

                    <span class="memory-card-back"
                          aria-hidden="true">

                        <span>∑</span>
                        <small>DESCUBRE</small>

                    </span>

                    <span class="memory-card-face"
                          aria-hidden="true">

                        <small>
                            ${cardData.person} · ${cardData.type}
                        </small>

                        <strong>${cardData.text}</strong>

                    </span>

                </span>

            `;

            card.addEventListener("click", () => {

                flipMemoryCard(card, cardData);

            });

            memoryGrid.appendChild(card);

        });

    }

    // =====================================
    // 5. CRONÓMETRO
    // =====================================

    function formatTime(totalSeconds) {

        const minutes = Math.floor(totalSeconds / 60);

        const secondsRemaining = totalSeconds % 60;

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(secondsRemaining).padStart(2, "0")
        );

    }

    function startMemoryTimer() {

        if (timerInterval !== null) return;

        timerInterval = window.setInterval(() => {

            seconds++;

            memoryTime.textContent = formatTime(seconds);

        }, 1000);

    }

    function stopMemoryTimer() {

        if (timerInterval !== null) {

            clearInterval(timerInterval);

            timerInterval = null;

        }

    }

    // =====================================
    // 6. ACTUALIZAR ESTADÍSTICAS
    // =====================================

    function updateMemoryStats() {

        memoryMoves.textContent = movements;

        memoryPairs.textContent =
            `${matchedPairs} / ${memoryData.length}`;

        memoryTime.textContent = formatTime(seconds);

    }

    // =====================================
    // 7. VOLTEAR UNA CARTA
    // =====================================

    function flipMemoryCard(card, cardData) {

        if (boardLocked) return;

        if (card.classList.contains("is-flipped")) return;

        if (card.classList.contains("is-matched")) return;

        // El cronómetro comienza con la primera carta.
        startMemoryTimer();

        card.classList.add("is-flipped");

        card.setAttribute(
            "aria-label",
            `${cardData.person}. ${cardData.type}: ${cardData.text}`
        );

        // Primera carta seleccionada.
        if (firstCard === null) {

            firstCard = {
                element: card,
                data: cardData
            };

            memoryStatus.textContent =
                "Has descubierto una carta. ¡Busca su pareja!";

            return;

        }

        // Segunda carta seleccionada.
        movements++;

        updateMemoryStats();

        const first = firstCard.element;

        // =================================
        // 8. COMPROBAR SI SON IGUALES
        // =================================

        if (firstCard.data.pairId === cardData.pairId) {

            // Pareja correcta.
            first.classList.add("is-matched");
            card.classList.add("is-matched");

            first.disabled = true;
            card.disabled = true;

            matchedPairs++;

            firstCard = null;

            updateMemoryStats();

            memoryStatus.textContent =
                "¡Excelente! Has encontrado una pareja correcta.";

            // Comprobar si terminó el juego.
            if (matchedPairs === memoryData.length) {

                finishMemoryGame();

            }

        } else {

            // Las cartas no coinciden.
            boardLocked = true;

            memoryStatus.textContent =
                "¡No coinciden! Recuerda su posición e inténtalo otra vez.";

            mismatchTimeout = window.setTimeout(() => {

                first.classList.remove("is-flipped");
                card.classList.remove("is-flipped");

                first.setAttribute(
                    "aria-label",
                    "Carta oculta"
                );

                card.setAttribute(
                    "aria-label",
                    "Carta oculta"
                );

                firstCard = null;

                boardLocked = false;

                memoryStatus.textContent =
                    "Intenta encontrar la siguiente pareja.";

                mismatchTimeout = null;

            }, 950);

        }

    }

    // =====================================
    // 9. FINALIZAR EL JUEGO
    // =====================================

    function finishMemoryGame() {

        stopMemoryTimer();

        memoryStatus.textContent =
            "¡Todas las parejas han sido descubiertas!";

        memoryComplete.hidden = false;

        memoryFinalMessage.textContent =
            `Completaste el archivo en ${movements} movimientos y ` +
            `${formatTime(seconds)}. ¡Has descubierto las seis historias ` +
            `de Pierre-Simon Laplace y Sophie Germain!`;

        // Desplazamiento suave hasta el resultado.
        memoryComplete.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }

    // =====================================
    // 10. REINICIAR EL JUEGO
    // =====================================

    function resetMemoryGame() {

        stopMemoryTimer();

        if (mismatchTimeout !== null) {

            clearTimeout(mismatchTimeout);

            mismatchTimeout = null;

        }

        movements = 0;
        matchedPairs = 0;
        seconds = 0;

        firstCard = null;
        boardLocked = false;

        memoryComplete.hidden = true;

        memoryStatus.textContent =
            "El archivo está cerrado. ¡Descubre la primera pareja!";

        updateMemoryStats();

        createMemoryBoard();

    }

    // Botones de reinicio.
    memoryRestart.addEventListener("click", resetMemoryGame);

    memoryPlayAgain.addEventListener("click", resetMemoryGame);

    // =====================================
    // 11. INICIAR EL JUEGO
    // =====================================

    resetMemoryGame();

})();
