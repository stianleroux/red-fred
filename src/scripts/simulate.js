document.getElementById('simulateBtn')?.addEventListener('click', async () => {
    const input = document.getElementById('inputArea')?.value || '';
    const outputEl = document.getElementById('outputArea');
    outputEl.textContent = 'Processing...';
  
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
  
      const data = await res.json();
      outputEl.textContent = data.result || 'No result';
    } catch (e) {
      outputEl.textContent = 'Error processing input.';
      console.error(e);
    }
  });
