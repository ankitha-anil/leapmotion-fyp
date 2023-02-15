
const playButton = document.getElementById("play-button");
const stopButton = document.getElementById('stop-button');
const recordButton = document.getElementById('record-button');
const recordStopButton = document.getElementById('record-stop-button');

const recorder = new Tone.Recorder();
const synth = new Tone.Oscillator({
    type: "sine",
    frequency: 440,
    volume: -20
}).connect(recorder).toDestination();

const mapVolume = (value) => {
    // set the range of the hand.stabilizedPalmPosition[0] value
    const minValue = 70;
    const maxValue = 200;
    // set the range of the volume value
    const minVolume = -10;
    const maxVolume = -100;
    // calculate the mapped volume
    return (value - minValue) * (maxVolume - minVolume) / (maxValue - minValue) + minVolume;
}

function getFrequency(handPositionX, handPositionY) {
  const minX = 50; // minimum value for X axis
  const maxX = 200; // maximum value for X axis
  const minY = 70; // minimum value for Y axis
  const maxY = 500; // maximum value for Y axis
  
  // normalize the X axis
  let normalizedX = (handPositionX - minX) * 2 / (maxX - minX);
  //normalizedX = Math.max(0, Math.min(1, normalizedX));
  console.log("x: " + normalizedX)

  // normalize the Y axis
  let normalizedY = (handPositionY - minY) * 2 / (maxY - minY);
  //normalizedY = Math.max(0, Math.min(1, normalizedY));
  console.log("y: " + normalizedY)
  // calculate the frequency based on the normalized values
  let frequency = 100 + 64 * Math.pow(2, (normalizedY + normalizedX));
  console.log("frequency: "+ frequency)
  return frequency;
}
//synth.connect(gainNode);
const getFreqname = (value) => {
  if(value<=130){
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
}

const reverb = new Tone.Freeverb({dampening: 2000, wet: 0.5, roomSize: 0.9 }).toDestination();
reverb.dampening = 1000;
reverb.wet = 0.5;
reverb.roomSize = 0.9;
  // create a delay effect
const delay = new Tone.FeedbackDelay("1n", 0.2).toDestination();

  // create a filter effect
const filter = new Tone.Filter(1000, "lowpass").toDestination();

  // create a panning effect
const panner = new Tone.Panner(-0.5).toDestination();

  //  connect the synth to the effects
synth.connect(reverb);


const mapLength = (value) => {
  // set the range of the hand.stabilizedPalmPosition[0] value
  const minValue = -200;
  const maxValue = 200;
  // set the range of the volume value
  const minVolume = 60;
  const maxVolume = 10;

  // calculate the mapped volume
  return (value - minValue) * (maxVolume - minVolume) / (maxValue - minValue) + minVolume;
}

const controller = new Leap.Controller({
    host: "127.0.0.1",
    port: 6437
  });
  controller.connect();

     // Listen for frame data from the Leap Motion controller
  controller.on("frame", frame => {
        //gainNode.gain.rampTo(1, 0.1);
        for(var i = 0; i < frame.hands.length; i++){
          var hand = frame.hands[i];
            if(hand.type === "right"){
                synth.frequency.value = getFrequency(hand.stabilizedPalmPosition[0], hand.stabilizedPalmPosition[1]);
               // document.getElementById("frequency").innerHTML = `Frequency: ${getFreqname(synth.frequency.value)}`;
              }
            else if(hand.type === "left"){
                var volume = hand.stabilizedPalmPosition[1];
                synth.volume.value = mapVolume(hand.stabilizedPalmPosition[1]);
               // document.getElementById("volume").innerHTML = `Volume: ${mapVolume(synth.volume.value)}`;
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
      anchor.download = "recording.webm";
      anchor.href = url;
      anchor.click();
    }, 1000);
});

const canvas = document.querySelector('canvas');
canvas.width = window.outerWidth/1.5;
canvas.height = window.outerHeight/2;

class Wave {
  constructor(
    canv,
    maxAmplitude = 100,
    length = 10,
    frequency = 8,
    bgOpacity = 0.07,
    y,
  ) {
    this.canvas = canv;
    this.ctx = this.canvas.getContext('2d');
    this.maxAmplitude = maxAmplitude;
    this.amplitude = 0;
    this.length = length;
    this.frequency = frequency;
    this.increment = Math.random() * 360;
    this.bgOpacity = bgOpacity;
    this.y = y || this.canvas.height / 2;

    this.frameCallback = () => {
      this.draw(this.ctx);
      requestAnimationFrame(this.frameCallback);
    };
  }

  draw(c) {
    c.beginPath();

    this.ctx.fillStyle = `rgba(1,1,1,0.1)`;
    this.ctx.strokeStyle = `hsl(${this.increment * 20}, 80%, 70%)`;

    c.fillRect(0, 0, this.canvas.width, this.canvas.height);

    c.moveTo(1, this.canvas.height / 2);

    for (let i = 0; i < this.canvas.width; i += 1) {
      c.lineTo(
        i,
        this.y + Math.sin(i /this.length+ this.increment) * this.amplitude,
      );
    }

    c.stroke();
    c.closePath();

    this.length = mapLength(synth.frequency.value);
    this.increment -= synth.frequency.value/10000;
    this.amplitude = synth.volume.value * 2.5;
  }

  animate() {
    this.frameCallback();
  }
}

const wave = new Wave(canvas, 150, 20, 0.03);
wave.animate();


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
var helpBtn = document.getElementById("instruction");
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