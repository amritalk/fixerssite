
        // Global variables
        let canvas, ctx;
        let baselinePrice = 4.50;
        let currentPrice = baselinePrice;

        // Initialize the application
        function init() {
            canvas = document.getElementById('chart');
            ctx = canvas.getContext('2d');
            
            // Set canvas size
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            
            // Add event listeners to all sliders
            const sliders = ['ethicalTrend', 'premiumMarkets', 'purchasingPower', 
                           'climateImpact', 'cacaoDisease', 'farmingTechnology',
                           'shippingEfficiency', 'fairTrade', 'currencyRates'];
            
            sliders.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('input', updateModel);
                }
            });
            
            // Initial render
            updateModel();
        }

        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            updateModel();
        }

        function updateModel() {
            // Get all slider values
            const factors = {
                ethical: parseFloat(document.getElementById('ethicalTrend').value),
                premium: parseFloat(document.getElementById('premiumMarkets').value),
                purchasing: parseFloat(document.getElementById('purchasingPower').value),
                climate: parseFloat(document.getElementById('climateImpact').value),
                disease: parseFloat(document.getElementById('cacaoDisease').value),
                farmingTech: parseFloat(document.getElementById('farmingTechnology').value),
                shipping: parseFloat(document.getElementById('shippingEfficiency').value),
                fairTrade: parseFloat(document.getElementById('fairTrade').value),
                currency: parseFloat(document.getElementById('currencyRates').value)
            };

            // Update display values
            document.getElementById('ethicalValue').textContent = factors.ethical.toFixed(1) + 'x';
            document.getElementById('premiumValue').textContent = factors.premium.toFixed(1) + 'x';
            document.getElementById('purchasingValue').textContent = factors.purchasing.toFixed(1) + 'x';
            document.getElementById('climateValue').textContent = factors.climate.toFixed(1) + 'x';
            document.getElementById('diseaseValue').textContent = factors.disease.toFixed(1) + 'x';
            document.getElementById('farmingTechValue').textContent = factors.farmingTech.toFixed(1) + 'x';
            document.getElementById('shippingValue').textContent = factors.shipping.toFixed(1) + 'x';
            document.getElementById('fairTradeValue').textContent = factors.fairTrade.toFixed(1) + 'x';
            document.getElementById('currencyValue').textContent = factors.currency.toFixed(1) + 'x';

            // Calculate demand and supply curves
            const demandMultiplier = factors.ethical * factors.premium * factors.purchasing;
            const supplyMultiplier = factors.climate * factors.disease * factors.farmingTech * 
                                   factors.shipping * factors.currency;
            
            // Fair trade affects both supply (higher costs) and demand (premium pricing)
            const fairTradeEffect = factors.fairTrade;

            // Calculate equilibrium price
            currentPrice = baselinePrice * (demandMultiplier * fairTradeEffect / supplyMultiplier);
            
            // Update price display
            document.getElementById('priceDisplay').textContent = '$' + currentPrice.toFixed(2);

            // Draw the chart
            drawChart(demandMultiplier * fairTradeEffect, supplyMultiplier);
        }

        function drawChart(demandMultiplier, supplyMultiplier) {
            const width = canvas.width / window.devicePixelRatio;
            const height = canvas.height / window.devicePixelRatio;
            
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Chart margins
            const margin = 80;
            const chartWidth = width - 2 * margin;
            const chartHeight = height - 2 * margin;

            // Draw axes
            ctx.strokeStyle = '#6c757d';
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Y-axis
            ctx.moveTo(margin, margin);
            ctx.lineTo(margin, height - margin);
            // X-axis
            ctx.moveTo(margin, height - margin);
            ctx.lineTo(width - margin, height - margin);
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#495057';
            ctx.font = '16px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Chocolate Quantity (thousands of tons)', width / 2, height - 25);
            
            ctx.save();
            ctx.translate(30, height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('Price per Pound ($)', 0, 0);
            ctx.restore();

            // Grid lines
            ctx.strokeStyle = '#f1f3f4';
            ctx.lineWidth = 1;
            for (let i = 1; i <= 4; i++) {
                const x = margin + (i / 4) * chartWidth;
                const y = margin + (i / 4) * chartHeight;
                
                // Vertical grid lines
                ctx.beginPath();
                ctx.moveTo(x, margin);
                ctx.lineTo(x, height - margin);
                ctx.stroke();
                
                // Horizontal grid lines
                ctx.beginPath();
                ctx.moveTo(margin, y);
                ctx.lineTo(width - margin, y);
                ctx.stroke();
            }

            // Generate curve points
            const points = 100;
            const maxQuantity = 200;
            
            // Supply curve (upward sloping) - Chocolate themed
            ctx.strokeStyle = '#6F4E37';
            ctx.lineWidth = 6;
            ctx.beginPath();
            for (let i = 0; i <= points; i++) {
                const quantity = (i / points) * maxQuantity;
                const price = (2 + quantity * 0.03) / supplyMultiplier;
                const x = margin + (quantity / maxQuantity) * chartWidth;
                const y = height - margin - (price / 10) * chartHeight;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Demand curve (downward sloping) - Chocolate themed
            ctx.strokeStyle = '#D2691E';
            ctx.lineWidth = 6;
            ctx.beginPath();
            for (let i = 0; i <= points; i++) {
                const quantity = (i / points) * maxQuantity;
                const price = (8 - quantity * 0.03) * demandMultiplier;
                const x = margin + (quantity / maxQuantity) * chartWidth;
                const y = height - margin - (price / 10) * chartHeight;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Find and mark equilibrium point
            const eqQuantity = 100;
            const eqPrice = currentPrice;
            const eqX = margin + (eqQuantity / maxQuantity) * chartWidth;
            const eqY = height - margin - (eqPrice / 10) * chartHeight;

            // Equilibrium point
            ctx.fillStyle = '#28a745';
            ctx.beginPath();
            ctx.arc(eqX, eqY, 12, 0, 2 * Math.PI);
            ctx.fill();

            // Equilibrium lines
            ctx.strokeStyle = '#28a745';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 6]);
            ctx.beginPath();
            // Vertical line to x-axis
            ctx.moveTo(eqX, eqY);
            ctx.lineTo(eqX, height - margin);
            // Horizontal line to y-axis
            ctx.moveTo(eqX, eqY);
            ctx.lineTo(margin, eqY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Legend
            const legendX = width - 250;
            const legendY = margin + 30;
            
            ctx.fillStyle = '#D2691E';
            ctx.fillRect(legendX, legendY, 30, 6);
            ctx.fillStyle = '#495057';
            ctx.font = '16px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Chocolate Demand', legendX + 40, legendY + 10);

            ctx.fillStyle = '#6F4E37';
            ctx.fillRect(legendX, legendY + 35, 30, 6);
            ctx.fillStyle = '#495057';
            ctx.fillText('Chocolate Supply', legendX + 40, legendY + 45);

            ctx.fillStyle = '#28a745';
            ctx.beginPath();
            ctx.arc(legendX + 15, legendY + 70, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#495057';
            ctx.fillText('Market Price', legendX + 40, legendY + 77);
        }

        // Scenario functions
        function resetToBaseline() {
            document.getElementById('ethicalTrend').value = 1.0;
            document.getElementById('premiumMarkets').value = 1.0;
            document.getElementById('purchasingPower').value = 1.0;
            document.getElementById('climateImpact').value = 1.0;
            document.getElementById('cacaoDisease').value = 1.0;
            document.getElementById('farmingTechnology').value = 1.0;
            document.getElementById('shippingEfficiency').value = 1.0;
            document.getElementById('fairTrade').value = 1.0;
            document.getElementById('currencyRates').value = 1.0;
            updateModel();
        }

        function climateDisruptionScenario() {
            document.getElementById('climateImpact').value = 0.4;
            document.getElementById('cacaoDisease').value = 0.6;
            document.getElementById('farmingTechnology').value = 0.9;
            updateModel();
        }

        function ethicalBoomScenario() {
            document.getElementById('ethicalTrend').value = 2.2;
            document.getElementById('premiumMarkets').value = 1.8;
            document.getElementById('fairTrade').value = 1.8;
            updateModel();
        }

        function supplyChainCrisisScenario() {
            document.getElementById('shippingEfficiency').value = 0.5;
            document.getElementById('currencyRates').value = 0.8;
            document.getElementById('climateImpact').value = 0.7;
            updateModel();
        }

        // Initialize when page loads
        window.addEventListener('load', init);
    