document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('dice-container');
    const canvas = document.getElementById('dice-canvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);

    function createFaceTexture(num) {
        const size = 128;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(num.toString(), size / 2, size / 2);
        return new THREE.CanvasTexture(c);
    }

    const materials = [];
    for (let i = 1; i <= 6; i++) {
        materials.push(new THREE.MeshBasicMaterial({ map: createFaceTexture(i) }));
    }

    const geometry = new THREE.BoxGeometry();
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
    camera.position.z = 2;

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    document.getElementById('roll-btn')?.addEventListener('click', () => {
        const guessEl = document.querySelector('input[name="guess"]:checked');
        const message = document.getElementById('dice-message');
        if (!guessEl) {
            if (message) message.textContent = 'Choose a number first';
            return;
        }
        const result = Math.floor(Math.random() * 6) + 1;
        const rotations = {
            1: [0, 0, 0],
            2: [0, Math.PI / 2, 0],
            3: [0, Math.PI, 0],
            4: [0, -Math.PI / 2, 0],
            5: [-Math.PI / 2, 0, 0],
            6: [Math.PI / 2, 0, 0]
        };
        const [rx, ry, rz] = rotations[result];
        cube.rotation.set(rx, ry, rz);
        if (message) {
            message.textContent = result == guessEl.value ? 'You guessed right! +10 XP' : `You rolled ${result}`;
        }
    });
});
