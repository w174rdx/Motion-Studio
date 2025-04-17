// Waits for the DOM to be fully loaded before executing
document.addEventListener('DOMContentLoaded', () => {
    // Retrieves the container for class entries
    const classesContainer = document.getElementById('classes-container');
    // Retrieves the button to add a new class
    const addClassButton = document.getElementById('add-class');
    // Initialises counter for class indexing, starting at 1 as classes[0] exists
    let classIndex = 1;

    // Adds a new class entry when the add class button is clicked
    addClassButton.addEventListener('click', () => {
        // Creates a new div element for the class entry
        const classEntry = document.createElement('div');
        // Adds the class-entry styling to the new div
        classEntry.classList.add('class-entry');
        // Defines the HTML structure for the class entry form fields
        classEntry.innerHTML = `
            <label>Date: <input type="date" name="classes[${classIndex}][date]" required></label><br>
            <label>Time: <input type="time" name="classes[${classIndex}][time]" required></label><br>
            <label>Description: <input type="text" name="classes[${classIndex}][description]" required></label><br>
            <label>Location: <input type="text" name="classes[${classIndex}][location]" required></label><br>
            <label>Price: <input type="text" name="classes[${classIndex}][price]" required></label><br>
            <button type="button" class="remove-class">Remove Class</button>
            <hr>
        `;
        // New class entry to the container
        classesContainer.appendChild(classEntry);
        classIndex++;

        // Remove button of the new class entry
        classEntry.querySelector('.remove-class').addEventListener('click', () => {
            // Removes the class when the remove button is clicked
            classesContainer.removeChild(classEntry);
        });
    });

    // Handles removal
    classesContainer.querySelectorAll('.remove-class').forEach(button => {
        // Adds a click event to remove buttons
        button.addEventListener('click', (e) => {
            const entry = e.target.closest('.class-entry');
            // Removes the class entry from the container
            classesContainer.removeChild(entry);
        });
    });
});