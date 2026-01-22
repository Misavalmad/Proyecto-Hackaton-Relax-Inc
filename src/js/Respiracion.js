let isBreathing = false;

let breathingInterval;

let timerInterval;

let startTime;

let currentPhase = "inhale";

let activeSound = null;
let audioContext;
let currentAudioSource;



function createParticles() {

  const container = document.querySelector(".bg-particles");

  for (let i = 0; i < 20; i++) {

    const particle = document.createElement("div");

    particle.className = "particle";

    particle.style.left = Math.random() * 100 + "%";

    particle.style.animationDelay = Math.random() * 8 + "s";

    particle.style.animationDuration = 8 + Math.random() * 4 + "s";

    container.appendChild(particle);

  }

}



function initAudio() {

  if (!audioContext) {

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

  }

}



function createSound(type) {

  if (!audioContext) return null;



  const bufferSize = audioContext.sampleRate * 2;

  const buffer = audioContext.createBuffer(

    1,bufferSize,audioContext.sampleRate

  );

  const data = buffer.getChannelData(0);



  switch (type) {

    case "rain":

      for (let i = 0; i < bufferSize; i++) {

        data[i] = (Math.random() * 2 - 1) * 0.3;

      }

      break;

    case "ocean":

      for (let i = 0; i < bufferSize; i++) {

        const wave1 = Math.sin(

          (2 * Math.PI * 0.1 * i) / audioContext.sampleRate

        );

        const wave2 = Math.sin(

          (2 * Math.PI * 0.05 * i) / audioContext.sampleRate

        );

        const noise = (Math.random() * 2 - 1) * 0.1;

        data[i] = (wave1 + wave2) * 0.3 + noise;

      }

      break;



    case "forest":

      for (let i = 0; i < bufferSize; i++) {

        const sample = (Math.random() * 2 - 1) * 0.2;

        if (Math.random() < 0.001) {

          sample +=

            Math.sin(

              (2 * Math.PI * (800 + Math.random() * 400) * i) /

                audioContext.sampleRate

            ) * 0.1;

        }

        data[i] = sample;

      }

      break;

  }

  return buffer;

}



function toggleSound(soundType) {

  document

    .querySelectorAll(".sound-btn")

    .forEach((btn) => btn.classList.remove("active"));



  if (currentAudioSource) {

    currentAudioSource.stop();

    currentAudioSource = null;

  }



  if (soundType === "silence" || activeSound === soundType) {

    activeSound = null;

    return;

  }



  activeSound = soundType;

  event.target.classList.add("active");



  if (soundType !== "silence") {

    playAmbientSound(soundType);

  }

}



function playAmbientSound(type) {

  initAudio();

  const buffer = createSound(type);

  if (!buffer) return;



  currentAudioSource = audioContext.createBufferSource();

  currentAudioSource.buffer = buffer;

  currentAudioSource.loop = true;



  const filter = audioContext.createBiquadFilter();

  filter.type = "lowpass";

  filter.frequency.setValueAtTime(

    type === "rain" ? 8000 : type === "ocean" ? 500 : 3000,

    audioContext.currentTime

  );



  const gainNode = audioContext.createGain();

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);



  currentAudioSource.connect(filter);

  filter.connect(gainNode);

  gainNode.connect(audioContext.destination);



  currentAudioSource.start();

}



function toggleBreathing() {
  const playBtn = document.getElementById("playBtn");
  // Buscamos el span interno para que no se nos vaya el efecto del gradiente al hacer click
  const btnText = playBtn.querySelector('.btn-text'); 

  if (!isBreathing) {
    startBreathing();
    btnText.textContent = "Pause"; // Cambiamos solo el texto del span
    playBtn.classList.add("active");
  } else {
    stopBreathing();
    btnText.textContent = "Start"; // Cambiamos solo el texto del span
    playBtn.classList.remove("active");
  }
}

function resetSession() {
  stopBreathing();
  document.getElementById('timer').textContent = '00:00';
  
  const playBtnText = document.querySelector("#playBtn .btn-text");
  if (playBtnText) playBtnText.textContent = 'Start';
  
  document.getElementById('instruction').textContent = 'Click the circle to begin';
  currentPhase = 'inhale';
}



function startBreathing() {

  isBreathing = true;

  startTime = Date.now();

  const circle = document.getElementById("breathingCircle");

  const instruction = document.getElementById("instruction");



  circle.classList.add("breathe-animate", "active");

  instruction.classList.add("active");



  startTimer();

  startBreathingCycle();

}



function stopBreathing() {

  isBreathing = false;

  const circle = document.getElementById("breathingCircle");

  const instruction = document.getElementById("instruction");



  circle.classList.remove("breathe-animate", "active");

  instruction.classList.remove("active");



  if (breathingInterval) clearInterval(breathingInterval);

  if (timerInterval) clearInterval(timerInterval);

}



function startBreathingCycle() {

  updateInstruction();



  breathingInterval = setInterval(() => {

    currentPhase =

      currentPhase === "inhale"

        ? "hold"

        : currentPhase === "hold"

        ? "exhale"

        : currentPhase === "exhale"

        ? "rest"

        : "inhale";

    updateInstruction();

  }, 2000);

}



function updateInstruction() {

  const instruction = document.getElementById("instruction");



  const messages = {

    inhale: "Inhala lento...",

    hold: "Aguanta la respiración...",

    exhale: "Exhala ...",

    rest: "Descansa y prepara la siguiente...",

  };



  instruction.textContent = messages[currentPhase];

}



function startTimer() {

  timerInterval = setInterval(() => {

    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    const minutes = Math.floor(elapsed / 60);

    const seconds = elapsed % 60;



    document.getElementById("timer").textContent = `${minutes

      .toString()

      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  }, 1000);

}



function resetSession(){

    stopBreathing();

    document.getElementById('timer').textContent = '00:00';

    document.getElementById('instruction').textContent = 'Click the circle to begin';

    document.getElementById('playBtn').textContent = 'Start';

    currentPhase = 'inhale';

    

}



createParticles();



toggleSound('silence');