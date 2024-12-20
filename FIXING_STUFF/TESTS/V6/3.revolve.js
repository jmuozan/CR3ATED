const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        let subdivisions = 12;
        let scale = 1.0;
        let solidMesh, wireframeMesh;
        const solidMaterial = new THREE.MeshPhongMaterial({ color: 0x0077ff });
        const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });

        document.getElementById('extractButton').addEventListener('click', function() {
            const fileInput = document.getElementById('fileInput');
            const pointCountInput = document.getElementById('pointCount');
            const file = fileInput.files[0];
            const pointCount = parseInt(pointCountInput.value, 10);

            if (!file) {
                alert('Please upload an SVG file.');
                return;
            }

            if (isNaN(pointCount) || pointCount <= 0) {
                alert('Please enter a valid number of points.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(event.target.result, 'image/svg+xml');
                const path = svgDoc.querySelector('path');
                
                if (!path) {
                    alert('SVG must contain a <path> element.');
                    return;
                }

                const pathLength = path.getTotalLength();
                const pointsData = [];
                
                for (let i = 0; i < pointCount; i++) {
                    const point = path.getPointAtLength((i / (pointCount - 1)) * pathLength);
                    pointsData.push(new THREE.Vector2(point.x, point.y));
                }

                updateGeometry(pointsData);
            };

            reader.readAsText(file);
        });

        // Original front light
        const frontLight = new THREE.DirectionalLight(0xffffff, 1.3);
        frontLight.position.set(0, 0.6, 1).normalize();
        scene.add(frontLight);

        // Add a light from behind the object for balanced illumination
        const backLight = new THREE.DirectionalLight(0xffffff, 1.5);
        backLight.position.set(0, -0.3, -0.4).normalize();
        scene.add(backLight);

        // Additional spot light for focus from the top
        const topLight = new THREE.SpotLight(0xffffff, 1);
        topLight.position.set(0, 2, 0);
        topLight.castShadow = true;
        scene.add(topLight);

        function resetCamera() {
            if (solidMesh) adjustCameraToObject(solidMesh);
        }

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        function updateGeometry(points) {
            if (solidMesh && wireframeMesh) {
                scene.remove(solidMesh, wireframeMesh);
            }

            const latheGeometry = new THREE.LatheGeometry(points, subdivisions);
            solidMesh = new THREE.Mesh(latheGeometry, solidMaterial);
            wireframeMesh = new THREE.Mesh(latheGeometry, wireframeMaterial);

            solidMesh.scale.set(scale, scale, scale);
            wireframeMesh.scale.set(scale, scale, scale);

            solidMesh.rotation.set(
                THREE.MathUtils.degToRad(document.getElementById('rotateXRange').value),
                THREE.MathUtils.degToRad(document.getElementById('rotateYRange').value),
                THREE.MathUtils.degToRad(document.getElementById('rotateZRange').value)
            );
            wireframeMesh.rotation.copy(solidMesh.rotation);

            scene.add(solidMesh, wireframeMesh);
            adjustCameraToObject(solidMesh);
        }

        function adjustCameraToObject(object) {
            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = THREE.MathUtils.degToRad(camera.fov);
            const cameraZ = maxDim / (2 * Math.tan(fov / 2));
            camera.position.set(center.x, center.y, cameraZ * 1.5);

            controls.target.copy(center);
            controls.update();

            camera.far = cameraZ * 3;
            camera.updateProjectionMatrix();
        }

        document.getElementById('subdivisionsRange').addEventListener('input', (event) => {
            subdivisions = parseInt(event.target.value);
            document.getElementById('subdivisionsValue').textContent = subdivisions;
            if (solidMesh) updateGeometry(solidMesh.geometry.parameters.points);
        });

        document.getElementById('scaleRange').addEventListener('input', (event) => {
            scale = parseFloat(event.target.value);
            document.getElementById('scaleValue').textContent = scale.toFixed(1);
            if (solidMesh && wireframeMesh) {
                solidMesh.scale.set(scale, scale, scale);
                wireframeMesh.scale.set(scale, scale, scale);
            }
        });

        function updateRotation(axis, angle) {
            if (solidMesh && wireframeMesh) {
                const radians = THREE.MathUtils.degToRad(angle);
                solidMesh.rotation[axis] = radians;
                wireframeMesh.rotation[axis] = radians;
                document.getElementById(`rotate${axis.toUpperCase()}Range`).value = angle;
                document.getElementById(`rotate${axis.toUpperCase()}Input`).value = angle;
            }
        }

        ['X', 'Y', 'Z'].forEach(axis => {
            document.getElementById(`rotate${axis}Range`).addEventListener('input', (event) => {
                const angle = parseFloat(event.target.value);
                updateRotation(axis.toLowerCase(), angle);
            });

            document.getElementById(`rotate${axis}Input`).addEventListener('input', (event) => {
                const angle = parseFloat(event.target.value);
                updateRotation(axis.toLowerCase(), angle);
            });
        });

        document.getElementById('bgColor').addEventListener('input', (event) => {
            renderer.setClearColor(event.target.value);
        });

        document.getElementById('lineColor').addEventListener('input', (event) => {
            wireframeMaterial.color.set(event.target.value);
        });

        document.getElementById('shapeColor').addEventListener('input', (event) => {
            solidMaterial.color.set(event.target.value);
        });

        function exportSTL() {
            if (!solidMesh) return;
            const exporter = new THREE.STLExporter();
            const stlData = exporter.parse(solidMesh);
            const blob = new Blob([stlData], { type: 'text/plain' });
            const link = document.createElement('a');
            link.style.display = 'none';
            document.body.appendChild(link);
            link.href = URL.createObjectURL(blob);
            link.download = 'latheShape.stl';
            link.click();
        }