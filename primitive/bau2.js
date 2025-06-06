
function createLayout(container) {
	// Create the top div
	const topDiv = document.createElement('div');
	topDiv.style.backgroundColor = 'lightblue';
	topDiv.style.padding = '10px';
	topDiv.textContent = "Top div - grows with content.";

	// Create the bottom div
	const bottomDiv = document.createElement('div');
	bottomDiv.style.display = 'flex'; // Flexbox for sidebar and main content
	bottomDiv.style.flexGrow = '1'; // Take the remaining height
	bottomDiv.style.overflow = 'hidden'; // Prevent overflow issues

	// Create the left (sidebar) div
	const leftDiv = document.createElement('div');
	leftDiv.style.width = '60px'; // Initial width of the sidebar (collapsed)
	leftDiv.style.backgroundColor = 'lightgray';
	leftDiv.style.transition = 'width 0.5s ease'; // Smooth transition for open/close

	// Add the 'menu' symbol to the sidebar
	const menuSymbol = document.createElement('div');
	menuSymbol.textContent = "☰"; // Menu symbol (three lines)
	menuSymbol.style.cursor = 'pointer';
	menuSymbol.style.padding = '10px';
	menuSymbol.style.fontSize = '24px';
	leftDiv.appendChild(menuSymbol);

	// Create the right div (main content area)
	const rightDiv = document.createElement('div');
	rightDiv.style.flexGrow = '1'; // Take up the rest of the width
	rightDiv.style.overflowY = 'scroll'; // Scrollbar if content overflows
	rightDiv.style.backgroundColor = 'lightgreen';
	rightDiv.style.padding = '10px';
	rightDiv.textContent = "Right content area with scrollable content.";

	// Add some extra content to make the right div scrollable
	for (let i = 0; i < 20; i++) {
		const p = document.createElement('p');
		p.textContent = `Content line ${i + 1}`;
		rightDiv.appendChild(p);
	}

	// Append left (sidebar) and right (content area) to bottom div
	bottomDiv.appendChild(leftDiv);
	bottomDiv.appendChild(rightDiv);

	// Append top and bottom divs to the container
	container.style.display = 'flex';
	container.style.flexDirection = 'column';
	container.style.height = '100%'; // Make sure container has height constraint
	container.appendChild(topDiv);
	container.appendChild(bottomDiv);

	// Toggle sidebar open/close on menu symbol click
	let sidebarOpen = false;
	menuSymbol.addEventListener('click', () => {
		if (sidebarOpen) {
			leftDiv.style.width = '60px'; // Collapse the sidebar
		} else {
			leftDiv.style.width = '200px'; // Expand the sidebar
		}
		sidebarOpen = !sidebarOpen;
	});

	return [topDiv,leftDiv,rightDiv];
}

