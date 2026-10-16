import java.io.*;
import java.util.ArrayList;
import java.util.List;

// All CRUD logic lives here (Create, Read, Update, Delete)
public class StudentManager {
    private final List<Student> students = new ArrayList<>();
    private final String fileName;

    public StudentManager(String fileName) {
        this.fileName = fileName;
        load();
    }

    // CREATE
    public boolean addStudent(Student s) {
        if (findById(s.getId()) != null) return false; // duplicate ID
        students.add(s);
        save();
        return true;
    }

    // READ
    public List<Student> getAll() { return students; }

    public Student findById(int id) {
        for (Student s : students) {
            if (s.getId() == id) return s;
        }
        return null;
    }

    // UPDATE
    public boolean updateStudent(int id, String name, String email, String dept, double cgpa) {
        Student s = findById(id);
        if (s == null) return false;
        s.setName(name);
        s.setEmail(email);
        s.setDepartment(dept);
        s.setCgpa(cgpa);
        save();
        return true;
    }

    // DELETE
    public boolean deleteStudent(int id) {
        Student s = findById(id);
        if (s == null) return false;
        students.remove(s);
        save();
        return true;
    }

    // File handling
    private void save() {
        try (PrintWriter pw = new PrintWriter(new FileWriter(fileName))) {
            for (Student s : students) pw.println(s.toCsv());
        } catch (IOException e) {
            System.out.println("Error saving file: " + e.getMessage());
        }
    }

    private void load() {
        File f = new File(fileName);
        if (!f.exists()) return;
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String line;
            while ((line = br.readLine()) != null) {
                if (!line.trim().isEmpty()) students.add(Student.fromCsv(line));
            }
        } catch (Exception e) {
            System.out.println("Error loading file: " + e.getMessage());
        }
    }
}
