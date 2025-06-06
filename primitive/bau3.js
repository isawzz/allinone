
function mLayoutTopLeftTable(container) {

	let topDiv = mDom(null, { bg: 'lightblue', padding: 10 }, { html: "Top div - grows with content." });
	let bottomDiv = mDom(null, { display: 'flex', overflow: 'hidden' });
	let leftDiv = mDom(null, { w: 60, bg: 'lightgray', transition: 'width 0.5s ease' });
	let menuSymbol = mDom(leftDiv, { cursor: 'pointer', fz: 24, padding: 10 }, { html: getMenuSymbol() });
	let rightDiv = mDom(null, { overy: 'scroll', bg: 'lightgreen', padding: 10 }, { html: "Right content area with scrollable content." });

	bottomDiv.style.flexGrow = '1'; // Take up the rest of the width
	rightDiv.style.flexGrow = '1'; // Take up the rest of the width

	// // Create the right div (main content area)
	// const rightDiv = document.createElement('div');
	// rightDiv.style.flexGrow = '1'; // Take up the rest of the width
	// rightDiv.style.overflowY = 'scroll'; // Scrollbar if content overflows
	// rightDiv.style.backgroundColor = 'lightgreen';
	// rightDiv.style.padding = '10px';
	// rightDiv.textContent = "Right content area with scrollable content.";

	for (let i = 0; i < 120; i++) {
		const p = document.createElement('p');
		p.textContent = `Content line ${i + 1}`;
		rightDiv.appendChild(p);
	}

	bottomDiv.appendChild(leftDiv);
	bottomDiv.appendChild(rightDiv);

	mStyle(container, { display: 'flex', dir: 'column', h: '100%' });
	container.appendChild(topDiv);
	container.appendChild(bottomDiv);

	let sidebarOpen = false;
	menuSymbol.addEventListener('click', () => {
		if (sidebarOpen) {
			leftDiv.style.width = '60px'; // Collapse the sidebar
		} else {
			leftDiv.style.width = '200px'; // Expand the sidebar
		}
		sidebarOpen = !sidebarOpen;
	});
	return [topDiv, leftDiv, rightDiv];;
}

