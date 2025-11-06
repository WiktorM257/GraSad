//zmienna do sprawdzanie statusu gry (true = trwa, false = koniec gry)
let graAktywna = true;

const scoreElement = document.querySelector('.score');
const komunikatEl = document.querySelector('.komunikat');

// Obiekt reprezentujący koszyk gracza
const koszyk = {
  x: 100,                       
  element: document.getElementById('koszyk'), 
  iloscZebrancyh: 0,                
  maksPojemnosc: 10,            

  // Metoda zmieniająca ilość punktów 
  addToScore(delta) {
    this.iloscZebrancyh += delta;      
    this.updateHUD();         // Aktualizuje wynik na ekranie

      // Sprawdzanie czy gracz uzbierał wystarczającą ilość jabłek do zakończenia gry 
    if (this.iloscZebrancyh >= this.maksPojemnosc) {
      koniecGry('Wygrałeś!');
    }
  },

  // Metoda aktualizująca  wynik na ekranie
  updateHUD() {
    if (scoreElement)
      scoreElement.textContent = `Wynik: ${this.iloscZebrancyh} / ${this.maksPojemnosc}`;
  }
};

  // Restartowanie wyniku 
koszyk.updateHUD();

// Krok przesunięcia koszyka przy każdym wciśnięciu strzałki
const krok = 5;

// Obiekt przechowujący stan wciśniętych klawiszy
const keysPressed = { ArrowRight: false, ArrowLeft: false };

// Sterowanie koszykiem. Sprawdza czy lewa bądź prawa strzałka jest wciśnieta
document.addEventListener('keydown', (e) => {              
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') keysPressed[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') keysPressed[e.key] = false;
});

// Główna pętla ruchu koszyka
function moveLoop() {
  if (!graAktywna) return; 

  // Ruch w prawo i lewo
  if (keysPressed.ArrowRight) koszyk.x += krok;
  if (keysPressed.ArrowLeft) koszyk.x -= krok;

  // Ograniczenie aby koszyk nie mógł wyjść poza obecną szerokość ekranu 
  if (koszyk.x < 0) koszyk.x = 0;
  const maxX = window.innerWidth - koszyk.element.offsetWidth;
  if (koszyk.x > maxX) koszyk.x = maxX;

  // Zmiana pozycji koszyka w CSS
  koszyk.element.style.left = koszyk.x + 'px';

  requestAnimationFrame(moveLoop);
}
moveLoop(); // Odpalenie pętli 

// Funkcja kończąca grę 
function koniecGry(tekst) {
  graAktywna = false; // Zatrzymuje grę
  if (komunikatEl) {
    komunikatEl.textContent = tekst;     
    komunikatEl.style.display = 'block'; 
  }
  // Zatrzymanie generacji jabłek
  clearInterval(generatorDobrych);
  clearInterval(generatorZlych);
}

// Funkcja tworząca obiekt(jabkłka)
function spadajacyObiekt(klasa, onCatch) {
  if (!graAktywna) return; // Tworzy pod warunkiem że gra nadal jest nie zakończona

  // Stworzenie elementu HTML
  const obiekt = document.createElement('div');
  obiekt.classList.add(klasa);
  obiekt.style.left = Math.random() * (window.innerWidth - 32) + 'px'; // Losowa pozycja startowa
  obiekt.style.top = '0px';
  document.body.appendChild(obiekt);

  let y = 0; // Aktualna wysokość obiektu
  const spadanie = setInterval(() => {
    if (!graAktywna) {
      clearInterval(spadanie);
      obiekt.remove();
      return;
    }

    // Przesuwanie obiektu w dół
    y += 4;
    obiekt.style.top = y + 'px';

    // Pobranie aktualnych pozycji obiektu i koszyka
    const obiektX = obiekt.offsetLeft;
    const obiektY = obiekt.offsetTop;
    const koszykX = koszyk.x;
    const koszykY = koszyk.element.offsetTop;

    // Sprawdzenie kolizji obiektu z koszykiem
    if (
      obiektY + obiekt.offsetHeight >= koszykY &&
      obiektX + obiekt.offsetWidth >= koszykX &&
      obiektX <= koszykX + koszyk.element.offsetWidth
    ) {
      obiekt.remove();          
      clearInterval(spadanie);  
      onCatch();                // wywołanie funkcji aktualizującej wynik
    }

    // Jeśli obiekt spadnie poza ekran — usuń go
    if (y > window.innerHeight) {
      obiekt.remove();
      clearInterval(spadanie);
    }
  }, 20); 
}

// Tworzenie „dobrych” obiektów (czerwonych jabłek)
function stworzObiekt() {
  spadajacyObiekt('obiekt', () => {
    koszyk.addToScore(+1); 
  });
}

// Tworzenie „złych” obiektów (zielonych jabłek)
function stworzObiekt1() {
  spadajacyObiekt('obiekt1', () => {
    koszyk.addToScore(-1);      
    if (koszyk.iloscZebrancyh <= -5)    
      koniecGry('Przegrałeś!');  
  });
}

// Generatory spadających obiektów
const generatorDobrych = setInterval(stworzObiekt, 4000);
const generatorZlych = setInterval(stworzObiekt1, 2000);  
