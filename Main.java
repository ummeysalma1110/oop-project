import java.util.List;
import java.util.Scanner;

public class Main {
    static Scanner sc = new Scanner(System.in);

    static int readInt(String msg) {
        while (true) {
            System.out.print(msg);
            try {
                return Integer.parseInt(sc.nextLine().trim());
            } catch (NumberFormatException e) {
                System.out.println("Please enter a valid number!");
            }
        }
    }

    static double readDouble(String msg) {
        while (true) {
            System.out.print(msg);
            try {
                return Double.parseDouble(sc.nextLine().trim());
            } catch (NumberFormatException e) {
                System.out.println("Please enter a valid number!");
            }
        }
    }

    static String readLine(String msg) {
        System.out.print(msg);
        return sc.nextLine().trim();
    }

    public static void main(String[] args) {
        StudentManager manager = new StudentManager("students.csv");

        while (true) {
            System.out.println("\n===== Student Management System =====");
            System.out.println("1. Add Student");
            System.out.println("2. View All Students");
            System.out.println("3. Search Student by ID");
            System.out.println("4. Update Student");
            System.out.println("5. Delete Student");
            System.out.println("6. Exit");
            int choice = readInt("Enter choice: ");

            switch (choice) {
                case 1:
                    int id = readInt("ID: ");
                    String name = readLine("Name: ");
                    String email = readLine("Email: ");
                    String dept = readLine("Department: ");
                    double cgpa = readDouble("CGPA: ");
                    if (manager.addStudent(new Student(id, name, email, dept, cgpa)))
                        System.out.println("Student added successfully!");
                    else
                        System.out.println("A student with this ID already exists!");
                    break;

                case 2:
                    List<Student> all = manager.getAll();
                    if (all.isEmpty()) {
                        System.out.println("No students found.");
                    } else {
                        System.out.printf("%-6s %-20s %-25s %-8s %s%n", "ID", "Name", "Email", "Dept", "CGPA");
                        for (Student s : all) System.out.println(s);
                    }
                    break;

                case 3:
                    Student found = manager.findById(readInt("Enter ID: "));
                    System.out.println(found != null ? found : "Student not found.");
                    break;

                case 4:
                    int uid = readInt("Enter ID to update: ");
                    if (manager.findById(uid) == null) {
                        System.out.println("Student not found.");
                        break;
                    }
                    String n = readLine("New Name: ");
                    String e = readLine("New Email: ");
                    String d = readLine("New Department: ");
                    double c = readDouble("New CGPA: ");
                    manager.updateStudent(uid, n, e, d, c);
                    System.out.println("Student updated successfully!");
                    break;

                case 5:
                    int did = readInt("Enter ID to delete: ");
                    if (manager.deleteStudent(did))
                        System.out.println("Student deleted successfully!");
                    else
                        System.out.println("Student not found.");
                    break;

                case 6:
                    System.out.println("Goodbye!");
                    return;

                default:
                    System.out.println("Invalid choice, try again.");
            }
        }
    }
}
