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



