    // Scene, camera, and renderer initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Points to define the profile of the cylinder
    const points = [];
    const height = 5;  // height of the cylinder
    const radius = 2;  // radius of the cylinder
    const numPoints = 20; // the number of points defining the circle
    for (let i = 0; i <= numPoints; i++) {
      const y = (i / numPoints) * height - height / 2; // y should be from -height/2 to +height/2
      points.push(new THREE.Vector2(radius, y));
    }

    // LatheGeometry to create a cylinder by revolving the points around the y-axis
    const latheGeometry = new THREE.LatheGeometry(points);

    // Material and mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const cylinder = new THREE.Mesh(latheGeometry, material);
    scene.add(cylinder);

    // Position camera
    camera.position.z = 10;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotation only on the y-axis for better visualization
      cylinder.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Export STL function
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stlData = exporter.parse(cylinder);
      const blob = new Blob([stlData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = 'cylinder.stl';
      link.click();
    }


    // Scene, camera, and renderer initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Points to define the profile of the cylinder
    const points = [];
    const height = 5;  // height of the cylinder
    const radius = 2;  // radius of the cylinder
    const numPoints = 20; // the number of points defining the circle
    for (let i = 0; i <= numPoints; i++) {
      const y = (i / numPoints) * height - height / 2; // y should be from -height/2 to +height/2
      points.push(new THREE.Vector2(radius, y));
    }

    // LatheGeometry to create a cylinder by revolving the points around the y-axis
    const latheGeometry = new THREE.LatheGeometry(points);

    // Material and mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const cylinder = new THREE.Mesh(latheGeometry, material);
    scene.add(cylinder);

    // Position camera
    camera.position.z = 10;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotation only on the y-axis for better visualization
      cylinder.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Export STL function
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stlData = exporter.parse(cylinder);
      const blob = new Blob([stlData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = 'cylinder.stl';
      link.click();
    }

    
    // Scene, camera, and renderer initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Points to define the profile of the cylinder
    const points = [];
    const height = 5;  // height of the cylinder
    const radius = 2;  // radius of the cylinder
    const numPoints = 20; // the number of points defining the circle
    for (let i = 0; i <= numPoints; i++) {
      const y = (i / numPoints) * height - height / 2; // y should be from -height/2 to +height/2
      points.push(new THREE.Vector2(radius, y));
    }

    // LatheGeometry to create a cylinder by revolving the points around the y-axis
    const latheGeometry = new THREE.LatheGeometry(points);

    // Material and mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const cylinder = new THREE.Mesh(latheGeometry, material);
    scene.add(cylinder);

    // Position camera
    camera.position.z = 10;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotation only on the y-axis for better visualization
      cylinder.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Export STL function
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stlData = exporter.parse(cylinder);
      const blob = new Blob([stlData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = 'cylinder.stl';
      link.click();
    }


    // Scene, camera, and renderer initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Points to define the profile of the cylinder
    const points = [];
    const height = 5;  // height of the cylinder
    const radius = 2;  // radius of the cylinder
    const numPoints = 20; // the number of points defining the circle
    for (let i = 0; i <= numPoints; i++) {
      const y = (i / numPoints) * height - height / 2; // y should be from -height/2 to +height/2
      points.push(new THREE.Vector2(radius, y));
    }

    // LatheGeometry to create a cylinder by revolving the points around the y-axis
    const latheGeometry = new THREE.LatheGeometry(points);

    // Material and mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const cylinder = new THREE.Mesh(latheGeometry, material);
    scene.add(cylinder);

    // Position camera
    camera.position.z = 10;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotation only on the y-axis for better visualization
      cylinder.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Export STL function
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stlData = exporter.parse(cylinder);
      const blob = new Blob([stlData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = 'cylinder.stl';
      link.click();
    }
    // Scene, camera, and renderer initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Points to define the profile of the cylinder
    const points = [];
    const height = 5;  // height of the cylinder
    const radius = 2;  // radius of the cylinder
    const numPoints = 20; // the number of points defining the circle
    for (let i = 0; i <= numPoints; i++) {
      const y = (i / numPoints) * height - height / 2; // y should be from -height/2 to +height/2
      points.push(new THREE.Vector2(radius, y));
    }

    // LatheGeometry to create a cylinder by revolving the points around the y-axis
    const latheGeometry = new THREE.LatheGeometry(points);

    // Material and mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const cylinder = new THREE.Mesh(latheGeometry, material);
    scene.add(cylinder);

    // Position camera
    camera.position.z = 10;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotation only on the y-axis for better visualization
      cylinder.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Export STL function
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stlData = exporter.parse(cylinder);
      const blob = new Blob([stlData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = 'cylinder.stl';
      link.click();
    }


    // Scene, camera, and renderer initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Points to define the profile of the cylinder
    const points = [];
    const height = 5;  // height of the cylinder
    const radius = 2;  // radius of the cylinder
    const numPoints = 20; // the number of points defining the circle
    for (let i = 0; i <= numPoints; i++) {
      const y = (i / numPoints) * height - height / 2; // y should be from -height/2 to +height/2
      points.push(new THREE.Vector2(radius, y));
    }

    // LatheGeometry to create a cylinder by revolving the points around the y-axis
    const latheGeometry = new THREE.LatheGeometry(points);

    // Material and mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const cylinder = new THREE.Mesh(latheGeometry, material);
    scene.add(cylinder);

    // Position camera
    camera.position.z = 10;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotation only on the y-axis for better visualization
      cylinder.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Export STL function
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stlData = exporter.parse(cylinder);
      const blob = new Blob([stlData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = 'cylinder.stl';
      link.click();
    }
    // Scene, camera, and renderer initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Points to define the profile of the cylinder
    const points = [];
    const height = 5;  // height of the cylinder
    const radius = 2;  // radius of the cylinder
    const numPoints = 20; // the number of points defining the circle
    for (let i = 0; i <= numPoints; i++) {
      const y = (i / numPoints) * height - height / 2; // y should be from -height/2 to +height/2
      points.push(new THREE.Vector2(radius, y));
    }

    // LatheGeometry to create a cylinder by revolving the points around the y-axis
    const latheGeometry = new THREE.LatheGeometry(points);

    // Material and mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const cylinder = new THREE.Mesh(latheGeometry, material);
    scene.add(cylinder);

    // Position camera
    camera.position.z = 10;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotation only on the y-axis for better visualization
      cylinder.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Export STL function
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stlData = exporter.parse(cylinder);
      const blob = new Blob([stlData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = 'cylinder.stl';
      link.click();
    }


    // Scene, camera, and renderer initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Points to define the profile of the cylinder
    const points = [];
    const height = 5;  // height of the cylinder
    const radius = 2;  // radius of the cylinder
    const numPoints = 20; // the number of points defining the circle
    for (let i = 0; i <= numPoints; i++) {
      const y = (i / numPoints) * height - height / 2; // y should be from -height/2 to +height/2
      points.push(new THREE.Vector2(radius, y));
    }

    // LatheGeometry to create a cylinder by revolving the points around the y-axis
    const latheGeometry = new THREE.LatheGeometry(points);

    // Material and mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const cylinder = new THREE.Mesh(latheGeometry, material);
    scene.add(cylinder);

    // Position camera
    camera.position.z = 10;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotation only on the y-axis for better visualization
      cylinder.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Export STL function
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stlData = exporter.parse(cylinder);
      const blob = new Blob([stlData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = 'cylinder.stl';
      link.click();
    }
    // Scene, camera, and renderer initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Points to define the profile of the cylinder
    const points = [];
    const height = 5;  // height of the cylinder
    const radius = 2;  // radius of the cylinder
    const numPoints = 20; // the number of points defining the circle
    for (let i = 0; i <= numPoints; i++) {
      const y = (i / numPoints) * height - height / 2; // y should be from -height/2 to +height/2
      points.push(new THREE.Vector2(radius, y));
    }

    // LatheGeometry to create a cylinder by revolving the points around the y-axis
    const latheGeometry = new THREE.LatheGeometry(points);

    // Material and mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const cylinder = new THREE.Mesh(latheGeometry, material);
    scene.add(cylinder);

    // Position camera
    camera.position.z = 10;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotation only on the y-axis for better visualization
      cylinder.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Export STL function
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stlData = exporter.parse(cylinder);
      const blob = new Blob([stlData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = 'cylinder.stl';
      link.click();
    }


    // Scene, camera, and renderer initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Points to define the profile of the cylinder
    const points = [];
    const height = 5;  // height of the cylinder
    const radius = 2;  // radius of the cylinder
    const numPoints = 20; // the number of points defining the circle
    for (let i = 0; i <= numPoints; i++) {
      const y = (i / numPoints) * height - height / 2; // y should be from -height/2 to +height/2
      points.push(new THREE.Vector2(radius, y));
    }

    // LatheGeometry to create a cylinder by revolving the points around the y-axis
    const latheGeometry = new THREE.LatheGeometry(points);

    // Material and mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const cylinder = new THREE.Mesh(latheGeometry, material);
    scene.add(cylinder);

    // Position camera
    camera.position.z = 10;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotation only on the y-axis for better visualization
      cylinder.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Export STL function
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stlData = exporter.parse(cylinder);
      const blob = new Blob([stlData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = 'cylinder.stl';
      link.click();
    }
    // Scene, camera, and renderer initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Points to define the profile of the cylinder
    const points = [];
    const height = 5;  // height of the cylinder
    const radius = 2;  // radius of the cylinder
    const numPoints = 20; // the number of points defining the circle
    for (let i = 0; i <= numPoints; i++) {
      const y = (i / numPoints) * height - height / 2; // y should be from -height/2 to +height/2
      points.push(new THREE.Vector2(radius, y));
    }

    // LatheGeometry to create a cylinder by revolving the points around the y-axis
    const latheGeometry = new THREE.LatheGeometry(points);

    // Material and mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const cylinder = new THREE.Mesh(latheGeometry, material);
    scene.add(cylinder);

    // Position camera
    camera.position.z = 10;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotation only on the y-axis for better visualization
      cylinder.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Export STL function
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stlData = exporter.parse(cylinder);
      const blob = new Blob([stlData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = 'cylinder.stl';
      link.click();
    }


    // Scene, camera, and renderer initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Points to define the profile of the cylinder
    const points = [];
    const height = 5;  // height of the cylinder
    const radius = 2;  // radius of the cylinder
    const numPoints = 20; // the number of points defining the circle
    for (let i = 0; i <= numPoints; i++) {
      const y = (i / numPoints) * height - height / 2; // y should be from -height/2 to +height/2
      points.push(new THREE.Vector2(radius, y));
    }

    // LatheGeometry to create a cylinder by revolving the points around the y-axis
    const latheGeometry = new THREE.LatheGeometry(points);

    // Material and mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    const cylinder = new THREE.Mesh(latheGeometry, material);
    scene.add(cylinder);

    // Position camera
    camera.position.z = 10;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotation only on the y-axis for better visualization
      cylinder.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Export STL function
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stlData = exporter.parse(cylinder);
      const blob = new Blob([stlData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = 'cylinder.stl';
      link.click();
    }
