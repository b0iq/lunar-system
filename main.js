import "./style.css";

import { getMoonPosition, getMoonIllumination } from "suncalc";

const app = document.querySelector("#app");

const image1 = document.createElement("img");
image1.width = 500;
const image2 = document.createElement("img");
image2.width = 500;
const dateInput = document.createElement("input");
dateInput.type = "date";
dateInput.valueAsDate = new Date();

const latitudeInput = document.createElement("input");
latitudeInput.type = "number";
latitudeInput.value = 25.2048;

const longitudeInput = document.createElement("input");
longitudeInput.type = "number";
longitudeInput.value = 55.2708;

const calculateButton = document.createElement("input");
calculateButton.type = "button";
calculateButton.value = "Calculate";
calculateButton.addEventListener("click", update);
dateInput.addEventListener("change", update);

const hr = document.createElement("hr");

const resultsContainer = document.createElement("code");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 360;
canvas.height = 360 * (4 / 3);
canvas.style.backgroundColor = "black";

const loadedImages = [];
async function loadApp() {
  const t0 = performance.now();
  for await (let i of [...Array(95).keys()]) {
    const img = new Image(200, 200);
    img.src = "/new/" + i + ".png";
    await new Promise((resolve) => (img.onload = resolve));
    loadedImages.push(img);
  }
  // for (let i of [...Array(95).keys()]) {
  //   const img = new Image();
  //   img.src = "/new/" + i + ".png";
  //   img.onload = () => {
  //     loadedImages.push(img);
  //   };
  // }
  const t1 = performance.now();
  console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
  app.append(
    dateInput,
    latitudeInput,
    longitudeInput,
    calculateButton,
    hr,
    resultsContainer,
    hr,
    image1,
    image2,
    canvas
  );
}
loadApp();
const lerp = (x, y, a) => x * (1 - a) + y * a;
let lastIndex = null;
async function update() {
  resultsContainer.innerHTML = "";
  let date = new Date(dateInput.value);
  // resultsContainer.innerHTML += date.getTime();
  const latitude = parseInt(latitudeInput.value);
  const longitude = parseInt(longitudeInput.value);
  const moonPosition = getMoonPosition(date, latitude, longitude);
  const radians = moonPosition.parallacticAngle;
  moonPosition.parallacticAngle = radians * (180 / Math.PI);
  // resultsContainer.innerHTML += `${JSON.stringify(moonPosition, null, 2)}`;
  const moonIllumination = getMoonIllumination(date);

  moonIllumination["image"] = Math.round(lerp(0, 95, moonIllumination.phase));
  moonIllumination["image2"] = Math.round(lerp(0, 62, moonIllumination.phase));

  image1.src = "/new/" + moonIllumination.image + ".png";
  image2.src = "/old/" + moonIllumination.image2 + ".png";

  image1.style.transform = image2.style.transform =
    "rotate(" + moonPosition.parallacticAngle + "deg)";
  resultsContainer.innerHTML += `${JSON.stringify(moonIllumination, null, 2)}`;
  updateCanvas(moonIllumination.image, radians);
  // const f = await fetch(
  //   `https://positiveprints.com/api/moon/phase?utcTimestamp=${date.getTime()}&lng=${longitude}&lat=${latitude}`
  // );
  // resultsContainer.innerHTML += await f.json();
}
function updateCanvas(newIndex, radians) {
  if (lastIndex === newIndex) return;
  if (lastIndex === null) {
    lastIndex = 0;
  }
  drawMoon(radians, lastIndex, newIndex, undefined);
  console.log("from", lastIndex, "to", newIndex);
}
async function drawMoon(radians, from, to, current = undefined) {
  const forward = from < to;
  if (current === undefined) current = from;
  if (current === to) {
    lastIndex = to;
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(100, 100); // 100, 100
  ctx.rotate(radians); // TODO: animate rotation first in degree then convert it to radian
  ctx.translate(-100, -100); // 100, 100
  ctx.drawImage(loadedImages[current], 0, 0, 200, 200);
  ctx.restore();

  await new Promise((resolve) => setTimeout(resolve, 75));
  window.requestAnimationFrame(() => {
    if (!forward) {
      drawMoon(radians, from, to, current - 1);
    } else {
      drawMoon(radians, from, to, current + 1);
    }
  });
}
