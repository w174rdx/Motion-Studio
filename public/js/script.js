document.addEventListener('DOMContentLoaded', () => {
    const classesContainer = document.getElementById('classes-container');
    const addClassButton = document.getElementById('add-class');
    let classIndex = 1; // Start with 1 since we already have classes[0]

    // Add a new class entry
    addClassButton.addEventListener('click', () => {
        const classEntry = document.createElement('div');
        classEntry.classList.add('class-entry');
        classEntry.innerHTML = `
            <label>Date: <input type="date" name="classes[${classIndex}][date]" required></label><br>
            <label>Time: <input type="time" name="classes[${classIndex}][time]" required></label><br>
            <label>Description: <input type="text" name="classes[${classIndex}][description]" required></label><br>
            <label>Location: <input type="text" name="classes[${classIndex}][location]" required></label><br>
            <label>Price: <input type="text" name="classes[${classIndex}][price]" required></label><br>
            <button type="button" class="remove-class">Remove Class</button>
            <hr>
        `;
        classesContainer.appendChild(classEntry);
        classIndex++;

        // Attach remove event to the new button
        classEntry.querySelector('.remove-class').addEventListener('click', () => {
            classesContainer.removeChild(classEntry);
        });
    });

    // Remove initial class entry (if needed)
    classesContainer.querySelectorAll('.remove-class').forEach(button => {
        button.addEventListener('click', (e) => {
            const entry = e.target.closest('.class-entry');
            classesContainer.removeChild(entry);
        });
    });
});