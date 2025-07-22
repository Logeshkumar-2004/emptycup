// Get canvas and setup renderer
const canvas = document.getElementById("solarCanvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add light source at the center (Sun)
const light = new THREE.PointLight(0xffffff, 2);
scene.add(light);

// Load Textures
const textureLoader = new THREE.TextureLoader();

// Sun with texture
const sunTexture = textureLoader.load("assets/textures/sun.jpg");
const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planet Data
const planetsData = [
  { name: "Mercury", size: 0.6, distance: 4, speed: 0.04, info: "Closest to the Sun" },
  { name: "Venus", size: 1.0, distance: 6, speed: 0.015, info: "Hottest planet" },
  { name: "Earth", size: 1.1, distance: 8, speed: 0.01, info: "Our home planet" },
  { name: "Mars", size: 1.0, distance: 10, speed: 0.008, info: "Red Planet" },
  { name: "Jupiter", size: 2.0, distance: 14, speed: 0.005, info: "Largest planet" },
  { name: "Saturn", size: 1.8, distance: 17, speed: 0.003, info: "Has rings" },
  { name: "Uranus", size: 1.6, distance: 20, speed: 0.002, info: "Rotates sideways" },
  { name: "Neptune", size: 1.5, distance: 23, speed: 0.001, info: "Farthest from the Sun" }
];

// ✅ Orbit Rings
planetsData.forEach(data => {
  const ringGeometry = new THREE.RingGeometry(data.distance - 0.03, data.distance + 0.03, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x444444,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);
});

// Planets container
const planets = [];

// Speed controls container
const controls = document.getElementById("controls");

// Create planets, textures, orbits, speed sliders
planetsData.forEach(data => {
  // Planet Sphere
  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
  const texture = textureLoader.load(`assets/textures/${data.name.toLowerCase()}.jpg`);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const planet = new THREE.Mesh(geometry, material);

  planet.userData = {
    angle: 0,
    speed: data.speed,
    distance: data.distance
  };

  planets.push(planet);
  scene.add(planet);

  // ✅ Horizontal Control Group UI
  const group = document.createElement("div");
  group.className = "control-group";

  const label = document.createElement("label");
  label.innerText = data.name;

  const input = document.createElement("input");
  input.type = "range";
  input.min = 0.001;
  input.max = 0.1;
  input.step = 0.001;
  input.value = data.speed;
  input.oninput = () => planet.userData.speed = parseFloat(input.value);

  group.appendChild(label);
  group.appendChild(input);
  controls.appendChild(group);
});

// Camera Position
camera.position.z = 35;

// Handle browser resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ✅ Labels with Tooltips
const labelsContainer = document.getElementById("labels");
const labels = [];

planetsData.forEach(data => {
  const div = document.createElement("div");
  div.className = "label";
  div.innerText = data.name;
  div.setAttribute("data-info", `${data.name}: ${data.info}`);
  labelsContainer.appendChild(div);
  labels.push(div);
});

// Background Stars
function createStars(count = 1000) {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.3
  });

  const starVertices = [];

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 1000;
    const y = (Math.random() - 0.5) * 1000;
    const z = (Math.random() - 0.5) * 1000;
    starVertices.push(x, y, z);
  }

  starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starVertices, 3)
  );

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
createStars();

// Animate
function animate() {
  requestAnimationFrame(animate);

  // Move planets
  planets.forEach(planet => {
    planet.userData.angle += planet.userData.speed;
    planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
    planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
  });

  // Update label positions
  planets.forEach((planet, index) => {
    const vector = planet.position.clone().project(camera);
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
    labels[index].style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
  });

  renderer.render(scene, camera);
}

animate();
