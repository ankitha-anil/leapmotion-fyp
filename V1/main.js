
const synthSelector = document.getElementById("synth-selector");
const playButton = document.getElementById("play-button");
const noteSlider = document.getElementById("note-slider");
const noteLabel = document.getElementById("note-label");

let synth = new Tone.Synth().toDestination();
let noteValue = "C3";

// const reverb = new Tone.Freeverb().toDestination();
// reverb.dampening = 1000;
//   // create a delay effect
// const delay = new Tone.PingPongDelay("16n", 0.6).toDestination();

// // create a filter effectp
// const filter = new Tone.Filter(2000, "lowpass").toDestination();

// // create a panning effect
// const panner = new Tone.Panner(-1).toDestination();

// // connect the synth to the effects
// synth.connect(reverb);
// synth.connect(delay);
// synth.connect(filter);
// synth.connect(panner);


playButton.addEventListener("click", () => {
    
});

const mapNote = (value) => {
    // set the range of the hand.palmPosition[1] value
    const minValue = -200;
    const maxValue = 200;
    // set the range of the musical notes
    const minNote = "C1";
    const maxNote = "C8";
    // calculate the mapped note
    const mappedNote =  Tone.Frequency(Tone.Scale.Linear.Map(value, minValue, maxValue, minNote, maxNote).toNote()).value;
    return mappedNote;
}

const mapVolume = (value) => {
    // set the range of the hand.stabilizedPalmPosition[0] value
    const minValue = -200;
    const maxValue = 200;
    // set the range of the volume value
    const minVolume = -60;
    const maxVolume = 30;
    // calculate the mapped volume
    return (value - minValue) * (maxVolume - minVolume) / (maxValue - minValue) + minVolume;
}

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
  controller.setBackground(true).connect();

  controller.on("frame", frame => {
    // Use the hand data to control the synth's frequency
    if (frame.hands.length > 0) {
      const hand = frame.hands[0];
      const palmPositionY = hand.stabilizedPalmPosition[1];
// set the frequency of the synth based on the mapped note
    if(hand.type === "right"){
          let transposedNote = Tone.Frequency(noteValue).transpose(palmPositionY*0.09);
          synth.frequency.value = transposedNote;
          document.getElementById("frequency").innerHTML = `Frequency: ${transposedNote.toNote()}`;
          const volume = Math.round(hand.stabilizedPalmPosition[0]);
          synth.volume.value = mapVolume(volume);
          document.getElementById("volume").innerHTML = `Volume: ${volume}`;
        }
  }

    // Use the finger data to control the synth's volume
    // if (frame.fingers.length > 0) {
    //   const finger = frame.fingers[0];
    //   const volume = finger.tipPosition[2];
    //   synth.volume.value = volume;
    //   document.getElementById("volume").innerHTML = `Volume: ${volume}`;
    // }
  });

  const stopButton = document.getElementById('stop-button');
  stopButton.addEventListener('click', () => {
      Tone.Transport.stop();
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

    this.ctx.fillStyle = `rgba(1,1,1,0.04)`;
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
    this.amplitude = synth.volume.value * 5;
    console.log("freq: "+ this.increment);
    console.log("length: "+ this.length);
  }

  animate() {
    this.frameCallback();
  }
}

const wave = new Wave(canvas, 150, 20, 0.07);
wave.animate();


