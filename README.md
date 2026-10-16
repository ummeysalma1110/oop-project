# Student Management System

This project includes the original Java console application and a standalone browser-based presentation UI.

## Open the presentation UI

Open `index.html` in a modern browser. No build tools or server are required.

The dashboard starts with sample student records inspired by `students.csv`. You can search, filter by department, sort the directory, add/edit/delete records, and export the directory as CSV. Browser changes are saved in local storage for the current browser.

The HTML/CSS/JavaScript demo does **not** connect to the Java application or change its backend. The Java console program continues to use `students.csv` independently.

## Run the Java application

Compile and run the existing Java files from this directory:

```text
javac Main.java Person.java Student.java StudentManager.java
java Main
```
