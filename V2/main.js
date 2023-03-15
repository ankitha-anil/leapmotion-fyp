
const playButton = document.getElementById("play-button");
const stopButton = document.getElementById('stop-button');
const recordButton = document.getElementById('record-button');
const recordStopButton = document.getElementById('record-stop-button');
const volumeProgress = document.querySelector('.volume-progress-bar > div');

const recorder = new Tone.Recorder();

const synth = new Tone.Oscillator({
    type: "sine",
    frequency: 440,
    volume: -20
}).connect(recorder).toDestination();


const getFreqname = (value) => {
  if(value <= 130){
    return "C3"
  }
  else if(value>130 && value<= 146){
    return "D3"
  }
  else if(value>146 && value<= 164){
    return "E3"
  }
  else if(value>164 && value<= 174){
    return "F3"
  }
  else if(value>174 && value<= 196){
    return "G3"
  }
  else if(value>196 && value<= 220){
    return "A3"
  }
  else if(value>220 && value<= 246){
    return "B3"
  }
  else if(value>246 && value<= 261){
    return "C4"
  }
  else if(value>261 && value<= 293){
    return "D4"
  }
  else if(value>293 && value<= 329){
    return "E4"
  }
  else if(value>329 && value<= 349){
    return "F4"
  }
  else if(value>349 && value<= 392){
    return "G4"
  }
  else if(value>392 && value<= 440){
    return "A4"
  }
  else if(value>440 && value<= 493){
    return "B4"
  }
  else {
    return "C5"
  }
}

function getFrequency(handPositionX, handPositionY) {
  //calculate the frequency based on the normalized values
  let frequency = (250 * (handPositionX/2)) + (250 * handPositionY*2) ;
  console.log("frequency: "+ frequency)
  return frequency;
}

function effects(value) {

  const reverb = new Tone.Freeverb({ dampening: 2000, wet: 0.5, roomSize: 0.9 }).toDestination();
  const delay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.8, wet: 0.9}).toDestination();
  const phaser = new Tone.Phaser({ frequency : 0.5, octaves : 2.3, Q : 8, baseFrequency : 250, wet : 0.3}).toDestination();
  const chorus = new Tone.Chorus({ frequency: 0.1, delayTime: 10, type: "sine", depth: 1, feedback: 0.4, spread: 80, wet: 0.9}).toDestination();
  const panner = new Tone.Panner(-0.5).toDestination();
  const vibrato = new Tone.Vibrato(4, 0.5).toDestination();
  
  //  connect the synth to the effects
  if(value == "effect-1"){
    synth.disconnect();
    synth.type = "sine";
    synth.volume = -20;
    synth.connect(reverb);
    synth.connect(panner);
    synth.connect(recorder);
  }

  else if(value == "effect-2"){
    synth.disconnect();
    synth.type = "triangle";
    synth.connect(delay);
    synth.connect(phaser);    
    synth.connect(recorder);
  }

  else if(value == "effect-3"){
    synth.disconnect();
    synth.type = "square";
    synth.volume = -10;
    synth.connect(chorus);
    synth.connect(delay);
    synth.connect(recorder);
  }

  else if(value == "effect-4"){
    synth.disconnect();
    synth.type = "sawtooth";
    synth.volume = -100;
    synth.connect(vibrato);
    synth.connect(recorder);
  } 
}

const notes = document.querySelectorAll('.note');

const controller = new Leap.Controller({
    host: "127.0.0.1",
    port: 6437
  });
  controller.connect();

  // Listen for frame data from the Leap Motion controller
  controller.on("frame", frame => {
        for(var i = 0; i < frame.hands.length; i++){
          var hand = frame.hands[i];
          var iBox = frame.interactionBox;
            if(hand.type === "right"){
                var normalizedPoint = iBox.normalizePoint(hand.stabilizedPalmPosition, true);
                synth.frequency.value = getFrequency(normalizedPoint[0], normalizedPoint[1]);
                notes.forEach(note => {
                  document.getElementById(note.id).classList.remove('note-pressed');
                });
                document.getElementById(getFreqname(synth.frequency.value)).className = "note note-pressed";
              }
            else if(hand.type === "left"){
                var normalizedPoint = iBox.normalizePoint(hand.stabilizedPalmPosition, true);
                synth.volume.value = - 10 - 50 * normalizedPoint[1];
                var volume = Math.round(100 * normalizedPoint[1]);
                document.getElementById("volume").innerHTML = `Volume: ${100 - volume}`;
                volumeProgress.style.width = (100-volume) + '%';
              }
        }
    });

playButton.addEventListener("click", () => {
        synth.start();
        Tone.start();
        playButton.className = "c-button c-button_white-ghost-reverse";
        stopButton.className = "c-button c-button_white-ghost";
});

stopButton.addEventListener('click', () => {
    synth.stop();
    playButton.className = "c-button c-button_white-ghost";
    stopButton.className = "c-button c-button_white-ghost-reverse";
});

recordButton.addEventListener('click', () => {
    recorder.start();
    recordStopButton.className = "c-button c-button_white-ghost";
    recordButton.className = "c-button c-button_white-ghost-reverse";
});

recordStopButton.addEventListener('click', () => {
  recordButton.className = "c-button c-button_white-ghost";
  recordStopButton.className = "c-button c-button_white-ghost-reverse";
    // wait for the notes to end and stop the recording
    setTimeout(async () => {
      // the recorded audio is returned as a blob
      const recording = await recorder.stop();
      // download the recording by creating an anchor element and blob url
      const url = URL.createObjectURL(recording);
      const anchor = document.createElement("a");
      anchor.download = "Theremin Recording.webm";
      anchor.href = url;
      anchor.click();
    }, 1000);
});

// Get the modal
var infoModal = document.getElementById("InfoModal");
var infoBtn = document.getElementById("info");
var infoSpan = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
infoBtn.onclick = function() {
  infoModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
infoSpan.onclick = function() {
  infoModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == infoModal) {
    infoModal.style.display = "none";
  }
}

// Get the Help modal
var helpModal = document.getElementById("HelpModal");
var helpBtn = document.getElementById("help");
var helpSpan = document.getElementsByClassName("close")[1];

// When the user clicks on the button, open the modal 
helpBtn.onclick = function() {
  helpModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
helpSpan.onclick = function() {
  helpModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == helpModal) {
    helpModal.style.display = "none";
  }
}

const effectButtons = document.querySelectorAll('.effect-button');

effectButtons.forEach(button => {
  button.addEventListener('click', () => {
     // Deselect all buttons
     effectButtons.forEach(btn => {
      btn.classList.remove('c-button_white-ghost-reverse');
    });
    button.classList.add('c-button_white-ghost-reverse');

    effects(button.id);
  });
});

var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
}

// Update the current slider value (each time you drag the slider handle)
volumeNoteSlider.addEventListener('input', function() {

  var value = this.value;
  volumeNoteLabel.textContent = value;
});

