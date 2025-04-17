**Dance Booking System (Motion Studio)**

-----------------------------------------------------

#Setup Instructions:

1. ** Download or Clone the Repository **
	- Download the ZIP file or clone the repository from https://github.com/w174rdx/Motion-Studio.git
	- For SSH: git clone git@github.com:w174rdx/Motion-Studio.git
	- For HTTPS: git clone https://github.com/w174rdx/Motion-Studio.git
	- Alternatively, you can download the .ZIP directly from https://github.com/w174rdx/Motion-Studio.git

2. ** Navigate to the Project Folder **
	- Open terminal or CMD on your preferred system
	- Use the 'cd' command to navigate to the project folder, for example:
	- cd /path/Motion-Studio (replace /path/ with the actual path to your directory)

3. (OPTIONAL) ** Remove Existing Dependencies **

There is an active bug (sometimes) affecting the starting/re-starting of the Node server. A temporary fix I found is removing the node_modules folder and package-lock.json file with the following code at each start/re-start:
	
	- In your terminal or CMD use:

		rm -rf /Path/Motion-Studio/node_modules
		rm /Path/Motion-Studio/package-lock.json
		npm install

	- Ensure that you change the /path/ to your actual directory where the files are saved!

4. ** Start the Server **
	- Once the removal of dependencies and the fresh installation is complete, you can start the server.
	- use 'npm start'
	- You should see this message when the Node server started successfully: Server running at http://localhost:3000

5. ** Access the Booking System **
	- Open your preferred browser and enter: http://localhost:3000


Please consider reporting any bugs or future improvements on my GitHub repository.

-----------------------------------------------------

## FEATURES ##

1. Home Page:
	- Greeting with a short sub-message and prompted to explore courses by clicking the "Explore Courses" button
	- Short message boxes explaining why Motion Studio is the "right" choice
	- Button to login page

2. About Page:
	- Short mission statement from Motion Studio
	- Team cards with brief information
	- Explore courses button

3. Course/Class Page:
	- List of courses/classes with picture, name and duration
	- Clicking on the name of a course/class will take the user to a detailed view
	- On the detailed information page the user can see data, time, description, location and price
	- Users may book the course/class on this page
	- Logged in users cannot book the same course/class twice

4. Login Page:
	- Users may enter email and password to login
	- Invalid credentials will prompt an error message
	- Register link

5. Register Page
	- Users may register using their preferred name, email address and password
	- Invalid email addresses will prompt an error message
	- Login link

6. Organiser Features:
	- Add, delete, edit courses/classes
	- View class list for each course/class
	- Organiser management (Add or delete organiser)
	- Same features as non/logged in users

7. User Features
	- Same features as non-logged in users
	- Logged in users may only book a course/class once



