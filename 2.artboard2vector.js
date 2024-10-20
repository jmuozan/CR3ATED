const uploadInput = document.getElementById('upload');
        const smoothnessInput = document.getElementById('smoothness');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const output = document.getElementById('output');
        const downloadButton = document.getElementById('download');

        function detectLinePoints(imageData, width, height) {
            const data = imageData.data;
            const points = [];

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    
                    if (r === 0 && g === 0 && b === 0) { // Detect black
                        points.push({ x, y });
                    }
                }
            }
            return points;
        }

        function interpolatePath(points, smoothnessLevel) {
            if (points.length < 2) return '';

            let pathData = `M${points[0].x},${points[0].y} `;

            for (let i = 1; i < points.length - 1; i++) {
                if (i % smoothnessLevel === 0) {
                    const cx = (points[i].x + points[i + 1].x) / 2;
                    const cy = (points[i].y + points[i + 1].y) / 2;
                    pathData += `Q${points[i].x},${points[i].y} ${cx},${cy} `;
                }
            }
            
            // Ensure we end the line with a move to the last point
            const lastPoint = points[points.length - 1];
            pathData += `T${lastPoint.x},${lastPoint.y}`;
            
            return pathData.trim();
        }

        function updateSvg() {
            const smoothnessLevel = parseInt(smoothnessInput.value, 10);

            if (canvas.width > 0 && canvas.height > 0) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const points = detectLinePoints(imageData, canvas.width, canvas.height);
                const pathData = interpolatePath(points, smoothnessLevel);

                // Creating a path-based SVG for smoother curves
                const svgContent = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
                    <path d="${pathData}" stroke="black" fill="none"/></svg>`;

                output.innerHTML = svgContent;

                // Enable the download button
                downloadButton.style.display = 'block';

                downloadButton.onclick = () => {
                    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'vectorized-line.svg';
                    a.click();
                    
                    URL.revokeObjectURL(url);
                };
            }
        }

        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                updateSvg();
            };

            img.src = URL.createObjectURL(file);
        });

        smoothnessInput.addEventListener('input', updateSvg);